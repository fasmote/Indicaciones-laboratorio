// ===================================================================
// 📥 SCRIPT DE REIMPORTACIÓN COMPLETA DESDE EXCEL
// ===================================================================
//
// Este script reimporta TODA la base de datos desde el Excel original.
// Va despacio, tabla por tabla, con logs detallados.
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
  '../../docs originales/[REVISAR]Tabla de indicaciones para pacientes actualizada 2024 (enviada por la RED).xlsx'
);

console.log('\n========================================');
console.log('🚀 REIMPORTACIÓN COMPLETA DE BASE DE DATOS');
console.log('========================================\n');
console.log(`📁 Archivo Excel: ${RUTA_EXCEL}\n`);

// ===================================================================
// PASO 1: LEER EXCEL
// ===================================================================

async function paso1_LeerExcel() {
  console.log('📖 PASO 1: Leyendo archivo Excel...');

  const workbook = XLSX.readFile(RUTA_EXCEL);
  console.log(`   ✅ Excel abierto correctamente`);
  console.log(`   📋 Hojas disponibles: ${workbook.SheetNames.join(', ')}\n`);

  const sheetPracticas = workbook.Sheets['PRACTICAS'];
  if (!sheetPracticas) {
    throw new Error('❌ No se encontró la hoja PRACTICAS');
  }

  const practicas = XLSX.utils.sheet_to_json(sheetPracticas);
  console.log(`   ✅ ${practicas.length} prácticas leídas del Excel\n`);

  return { practicas, workbook };
}

// ===================================================================
// PASO 2: LIMPIAR BASE DE DATOS
// ===================================================================

async function paso2_LimpiarBaseDatos() {
  console.log('🧹 PASO 2: Limpiando base de datos...');
  console.log('   ⚠️  Esto borrará TODOS los datos existentes\n');

  try {
    // Orden de eliminación (respetando foreign keys)
    await prisma.grupoIndicacion.deleteMany({});
    console.log('   ✅ Tabla GRUPO_INDICACION limpiada');

    await prisma.practicaGrupo.deleteMany({});
    console.log('   ✅ Tabla PRACTICA_GRUPO limpiada');

    await prisma.indicacion.deleteMany({});
    console.log('   ✅ Tabla INDICACION limpiada');

    await prisma.grupo.deleteMany({});
    console.log('   ✅ Tabla GRUPO limpiada');

    await prisma.practica.deleteMany({});
    console.log('   ✅ Tabla PRACTICA limpiada');

    await prisma.area.deleteMany({});
    console.log('   ✅ Tabla AREA limpiada\n');

    console.log('   🎉 Base de datos completamente limpia\n');
  } catch (error) {
    console.error('   ❌ Error limpiando base de datos:', error.message);
    throw error;
  }
}

// ===================================================================
// PASO 3: IMPORTAR AREAS
// ===================================================================

async function paso3_ImportarAreas(practicas) {
  console.log('🏥 PASO 3: Importando AREAS...\n');

  const areasUnicas = new Set();
  practicas.forEach(p => {
    const area = String(p.AREA || '').trim().toUpperCase();
    if (area && area !== '') {
      areasUnicas.add(area);
    }
  });

  const areas = [];
  for (const nombreArea of areasUnicas) {
    const area = await prisma.area.create({
      data: {
        nombre: nombreArea,
        descripcion: `Área de ${nombreArea}`,
        activo: true
      }
    });
    areas.push(area);
    console.log(`   ✅ Área creada: ${area.nombre} (ID: ${area.id_area})`);
  }

  console.log(`\n   🎉 ${areas.length} áreas importadas\n`);
  return areas;
}

// ===================================================================
// PASO 4: IMPORTAR PRACTICAS
// ===================================================================

async function paso4_ImportarPracticas(practicas, areas) {
  console.log('🧪 PASO 4: Importando PRACTICAS...\n');

  const areaMap = {};
  areas.forEach(a => {
    areaMap[a.nombre] = a.id_area;
  });

  let creadas = 0;
  let duplicadas = 0;
  const practicasCreadas = [];
  const codigosVistos = new Set();

  for (const practicaData of practicas) {
    const codigoDid = String(practicaData.DID || '').trim();
    const nombre = String(practicaData['DESCRIPCION CONSENSUADA'] || '').trim();
    const areaTexto = String(practicaData.AREA || '').trim().toUpperCase();

    if (!nombre || nombre === '') continue;

    // Saltar duplicados
    if (codigosVistos.has(codigoDid)) {
      duplicadas++;
      continue;
    }
    codigosVistos.add(codigoDid);

    const idArea = areaMap[areaTexto] || null;

    const practica = await prisma.practica.create({
      data: {
        codigo_did: codigoDid,
        nombre: nombre,
        id_area: idArea,
        activo: true
      }
    });

    practicasCreadas.push({
      ...practica,
      textoIndicaciones: String(practicaData['INDICACIONES PARA EL PACIENTE'] || '').trim()
    });

    creadas++;
    if (creadas % 100 === 0) {
      console.log(`   📊 ${creadas} prácticas creadas...`);
    }
  }

  if (duplicadas > 0) {
    console.log(`   ⚠️  ${duplicadas} prácticas duplicadas ignoradas`);
  }

  console.log(`\n   🎉 ${creadas} prácticas importadas\n`);
  return practicasCreadas;
}

// ===================================================================
// PASO 5: IMPORTAR GRUPOS E INDICACIONES
// ===================================================================

async function paso5_ImportarGruposEIndicaciones(practicasConTexto) {
  console.log('📁 PASO 5: Importando GRUPOS e INDICACIONES...\n');
  console.log('   ℹ️  Esto puede tardar varios minutos...\n');

  const gruposMap = new Map(); // key: hash del texto, value: grupo
  const indicacionesMap = new Map(); // key: hash del texto, value: indicacion

  let gruposCreados = 0;
  let indicacionesCreadas = 0;
  let relacionesCreadas = 0;

  for (const practica of practicasConTexto) {
    const textoIndicaciones = practica.textoIndicaciones;

    // Si no tiene indicaciones, saltar
    if (!textoIndicaciones || textoIndicaciones.length < 10) {
      continue;
    }

    // Crear un hash único para este texto de indicaciones
    const hashGrupo = textoIndicaciones.toLowerCase().trim().substring(0, 100);

    let grupo;
    if (gruposMap.has(hashGrupo)) {
      // Ya existe un grupo con estas indicaciones
      grupo = gruposMap.get(hashGrupo);
    } else {
      // Crear nuevo grupo
      const nombreGrupo = `${practica.nombre.substring(0, 50)}`;

      // Extraer ayuno si existe
      const matchAyuno = textoIndicaciones.match(/(\d+)\s*(hs?|horas?)\s*de\s*ayuno/i);
      const horasAyuno = matchAyuno ? parseInt(matchAyuno[1]) : null;

      // Extraer tipo de orina si existe
      let tipoOrina = null;
      if (textoIndicaciones.match(/orina\s*de\s*24\s*(hs|horas)/i)) tipoOrina = 'ORINA_24H';
      else if (textoIndicaciones.match(/orina\s*de\s*12\s*(hs|horas)/i)) tipoOrina = 'ORINA_12H';
      else if (textoIndicaciones.match(/primera\s*orina/i)) tipoOrina = 'PRIMERA_ORINA';

      const horasOrina = tipoOrina === 'ORINA_24H' ? 24 : tipoOrina === 'ORINA_12H' ? 12 : tipoOrina === 'PRIMERA_ORINA' ? -1 : null;

      grupo = await prisma.grupo.create({
        data: {
          nombre: nombreGrupo,
          descripcion: textoIndicaciones.length > 200 ? textoIndicaciones.substring(0, 200) + '...' : textoIndicaciones,
          horas_ayuno: horasAyuno,
          tipo_orina: tipoOrina,
          horas_orina: horasOrina,
          activo: true
        }
      });

      gruposMap.set(hashGrupo, grupo);
      gruposCreados++;

      if (gruposCreados % 10 === 0) {
        console.log(`   📊 ${gruposCreados} grupos creados, ${indicacionesCreadas} indicaciones...`);
      }

      // Descomponer el texto en indicaciones individuales
      const lineas = textoIndicaciones
        .split(/[\n\r]+/)
        .map(l => l.trim())
        .filter(l => l.length > 15); // Solo líneas con al menos 15 caracteres

      // Si no hay líneas, usar el texto completo como una sola indicación
      const textosIndicaciones = lineas.length > 0 ? lineas : [textoIndicaciones];

      // Crear cada indicación
      let orden = 1;
      for (const textoInd of textosIndicaciones) {
        const hashIndicacion = textoInd.toLowerCase().trim();

        let indicacion;
        if (indicacionesMap.has(hashIndicacion)) {
          indicacion = indicacionesMap.get(hashIndicacion);
        } else {
          // Determinar tipo
          const textoLower = textoInd.toLowerCase();
          let tipo = 'GENERAL';
          if (textoLower.includes('ayuno')) tipo = 'AYUNO';
          else if (textoLower.match(/horario|entre las|hs/)) tipo = 'HORARIO';
          else if (textoLower.includes('orina')) tipo = 'ORINA';
          else if (textoLower.match(/medicaci[oó]n|medicamento/)) tipo = 'MEDICACION';

          indicacion = await prisma.indicacion.create({
            data: {
              texto: textoInd,
              tipo: tipo,
              orden: orden,
              activo: true
            }
          });

          indicacionesMap.set(hashIndicacion, indicacion);
          indicacionesCreadas++;
        }

        // Relacionar indicación con grupo (solo si no existe ya)
        const relacionExiste = await prisma.grupoIndicacion.findFirst({
          where: {
            id_grupo: grupo.id_grupo,
            id_indicacion: indicacion.id_indicacion
          }
        });

        if (!relacionExiste) {
          await prisma.grupoIndicacion.create({
            data: {
              id_grupo: grupo.id_grupo,
              id_indicacion: indicacion.id_indicacion,
              orden: orden,
              activo: true
            }
          });
        }

        orden++;
      }
    }

    // Relacionar práctica con grupo
    await prisma.practicaGrupo.create({
      data: {
        id_practica: practica.id_practica,
        id_grupo: grupo.id_grupo,
        activo: true
      }
    });

    relacionesCreadas++;
  }

  console.log(`\n   🎉 Importación completada:`);
  console.log(`      - ${gruposCreados} grupos creados`);
  console.log(`      - ${indicacionesCreadas} indicaciones creadas`);
  console.log(`      - ${relacionesCreadas} relaciones práctica-grupo creadas\n`);

  return { gruposMap, indicacionesMap };
}

// ===================================================================
// PASO 5B: IMPORTAR ATRIBUTOS DE AYUNO/ORINA
// ===================================================================

async function paso5b_ImportarAtributosAyunoOrina(workbook, gruposMap, indicacionesMap) {
  console.log('🍽️  PASO 5B: Importando atributos de AYUNO y ORINA desde PracticasAtributos...\n');

  const sheetAtributos = workbook.Sheets['PracticasAtributos'];
  if (!sheetAtributos) {
    console.log('   ⚠️  No se encontró la hoja PracticasAtributos, saltando paso...\n');
    return;
  }

  const atributos = XLSX.utils.sheet_to_json(sheetAtributos);
  console.log(`   ✅ ${atributos.length} registros de atributos leídos\n`);

  // Agrupar por nombre de práctica + atributos
  const practicasAtributos = new Map();

  for (const attr of atributos) {
    const nombrePractica = String(attr.practica_desc || '').trim();
    if (!nombrePractica) continue;

    const ayuno = attr.ayuno || null;
    const ayunoDesc = attr.ayuno_desc ? String(attr.ayuno_desc).trim() : null;
    const orina = attr.orina || null;
    const orinaDesc = attr.orina_desc ? String(attr.orina_desc).trim() : null;

    // Si no tiene ni ayuno ni orina, saltar
    if (!ayuno && !orina) continue;

    // Crear clave única: nombre + ayuno + orina
    const key = `${nombrePractica}|${ayuno || '0'}|${orina || '0'}`;

    if (!practicasAtributos.has(key)) {
      practicasAtributos.set(key, {
        nombrePractica,
        ayuno,
        ayunoDesc,
        orina,
        orinaDesc
      });
    }
  }

  console.log(`   📊 ${practicasAtributos.size} combinaciones únicas de práctica+atributos\n`);

  let gruposCreados = 0;
  let indicacionesCreadas = 0;

  for (const [key, attrs] of practicasAtributos.entries()) {
    // Buscar la práctica en la BD
    const practica = await prisma.practica.findFirst({
      where: {
        nombre: {
          contains: attrs.nombrePractica.substring(0, 50)
        }
      },
      include: {
        grupos: true
      }
    });

    if (!practica) {
      // Práctica no encontrada, saltar
      continue;
    }

    // Si la práctica ya tiene grupos, saltarla (ya fue procesada en paso 5)
    if (practica.grupos.length > 0) {
      continue;
    }

    // Crear grupo para esta práctica con solo ayuno/orina
    const nombreGrupo = practica.nombre.substring(0, 100);

    // Determinar tipo de orina
    let tipoOrina = null;
    let horasOrina = null;
    if (attrs.orina) {
      if (attrs.orina === -1) {
        tipoOrina = 'PRIMERA_ORINA';
        horasOrina = -1;
      } else if (attrs.orina === 12) {
        tipoOrina = 'ORINA_12H';
        horasOrina = 12;
      } else if (attrs.orina === 24) {
        tipoOrina = 'ORINA_24H';
        horasOrina = 24;
      } else if (attrs.orina === 2) {
        tipoOrina = 'ORINA_2H';
        horasOrina = 2;
      }
    }

    const grupo = await prisma.grupo.create({
      data: {
        nombre: nombreGrupo,
        descripcion: attrs.ayunoDesc || attrs.orinaDesc || `Atributos: ayuno ${attrs.ayuno || 0}hs, orina ${attrs.orina || 0}`,
        horas_ayuno: attrs.ayuno || null,
        tipo_orina: tipoOrina,
        horas_orina: horasOrina,
        activo: true
      }
    });

    gruposCreados++;

    // Crear indicaciones para ayuno y orina si tienen descripción
    let orden = 1;

    if (attrs.ayunoDesc) {
      // Buscar si ya existe esta indicación
      const hashIndicacion = attrs.ayunoDesc.toLowerCase().trim();
      let indicacion = indicacionesMap.get(hashIndicacion);

      if (!indicacion) {
        indicacion = await prisma.indicacion.create({
          data: {
            texto: attrs.ayunoDesc,
            tipo: 'AYUNO',
            orden: orden,
            activo: true
          }
        });
        indicacionesMap.set(hashIndicacion, indicacion);
        indicacionesCreadas++;
      }

      // Relacionar indicación con grupo
      await prisma.grupoIndicacion.create({
        data: {
          id_grupo: grupo.id_grupo,
          id_indicacion: indicacion.id_indicacion,
          orden: orden,
          activo: true
        }
      });

      orden++;
    }

    if (attrs.orinaDesc) {
      const hashIndicacion = attrs.orinaDesc.toLowerCase().trim();
      let indicacion = indicacionesMap.get(hashIndicacion);

      if (!indicacion) {
        indicacion = await prisma.indicacion.create({
          data: {
            texto: attrs.orinaDesc,
            tipo: 'ORINA',
            orden: orden,
            activo: true
          }
        });
        indicacionesMap.set(hashIndicacion, indicacion);
        indicacionesCreadas++;
      }

      await prisma.grupoIndicacion.create({
        data: {
          id_grupo: grupo.id_grupo,
          id_indicacion: indicacion.id_indicacion,
          orden: orden,
          activo: true
        }
      });
    }

    // Relacionar práctica con grupo
    await prisma.practicaGrupo.create({
      data: {
        id_practica: practica.id_practica,
        id_grupo: grupo.id_grupo,
        activo: true
      }
    });

    if (gruposCreados % 50 === 0) {
      console.log(`   📊 ${gruposCreados} grupos adicionales creados...`);
    }
  }

  console.log(`\n   🎉 Atributos importados:`);
  console.log(`      - ${gruposCreados} grupos adicionales creados`);
  console.log(`      - ${indicacionesCreadas} indicaciones adicionales creadas\n`);
}

// ===================================================================
// PASO 6: VERIFICAR IMPORTACIÓN
// ===================================================================

async function paso6_Verificar() {
  console.log('✅ PASO 6: Verificando importación...\n');

  const conteos = {
    areas: await prisma.area.count(),
    practicas: await prisma.practica.count(),
    grupos: await prisma.grupo.count(),
    indicaciones: await prisma.indicacion.count(),
    practicaGrupo: await prisma.practicaGrupo.count(),
    grupoIndicacion: await prisma.grupoIndicacion.count()
  };

  console.log('   📊 Registros en base de datos:');
  console.log(`      - AREA: ${conteos.areas}`);
  console.log(`      - PRACTICA: ${conteos.practicas}`);
  console.log(`      - GRUPO: ${conteos.grupos}`);
  console.log(`      - INDICACION: ${conteos.indicaciones}`);
  console.log(`      - PRACTICA_GRUPO: ${conteos.practicaGrupo}`);
  console.log(`      - GRUPO_INDICACION: ${conteos.grupoIndicacion}\n`);

  // Verificar ESTUDIO PARASITOLÓGICO
  console.log('   🔍 Verificando "ESTUDIO PARASITOLÓGICO SERIADO"...');
  const parasito = await prisma.practica.findFirst({
    where: {
      nombre: { contains: 'SERIADO' }
    },
    include: {
      grupos: {
        include: {
          grupo: {
            include: {
              indicaciones: true
            }
          }
        }
      }
    }
  });

  if (parasito) {
    console.log(`      ✅ Encontrada: ${parasito.nombre}`);
    console.log(`      📁 Grupos asignados: ${parasito.grupos.length}`);
    if (parasito.grupos.length > 0) {
      const grupo = parasito.grupos[0].grupo;
      console.log(`      📝 Indicaciones en el grupo: ${grupo.indicaciones.length}`);
    }
  } else {
    console.log(`      ⚠️  No se encontró la práctica`);
  }

  console.log('');

  // Verificar HEMOGRAMA
  console.log('   🔍 Verificando "HEMOGRAMA"...');
  const hemograma = await prisma.practica.findFirst({
    where: {
      nombre: { contains: 'HEMOGRAMA' }
    },
    include: {
      grupos: {
        include: {
          grupo: {
            include: {
              indicaciones: true
            }
          }
        }
      }
    }
  });

  if (hemograma) {
    console.log(`      ✅ Encontrada: ${hemograma.nombre}`);
    console.log(`      📁 Grupos asignados: ${hemograma.grupos.length}`);
    if (hemograma.grupos.length > 0) {
      const grupo = hemograma.grupos[0].grupo;
      console.log(`      ⏰ Ayuno: ${grupo.horas_ayuno || 0} horas`);
      console.log(`      💧 Orina: ${grupo.tipo_orina || 'No requiere'}`);
      console.log(`      📝 Indicaciones en el grupo: ${grupo.indicaciones.length}`);
    }
  } else {
    console.log(`      ⚠️  No se encontró la práctica`);
  }

  console.log('');
}

// ===================================================================
// FUNCIÓN PRINCIPAL
// ===================================================================

async function main() {
  try {
    const inicio = Date.now();

    // Paso 1: Leer Excel
    const { practicas, workbook } = await paso1_LeerExcel();

    // Paso 2: Limpiar BD
    await paso2_LimpiarBaseDatos();

    // Paso 3: Importar áreas
    const areas = await paso3_ImportarAreas(practicas);

    // Paso 4: Importar prácticas
    const practicasConTexto = await paso4_ImportarPracticas(practicas, areas);

    // Paso 5: Importar grupos e indicaciones
    const { gruposMap, indicacionesMap } = await paso5_ImportarGruposEIndicaciones(practicasConTexto);

    // Paso 5B: Importar atributos de ayuno/orina
    await paso5b_ImportarAtributosAyunoOrina(workbook, gruposMap, indicacionesMap);

    // Paso 6: Verificar
    await paso6_Verificar();

    const fin = Date.now();
    const tiempoTotal = Math.round((fin - inicio) / 1000);

    console.log('========================================');
    console.log('✅ IMPORTACIÓN COMPLETADA CON ÉXITO');
    console.log(`⏱️  Tiempo total: ${tiempoTotal} segundos`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA IMPORTACIÓN:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();
