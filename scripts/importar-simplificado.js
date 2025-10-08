// ===================================================================
// 📥 SCRIPT DE IMPORTACIÓN SIMPLIFICADO DESDE EXCEL
// ===================================================================
//
// Versión simplificada que solo importa prácticas y crea grupos básicos
// basándose en las indicaciones de cada práctica
//
// ===================================================================

const XLSX = require('xlsx');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===================================================================
// CONFIGURACIÓN
// ===================================================================

const RUTA_EXCEL = path.join(
  __dirname,
  '../../[ORIGINAL]Tabla de indicaciones para pacientes actualizada 2024 (enviada por la RED).xlsx'
);

const LIMPIAR_DATOS_EXISTENTES = true; // Cambiar a true para limpiar seed data

// ===================================================================
// UTILIDADES
// ===================================================================

function extraerHorasAyuno(texto) {
  if (!texto) return null;
  const match = texto.match(/(\d+)\s*(hs?|horas?)\s*de\s*ayuno/i);
  return match ? parseInt(match[1]) : null;
}

function extraerTipoOrina(texto) {
  if (!texto) return null;
  if (texto.match(/orina\s*de\s*24\s*(hs|horas)/i)) return 'ORINA_24H';
  if (texto.match(/orina\s*de\s*12\s*(hs|horas)/i)) return 'ORINA_12H';
  if (texto.match(/orina\s*de\s*2\s*(hs|horas)/i)) return 'ORINA_2H';
  if (texto.match(/primera\s*orina/i)) return 'PRIMERA_ORINA';
  return null;
}

function extraerHorasOrina(tipoOrina) {
  switch (tipoOrina) {
    case 'ORINA_24H': return 24;
    case 'ORINA_12H': return 12;
    case 'ORINA_2H': return 2;
    case 'PRIMERA_ORINA': return -1;
    default: return null;
  }
}

function descomponerIndicaciones(texto) {
  if (!texto || typeof texto !== 'string') return [];

  const partes = texto
    .split(/[\n\r]+/)
    .map(p => p.trim())
    .filter(p => p.length > 15);

  return partes.length > 0 ? partes : [texto.trim()];
}

function determinarTipoIndicacion(texto) {
  const textoLower = texto.toLowerCase();
  if (textoLower.includes('ayuno')) return 'AYUNO';
  if (textoLower.match(/horario|entre las|hs/)) return 'HORARIO';
  if (textoLower.includes('orina')) return 'ORINA';
  if (textoLower.match(/medicaci[oó]n|medicamento|droga/)) return 'MEDICACION';
  return 'GENERAL';
}

// ===================================================================
// FUNCIONES DE IMPORTACIÓN
// ===================================================================

function leerExcel() {
  console.log('📖 Leyendo archivo Excel...');
  console.log(`   Ruta: ${RUTA_EXCEL}\n`);

  const workbook = XLSX.readFile(RUTA_EXCEL);
  console.log(`   Hojas disponibles: ${workbook.SheetNames.join(', ')}\n`);

  const sheetPracticas = workbook.Sheets['PRACTICAS'];

  if (!sheetPracticas) {
    throw new Error('❌ No se encontró la hoja PRACTICAS en el Excel');
  }

  const practicas = XLSX.utils.sheet_to_json(sheetPracticas);
  console.log(`   ✅ ${practicas.length} prácticas leídas\n`);

  return { practicas };
}

async function importarAreas(practicas) {
  console.log('🏥 Importando ÁREAS...');

  const areasUnicas = [...new Set(
    practicas
      .map(p => p.AREA)
      .filter(a => a && a.trim() !== '')
  )];

  console.log(`   Áreas únicas: ${areasUnicas.length}`);

  const areasCreadas = [];

  for (const nombreArea of areasUnicas) {
    let area = await prisma.area.findFirst({
      where: { nombre: nombreArea.toUpperCase() }
    });

    if (!area) {
      area = await prisma.area.create({
        data: {
          nombre: nombreArea.toUpperCase(),
          descripcion: `Área de ${nombreArea}`,
          activo: true
        }
      });
      console.log(`   ✅ ${nombreArea}`);
    }

    areasCreadas.push(area);
  }

  console.log(`\n✅ ${areasCreadas.length} áreas procesadas\n`);
  return areasCreadas;
}

async function importarPracticasYGrupos(practicas, areas) {
  console.log('🧪 Importando PRÁCTICAS y GRUPOS...\n');

  const areaMap = {};
  for (const area of areas) {
    areaMap[area.nombre] = area.id_area;
  }

  // Map para agrupar por indicaciones iguales
  const gruposMap = new Map();

  let practicasCreadas = 0;
  let gruposCreados = 0;
  let indicacionesCreadas = 0;

  for (const practicaData of practicas) {
    try {
      const codigoDid = String(practicaData.DID || '').trim();
      const nombre = String(practicaData['DESCRIPCION CONSENSUADA'] || '').trim();
      const areaTexto = String(practicaData.AREA || '').trim().toUpperCase();
      const textoIndicaciones = String(practicaData['INDICACIONES PARA EL PACIENTE'] || '').trim();

      if (!nombre || nombre === '') continue;

      const idArea = areaMap[areaTexto] || null;

      // Verificar si la práctica ya existe
      let practica = await prisma.practica.findFirst({
        where: { codigo_did: codigoDid }
      });

      if (!practica) {
        practica = await prisma.practica.create({
          data: {
            codigo_did: codigoDid,
            nombre: nombre,
            id_area: idArea,
            activo: true
          }
        });
        practicasCreadas++;

        if (practicasCreadas % 100 === 0) {
          console.log(`   📊 ${practicasCreadas} prácticas creadas...`);
        }
      }

      // Si tiene indicaciones, crear/buscar grupo
      if (textoIndicaciones && textoIndicaciones.length > 10) {
        // Usar el texto como key para agrupar
        let grupo;

        if (gruposMap.has(textoIndicaciones)) {
          grupo = gruposMap.get(textoIndicaciones);
        } else {
          // Crear nuevo grupo
          const horasAyuno = extraerHorasAyuno(textoIndicaciones);
          const tipoOrina = extraerTipoOrina(textoIndicaciones);
          const horasOrina = extraerHorasOrina(tipoOrina);
          const nombreGrupo = textoIndicaciones.substring(0, 100).replace(/\n/g, ' ');

          grupo = await prisma.grupo.create({
            data: {
              nombre: nombreGrupo,
              descripcion: textoIndicaciones.substring(0, 500),
              horas_ayuno: horasAyuno,
              tipo_orina: tipoOrina,
              horas_orina: horasOrina,
              activo: true
            }
          });

          gruposCreados++;
          gruposMap.set(textoIndicaciones, grupo);

          // Crear indicaciones atómicas para este grupo
          const partesIndicaciones = descomponerIndicaciones(textoIndicaciones);
          let orden = 1;

          for (const textoIndicacion of partesIndicaciones) {
            // Verificar si existe
            let indicacion = await prisma.indicacion.findFirst({
              where: { texto: textoIndicacion }
            });

            if (!indicacion) {
              const tipo = determinarTipoIndicacion(textoIndicacion);
              indicacion = await prisma.indicacion.create({
                data: {
                  texto: textoIndicacion,
                  tipo: tipo,
                  orden: indicacionesCreadas + orden,
                  activo: true
                }
              });
              indicacionesCreadas++;
            }

            // Vincular grupo con indicación
            const existe = await prisma.grupoIndicacion.findFirst({
              where: {
                id_grupo: grupo.id_grupo,
                id_indicacion: indicacion.id_indicacion
              }
            });

            if (!existe) {
              await prisma.grupoIndicacion.create({
                data: {
                  id_grupo: grupo.id_grupo,
                  id_indicacion: indicacion.id_indicacion,
                  orden: orden++,
                  activo: true
                }
              });
            }
          }
        }

        // Vincular práctica con grupo
        const existe = await prisma.practicaGrupo.findFirst({
          where: {
            id_practica: practica.id_practica,
            id_grupo: grupo.id_grupo
          }
        });

        if (!existe) {
          await prisma.practicaGrupo.create({
            data: {
              id_practica: practica.id_practica,
              id_grupo: grupo.id_grupo,
              activo: true
            }
          });
        }
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n✅ RESUMEN:`);
  console.log(`   - Prácticas: ${practicasCreadas}`);
  console.log(`   - Grupos: ${gruposCreados}`);
  console.log(`   - Indicaciones: ${indicacionesCreadas}\n`);

  return { practicasCreadas, gruposCreados, indicacionesCreadas };
}

// ===================================================================
// FUNCIÓN PRINCIPAL
// ===================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📥 IMPORTACIÓN SIMPLIFICADA DESDE EXCEL                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Limpiar datos si se solicita
    if (LIMPIAR_DATOS_EXISTENTES) {
      console.log('🗑️  Limpiando datos existentes...\n');
      await prisma.grupoIndicacion.deleteMany({});
      await prisma.practicaGrupo.deleteMany({});
      await prisma.reglaAlternativa.deleteMany({});
      await prisma.indicacion.deleteMany({});
      await prisma.grupo.deleteMany({});
      await prisma.practica.deleteMany({});
      await prisma.area.deleteMany({});
      console.log('✅ Datos eliminados\n');
    }

    // 1. Leer Excel
    const { practicas } = leerExcel();

    // 2. Importar áreas
    const areas = await importarAreas(practicas);

    // 3. Importar prácticas y crear grupos automáticamente
    const stats = await importarPracticasYGrupos(practicas, areas);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ IMPORTACIÓN COMPLETADA                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🎉 ¡Importación exitosa!\n');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();
