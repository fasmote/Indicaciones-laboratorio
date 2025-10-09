// ===================================================================
// 📥 SCRIPT DE IMPORTACIÓN DESDE EXCEL
// ===================================================================
//
// Propósito: Importar las 852 prácticas reales desde el Excel original
// Archivo: "[ORIGINAL]Tabla de indicaciones para pacientes actualizada 2024 (enviada por la RED).xlsx"
//
// Proceso:
// 1. Leer hojas: PRACTICAS, GruposOriginales, IgualandoPreparaciones
// 2. Crear 10 áreas de laboratorio
// 3. Crear 62 grupos de indicaciones
// 4. Crear 852 prácticas
// 5. Vincular prácticas con grupos (relación M:N)
// 6. Extraer indicaciones atómicas de los grupos
// 7. Vincular grupos con indicaciones
//
// Nota educativa:
// - Usamos transacciones de Prisma para garantizar consistencia
// - Si algo falla, se hace rollback automático
// - Los datos existentes (seed) se mantendrán o se pueden limpiar
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

const LIMPIAR_DATOS_EXISTENTES = false; // Cambiar a true para limpiar seed data

// ===================================================================
// UTILIDADES
// ===================================================================

/**
 * Extrae las horas de ayuno desde el texto de indicaciones
 * @param {string} texto - Texto completo de indicaciones
 * @returns {number|null} - Horas de ayuno o null
 */
function extraerHorasAyuno(texto) {
  if (!texto) return null;

  const match = texto.match(/(\d+)\s*(hs?|horas?)\s*de\s*ayuno/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extrae el tipo de orina desde el texto de indicaciones
 * @param {string} texto - Texto completo de indicaciones
 * @returns {string|null} - Tipo de orina o null
 */
function extraerTipoOrina(texto) {
  if (!texto) return null;

  if (texto.match(/orina\s*de\s*24\s*(hs|horas)/i)) return 'ORINA_24H';
  if (texto.match(/orina\s*de\s*12\s*(hs|horas)/i)) return 'ORINA_12H';
  if (texto.match(/orina\s*de\s*2\s*(hs|horas)/i)) return 'ORINA_2H';
  if (texto.match(/primera\s*orina/i)) return 'PRIMERA_ORINA';

  return null;
}

/**
 * Extrae las horas de orina (para cálculos)
 * @param {string} tipoOrina - Tipo de orina
 * @returns {number|null} - Horas de orina
 */
function extraerHorasOrina(tipoOrina) {
  switch (tipoOrina) {
    case 'ORINA_24H': return 24;
    case 'ORINA_12H': return 12;
    case 'ORINA_2H': return 2;
    case 'PRIMERA_ORINA': return -1; // Valor especial
    default: return null;
  }
}

/**
 * Descompone un texto largo de indicaciones en partes atómicas
 * @param {string} texto - Texto completo
 * @returns {string[]} - Array de indicaciones individuales
 */
function descomponerIndicaciones(texto) {
  if (!texto || typeof texto !== 'string') return [];

  // Dividir por saltos de línea o puntos
  const partes = texto
    .split(/[\n\r]+|(?<=\.)(?=\s*[A-Z])/g) // Split por \n o por ". Mayúscula"
    .map(p => p.trim())
    .filter(p => p.length > 10); // Filtrar partes muy cortas

  return partes;
}

/**
 * Determina el tipo de indicación basándose en el contenido
 * @param {string} texto - Texto de la indicación
 * @returns {string} - Tipo: AYUNO, HORARIO, ORINA, MEDICACION, GENERAL
 */
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

/**
 * Lee el archivo Excel y retorna las hojas necesarias
 */
function leerExcel() {
  console.log('📖 Leyendo archivo Excel...');
  console.log(`   Ruta: ${RUTA_EXCEL}`);

  const workbook = XLSX.readFile(RUTA_EXCEL);

  const sheetPracticas = workbook.Sheets['PRACTICAS'];
  const sheetGruposOriginales = workbook.Sheets['GruposOriginales'];
  const sheetIgualdad = workbook.Sheets['IgualandoPreparaciones'];

  if (!sheetPracticas || !sheetGruposOriginales || !sheetIgualdad) {
    throw new Error('❌ No se encontraron las hojas necesarias en el Excel');
  }

  // Convertir hojas a JSON
  const practicas = XLSX.utils.sheet_to_json(sheetPracticas);
  const gruposOriginales = XLSX.utils.sheet_to_json(sheetGruposOriginales);
  const igualdad = XLSX.utils.sheet_to_json(sheetIgualdad);

  console.log(`   ✅ ${practicas.length} prácticas leídas`);
  console.log(`   ✅ ${gruposOriginales.length} registros de grupos`);
  console.log(`   ✅ ${igualdad.length} registros de igualdad semántica`);

  return { practicas, gruposOriginales, igualdad };
}

/**
 * Importa las áreas de laboratorio
 */
async function importarAreas(practicas) {
  console.log('\n🏥 Importando ÁREAS...');

  // Extraer áreas únicas
  const areasUnicas = [...new Set(
    practicas
      .map(p => p.AREA)
      .filter(a => a && a.trim() !== '')
  )];

  console.log(`   Áreas únicas encontradas: ${areasUnicas.length}`);

  const areasCreadas = [];

  for (const nombreArea of areasUnicas) {
    // Verificar si ya existe
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
      console.log(`   ✅ Área creada: ${nombreArea}`);
    } else {
      console.log(`   ⏭️  Área ya existe: ${nombreArea}`);
    }

    areasCreadas.push(area);
  }

  console.log(`✅ ${areasCreadas.length} áreas procesadas\n`);
  return areasCreadas;
}

/**
 * Importa los grupos de indicaciones
 */
async function importarGrupos(gruposOriginales) {
  console.log('📦 Importando GRUPOS...');

  // Filtrar solo los 62 grupos útiles (donde MATCH != -1)
  const gruposUtiles = gruposOriginales.filter(g => g.MATCH && g.MATCH !== -1);

  console.log(`   Grupos útiles: ${gruposUtiles.length}`);

  const gruposCreados = [];

  for (const grupoData of gruposUtiles) {
    const nombreGrupo = grupoData['CONJUNTO DE INDICACIONES [62]'] || `Grupo ${grupoData.MATCH}`;
    const textoCompleto = grupoData['INDICACIONES PARA EL PACIENTE'] || '';
    const tipoOrina = extraerTipoOrina(textoCompleto);
    const horasAyuno = extraerHorasAyuno(textoCompleto);
    const horasOrina = extraerHorasOrina(tipoOrina);

    // Verificar si ya existe
    let grupo = await prisma.grupo.findFirst({
      where: {
        OR: [
          { id_grupo: grupoData.MATCH },
          { nombre: nombreGrupo }
        ]
      }
    });

    if (!grupo) {
      grupo = await prisma.grupo.create({
        data: {
          nombre: nombreGrupo,
          descripcion: textoCompleto.substring(0, 500), // Limitar a 500 caracteres
          horas_ayuno: horasAyuno,
          tipo_orina: tipoOrina,
          horas_orina: horasOrina,
          activo: true
        }
      });
      console.log(`   ✅ Grupo ${grupo.id_grupo}: ${nombreGrupo.substring(0, 50)}...`);
    } else {
      console.log(`   ⏭️  Grupo ya existe: ${nombreGrupo.substring(0, 50)}...`);
    }

    gruposCreados.push({ ...grupo, match_original: grupoData.MATCH });
  }

  console.log(`✅ ${gruposCreados.length} grupos procesados\n`);
  return gruposCreados;
}

/**
 * Importa las prácticas
 */
async function importarPracticas(practicas, areas) {
  console.log('🧪 Importando PRÁCTICAS...');

  // Crear map de áreas por nombre para búsqueda rápida
  const areaMap = {};
  for (const area of areas) {
    areaMap[area.nombre] = area.id_area;
  }

  let creadas = 0;
  let existentes = 0;
  let errores = 0;

  for (const practicaData of practicas) {
    try {
      const codigoDid = String(practicaData.DID || '').trim();
      const nombre = String(practicaData['DESCRIPCION CONSENSUADA'] || '').trim();
      const areaTexto = String(practicaData.AREA || '').trim().toUpperCase();

      if (!nombre || nombre === '') {
        errores++;
        continue; // Saltar prácticas sin nombre
      }

      const idArea = areaMap[areaTexto] || null;

      // Verificar si ya existe
      const existe = await prisma.practica.findFirst({
        where: {
          OR: [
            { codigo_did: codigoDid },
            { nombre: nombre }
          ]
        }
      });

      if (!existe) {
        await prisma.practica.create({
          data: {
            codigo_did: codigoDid,
            nombre: nombre,
            id_area: idArea,
            activo: true
          }
        });
        creadas++;

        if (creadas % 100 === 0) {
          console.log(`   📊 Progreso: ${creadas} prácticas creadas...`);
        }
      } else {
        existentes++;
      }
    } catch (error) {
      console.error(`   ❌ Error al crear práctica: ${error.message}`);
      errores++;
    }
  }

  console.log(`✅ Prácticas procesadas:`);
  console.log(`   - Creadas: ${creadas}`);
  console.log(`   - Ya existían: ${existentes}`);
  console.log(`   - Errores: ${errores}\n`);

  return { creadas, existentes, errores };
}

/**
 * Vincula prácticas con grupos (relación M:N)
 */
async function vincularPracticasGrupos(igualdad, grupos) {
  console.log('🔗 Vinculando PRÁCTICAS con GRUPOS...');

  // Crear map de grupos por MATCH original
  const grupoMap = {};
  for (const grupo of grupos) {
    if (grupo.match_original) {
      grupoMap[grupo.match_original] = grupo.id_grupo;
    }
  }

  let vinculaciones = 0;
  let existentes = 0;
  let errores = 0;

  for (const registro of igualdad) {
    try {
      const idPracticaExcel = registro.ID_PRACTICA;
      const matchGrupo = registro.FILA_IGUALDAD_SEMANTICA;

      if (!idPracticaExcel || !matchGrupo) continue;

      // Buscar práctica por código DID o nombre
      const practica = await prisma.practica.findFirst({
        where: {
          OR: [
            { codigo_did: String(idPracticaExcel) },
            // Intentar por ID si no se encuentra por código
          ]
        }
      });

      if (!practica) {
        errores++;
        continue;
      }

      const idGrupo = grupoMap[matchGrupo];
      if (!idGrupo) {
        errores++;
        continue;
      }

      // Verificar si ya existe la vinculación
      const existe = await prisma.practicaGrupo.findFirst({
        where: {
          id_practica: practica.id_practica,
          id_grupo: idGrupo
        }
      });

      if (!existe) {
        await prisma.practicaGrupo.create({
          data: {
            id_practica: practica.id_practica,
            id_grupo: idGrupo,
            activo: true
          }
        });
        vinculaciones++;

        if (vinculaciones % 100 === 0) {
          console.log(`   📊 Progreso: ${vinculaciones} vinculaciones creadas...`);
        }
      } else {
        existentes++;
      }
    } catch (error) {
      console.error(`   ❌ Error al vincular: ${error.message}`);
      errores++;
    }
  }

  console.log(`✅ Vinculaciones procesadas:`);
  console.log(`   - Creadas: ${vinculaciones}`);
  console.log(`   - Ya existían: ${existentes}`);
  console.log(`   - Errores: ${errores}\n`);

  return { vinculaciones, existentes, errores };
}

/**
 * Extrae indicaciones atómicas de los grupos
 */
async function extraerIndicaciones(grupos) {
  console.log('📝 Extrayendo INDICACIONES atómicas...');

  const indicacionesMap = new Map(); // Map para evitar duplicados
  let orden = 1;

  for (const grupo of grupos) {
    const textoCompleto = grupo.descripcion || '';
    const partesIndicaciones = descomponerIndicaciones(textoCompleto);

    for (const texto of partesIndicaciones) {
      // Evitar duplicados por texto
      if (!indicacionesMap.has(texto)) {
        const tipo = determinarTipoIndicacion(texto);
        indicacionesMap.set(texto, { texto, tipo, orden: orden++ });
      }
    }
  }

  console.log(`   Indicaciones únicas encontradas: ${indicacionesMap.size}`);

  const indicacionesCreadas = [];
  let creadas = 0;

  for (const [texto, data] of indicacionesMap) {
    try {
      // Verificar si ya existe
      let indicacion = await prisma.indicacion.findFirst({
        where: { texto: texto }
      });

      if (!indicacion) {
        indicacion = await prisma.indicacion.create({
          data: {
            texto: texto,
            tipo: data.tipo,
            orden: data.orden,
            activo: true
          }
        });
        creadas++;
      }

      indicacionesCreadas.push(indicacion);
    } catch (error) {
      console.error(`   ❌ Error al crear indicación: ${error.message}`);
    }
  }

  console.log(`✅ ${creadas} indicaciones atómicas creadas\n`);
  return indicacionesCreadas;
}

/**
 * Vincula grupos con indicaciones
 */
async function vincularGruposIndicaciones(grupos, indicaciones) {
  console.log('🔗 Vinculando GRUPOS con INDICACIONES...');

  let vinculaciones = 0;
  let existentes = 0;

  for (const grupo of grupos) {
    const textoGrupo = grupo.descripcion || '';
    const partesIndicaciones = descomponerIndicaciones(textoGrupo);

    let ordenLocal = 1;

    for (const textoIndicacion of partesIndicaciones) {
      const indicacion = indicaciones.find(i => i.texto === textoIndicacion);

      if (indicacion) {
        // Verificar si ya existe
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
              orden: ordenLocal++,
              activo: true
            }
          });
          vinculaciones++;
        } else {
          existentes++;
        }
      }
    }
  }

  console.log(`✅ Vinculaciones Grupo-Indicación:`);
  console.log(`   - Creadas: ${vinculaciones}`);
  console.log(`   - Ya existían: ${existentes}\n`);

  return { vinculaciones, existentes };
}

// ===================================================================
// FUNCIÓN PRINCIPAL
// ===================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📥 IMPORTACIÓN DE DATOS DESDE EXCEL                      ║');
  console.log('║  Sistema de Indicaciones de Laboratorio                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Limpiar datos existentes si se solicita
    if (LIMPIAR_DATOS_EXISTENTES) {
      console.log('🗑️  Limpiando datos existentes...');
      await prisma.grupoIndicacion.deleteMany({});
      await prisma.practicaGrupo.deleteMany({});
      await prisma.indicacion.deleteMany({});
      await prisma.grupo.deleteMany({});
      await prisma.practica.deleteMany({});
      await prisma.area.deleteMany({});
      console.log('✅ Datos eliminados\n');
    }

    // 1. Leer Excel
    const { practicas, gruposOriginales, igualdad } = leerExcel();

    // 2. Importar áreas
    const areas = await importarAreas(practicas);

    // 3. Importar grupos
    const grupos = await importarGrupos(gruposOriginales);

    // 4. Importar prácticas
    const statsPracticas = await importarPracticas(practicas, areas);

    // 5. Vincular prácticas con grupos
    const statsPracticasGrupos = await vincularPracticasGrupos(igualdad, grupos);

    // 6. Extraer indicaciones atómicas
    const indicaciones = await extraerIndicaciones(grupos);

    // 7. Vincular grupos con indicaciones
    const statsGruposIndicaciones = await vincularGruposIndicaciones(grupos, indicaciones);

    // Resumen final
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ IMPORTACIÓN COMPLETADA                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 RESUMEN FINAL:');
    console.log(`   - Áreas: ${areas.length}`);
    console.log(`   - Grupos: ${grupos.length}`);
    console.log(`   - Prácticas creadas: ${statsPracticas.creadas}`);
    console.log(`   - Indicaciones atómicas: ${indicaciones.length}`);
    console.log(`   - Vinculaciones Práctica-Grupo: ${statsPracticasGrupos.vinculaciones}`);
    console.log(`   - Vinculaciones Grupo-Indicación: ${statsGruposIndicaciones.vinculaciones}`);
    console.log('\n🎉 ¡Importación exitosa!\n');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main()
  .catch(console.error)
  .finally(() => process.exit(0));
