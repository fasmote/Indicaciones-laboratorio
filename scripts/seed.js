// ====================================
// SCRIPT DE SEED - Datos de Ejemplo
// ====================================
//
// Este script carga datos de ejemplo en la base de datos.
// Útil para desarrollo y testing.
//
// Ejecutar con: npm run db:seed
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Un "seed" es cargar datos iniciales en una base de datos vacía.
// En este caso, creamos:
// - 3 áreas de laboratorio
// - 10 prácticas de ejemplo
// - 5 grupos de indicaciones
// - 10 indicaciones
// - Relaciones entre ellos
//
// Esto permite probar el sistema sin necesidad de importar el Excel completo.
//
// ====================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  try {
    // ====================================
    // 1. Limpiar datos existentes (opcional)
    // ====================================
    console.log('🗑️  Limpiando datos existentes...');

    await prisma.grupoIndicacion.deleteMany();
    await prisma.practicaGrupo.deleteMany();
    await prisma.reglaAlternativa.deleteMany();
    await prisma.indicacion.deleteMany();
    await prisma.grupo.deleteMany();
    await prisma.practica.deleteMany();
    await prisma.area.deleteMany();

    console.log('✅ Datos limpiados\n');

    // ====================================
    // 2. Crear Áreas
    // ====================================
    console.log('📁 Creando áreas...');

    const areas = await Promise.all([
      prisma.area.create({
        data: {
          nombre: 'VIROLOGIA',
          descripcion: 'Estudios virológicos y PCR'
        }
      }),
      prisma.area.create({
        data: {
          nombre: 'QUIMICA',
          descripcion: 'Química clínica y bioquímica'
        }
      }),
      prisma.area.create({
        data: {
          nombre: 'BACTERIO',
          descripcion: 'Bacteriología y cultivos'
        }
      }),
      prisma.area.create({
        data: {
          nombre: 'HEMATO/HEMOSTASIA',
          descripcion: 'Hematología y hemostasia'
        }
      }),
      prisma.area.create({
        data: {
          nombre: 'ENDOCRINO',
          descripcion: 'Endocrinología y hormonas'
        }
      })
    ]);

    console.log(`✅ ${areas.length} áreas creadas\n`);

    // ====================================
    // 3. Crear Indicaciones Atómicas
    // ====================================
    console.log('📝 Creando indicaciones...');

    const indicaciones = await Promise.all([
      // Indicaciones de AYUNO
      prisma.indicacion.create({
        data: {
          texto: 'Concurrir al Laboratorio con 8 horas de ayuno',
          tipo: 'AYUNO',
          orden: 1
        }
      }),
      prisma.indicacion.create({
        data: {
          texto: 'Concurrir al Laboratorio con 4 horas de ayuno',
          tipo: 'AYUNO',
          orden: 2
        }
      }),

      // Indicaciones de ORINA
      prisma.indicacion.create({
        data: {
          texto: 'Recolectar la primera orina de la mañana en frasco estéril. Lavar bien los genitales antes de recolectar la muestra.',
          tipo: 'ORINA',
          orden: 1
        }
      }),
      prisma.indicacion.create({
        data: {
          texto: 'Recolectar toda la orina de 24 horas. Comenzar descartando la primera orina de la mañana y recolectar todas las siguientes incluyendo la primera del día siguiente.',
          tipo: 'ORINA',
          orden: 2
        }
      }),
      prisma.indicacion.create({
        data: {
          texto: 'Recolectar orina de 12 horas (nocturna). Descartar la orina de las 20hs y recolectar toda la orina hasta las 8hs del día siguiente.',
          tipo: 'ORINA',
          orden: 3
        }
      }),

      // Indicaciones GENERALES
      prisma.indicacion.create({
        data: {
          texto: 'Traer orden médica actualizada',
          tipo: 'GENERAL',
          orden: 1
        }
      }),
      prisma.indicacion.create({
        data: {
          texto: 'Concurrir con documento de identidad',
          tipo: 'GENERAL',
          orden: 2
        }
      }),

      // Indicaciones de MEDICACIÓN
      prisma.indicacion.create({
        data: {
          texto: 'No tomar medicación anticoagulante 24 horas antes del estudio (consultar con su médico)',
          tipo: 'MEDICACION',
          orden: 1
        }
      }),

      // Indicaciones de HORARIO
      prisma.indicacion.create({
        data: {
          texto: 'Concurrir entre las 7:00 y las 9:00 hs',
          tipo: 'HORARIO',
          orden: 1
        }
      }),

      // Indicaciones de MATERIA FECAL
      prisma.indicacion.create({
        data: {
          texto: 'Recolectar materia fecal del tamaño de una nuez en frasco limpio y seco. No mezclar con orina.',
          tipo: 'MATERIA_FECAL',
          orden: 1
        }
      })
    ]);

    console.log(`✅ ${indicaciones.length} indicaciones creadas\n`);

    // ====================================
    // 4. Crear Grupos
    // ====================================
    console.log('📋 Creando grupos...');

    const grupos = await Promise.all([
      // Grupo 1: Ayuno 8 horas (el más común)
      prisma.grupo.create({
        data: {
          nombre: 'Concurrir al Laboratorio con 8 hs de ayuno',
          descripcion: 'Grupo de prácticas que requieren ayuno de 8 horas',
          horas_ayuno: 8,
          tipo_orina: null,
          horas_orina: null
        }
      }),

      // Grupo 2: Ayuno 4 horas
      prisma.grupo.create({
        data: {
          nombre: 'Concurrir al Laboratorio con 4 hs de ayuno',
          descripcion: 'Grupo de prácticas que requieren ayuno de 4 horas',
          horas_ayuno: 4,
          tipo_orina: null,
          horas_orina: null
        }
      }),

      // Grupo 3: Primera orina de la mañana
      prisma.grupo.create({
        data: {
          nombre: 'PRIMERA ORINA DE LA MAÑANA',
          descripcion: 'Prácticas que requieren primera orina de la mañana',
          horas_ayuno: null,
          tipo_orina: 'PRIMERA_ORINA',
          horas_orina: -1
        }
      }),

      // Grupo 4: Orina de 24 horas
      prisma.grupo.create({
        data: {
          nombre: 'ORINA DE 24 HORAS',
          descripcion: 'Prácticas que requieren recolección de orina de 24 horas',
          horas_ayuno: null,
          tipo_orina: 'ORINA_24H',
          horas_orina: 24
        }
      }),

      // Grupo 5: Sin preparación especial
      prisma.grupo.create({
        data: {
          nombre: 'SIN PREPARACION ESPECIAL',
          descripcion: 'Prácticas que no requieren preparación especial',
          horas_ayuno: null,
          tipo_orina: null,
          horas_orina: null
        }
      })
    ]);

    console.log(`✅ ${grupos.length} grupos creados\n`);

    // ====================================
    // 5. Vincular Grupos con Indicaciones
    // ====================================
    console.log('🔗 Vinculando grupos con indicaciones...');

    // Grupo 1 (Ayuno 8h) → Indicación de ayuno 8h + Generales
    await prisma.grupoIndicacion.createMany({
      data: [
        { id_grupo: grupos[0].id_grupo, id_indicacion: indicaciones[0].id_indicacion, orden: 1 }, // Ayuno 8h
        { id_grupo: grupos[0].id_grupo, id_indicacion: indicaciones[5].id_indicacion, orden: 2 }, // Orden médica
        { id_grupo: grupos[0].id_grupo, id_indicacion: indicaciones[6].id_indicacion, orden: 3 }, // DNI
        { id_grupo: grupos[0].id_grupo, id_indicacion: indicaciones[8].id_indicacion, orden: 4 }  // Horario
      ]
    });

    // Grupo 2 (Ayuno 4h) → Indicación de ayuno 4h + Generales
    await prisma.grupoIndicacion.createMany({
      data: [
        { id_grupo: grupos[1].id_grupo, id_indicacion: indicaciones[1].id_indicacion, orden: 1 }, // Ayuno 4h
        { id_grupo: grupos[1].id_grupo, id_indicacion: indicaciones[5].id_indicacion, orden: 2 }, // Orden médica
        { id_grupo: grupos[1].id_grupo, id_indicacion: indicaciones[6].id_indicacion, orden: 3 }  // DNI
      ]
    });

    // Grupo 3 (Primera orina) → Indicación de primera orina + Generales
    await prisma.grupoIndicacion.createMany({
      data: [
        { id_grupo: grupos[2].id_grupo, id_indicacion: indicaciones[2].id_indicacion, orden: 1 }, // Primera orina
        { id_grupo: grupos[2].id_grupo, id_indicacion: indicaciones[5].id_indicacion, orden: 2 }, // Orden médica
        { id_grupo: grupos[2].id_grupo, id_indicacion: indicaciones[6].id_indicacion, orden: 3 }  // DNI
      ]
    });

    // Grupo 4 (Orina 24h) → Indicación de orina 24h + Generales
    await prisma.grupoIndicacion.createMany({
      data: [
        { id_grupo: grupos[3].id_grupo, id_indicacion: indicaciones[3].id_indicacion, orden: 1 }, // Orina 24h
        { id_grupo: grupos[3].id_grupo, id_indicacion: indicaciones[5].id_indicacion, orden: 2 }, // Orden médica
        { id_grupo: grupos[3].id_grupo, id_indicacion: indicaciones[6].id_indicacion, orden: 3 }  // DNI
      ]
    });

    // Grupo 5 (Sin preparación) → Solo generales
    await prisma.grupoIndicacion.createMany({
      data: [
        { id_grupo: grupos[4].id_grupo, id_indicacion: indicaciones[5].id_indicacion, orden: 1 }, // Orden médica
        { id_grupo: grupos[4].id_grupo, id_indicacion: indicaciones[6].id_indicacion, orden: 2 }  // DNI
      ]
    });

    console.log('✅ Grupos vinculados con indicaciones\n');

    // ====================================
    // 6. Crear Prácticas
    // ====================================
    console.log('🧪 Creando prácticas...');

    const practicas = await Promise.all([
      // Prácticas de Virología
      prisma.practica.create({
        data: {
          codigo_did: '26758301000999116',
          nombre: 'CITOMEGALOVIRUS PCR',
          id_area: areas[0].id_area
        }
      }),
      prisma.practica.create({
        data: {
          codigo_did: '26758401000999117',
          nombre: 'HIV - DETECCION DE ANTICUERPOS',
          id_area: areas[0].id_area
        }
      }),

      // Prácticas de Química
      prisma.practica.create({
        data: {
          codigo_did: '26758501000999118',
          nombre: 'GLUCEMIA',
          id_area: areas[1].id_area
        }
      }),
      prisma.practica.create({
        data: {
          codigo_did: '26758601000999119',
          nombre: 'COLESTEROL TOTAL',
          id_area: areas[1].id_area
        }
      }),
      prisma.practica.create({
        data: {
          codigo_did: '26758701000999120',
          nombre: 'TRIGLICERIDOS',
          id_area: areas[1].id_area
        }
      }),

      // Prácticas de Bacteriología
      prisma.practica.create({
        data: {
          codigo_did: '26758801000999121',
          nombre: 'UROCULTIVO',
          id_area: areas[2].id_area
        }
      }),
      prisma.practica.create({
        data: {
          codigo_did: '26758901000999122',
          nombre: 'COPROCULTIVO',
          id_area: areas[2].id_area
        }
      }),

      // Prácticas de Hematología
      prisma.practica.create({
        data: {
          codigo_did: '26759001000999123',
          nombre: 'HEMOGRAMA COMPLETO',
          id_area: areas[3].id_area
        }
      }),

      // Prácticas de Endocrinología
      prisma.practica.create({
        data: {
          codigo_did: '26759101000999124',
          nombre: 'TSH - TIROTROPINA',
          id_area: areas[4].id_area
        }
      }),
      prisma.practica.create({
        data: {
          codigo_did: '26759201000999125',
          nombre: 'T4 LIBRE',
          id_area: areas[4].id_area
        }
      })
    ]);

    console.log(`✅ ${practicas.length} prácticas creadas\n`);

    // ====================================
    // 7. Vincular Prácticas con Grupos
    // ====================================
    console.log('🔗 Vinculando prácticas con grupos...');

    await prisma.practicaGrupo.createMany({
      data: [
        // Prácticas de virología → Sin preparación especial
        { id_practica: practicas[0].id_practica, id_grupo: grupos[4].id_grupo },
        { id_practica: practicas[1].id_practica, id_grupo: grupos[4].id_grupo },

        // Prácticas de química → Ayuno 8 horas
        { id_practica: practicas[2].id_practica, id_grupo: grupos[0].id_grupo },
        { id_practica: practicas[3].id_practica, id_grupo: grupos[0].id_grupo },
        { id_practica: practicas[4].id_practica, id_grupo: grupos[0].id_grupo },

        // UROCULTIVO → Primera orina
        { id_practica: practicas[5].id_practica, id_grupo: grupos[2].id_grupo },

        // COPROCULTIVO → Sin preparación especial
        { id_practica: practicas[6].id_practica, id_grupo: grupos[4].id_grupo },

        // Hemograma → Sin preparación especial
        { id_practica: practicas[7].id_practica, id_grupo: grupos[4].id_grupo },

        // Hormonas tiroideas → Ayuno 8 horas
        { id_practica: practicas[8].id_practica, id_grupo: grupos[0].id_grupo },
        { id_practica: practicas[9].id_practica, id_grupo: grupos[0].id_grupo }
      ]
    });

    console.log('✅ Prácticas vinculadas con grupos\n');

    // ====================================
    // 8. Crear Regla Alternativa (Ejemplo)
    // ====================================
    console.log('⚙️  Creando reglas alternativas...');

    // Ejemplo: Si se piden GLUCEMIA + COLESTEROL juntas, usar grupo específico
    // (En el caso real, usarían el mismo grupo, pero esto es para demostrar)

    await prisma.reglaAlternativa.create({
      data: {
        id_practica_1: practicas[2].id_practica, // GLUCEMIA
        id_practica_2: practicas[3].id_practica, // COLESTEROL
        id_grupo_resultado: grupos[0].id_grupo,  // Ayuno 8h
        descripcion: 'GLUCEMIA + COLESTEROL → Ayuno 8 horas'
      }
    });

    console.log('✅ Reglas alternativas creadas\n');

    // ====================================
    // 9. Resumen Final
    // ====================================
    console.log('\n📊 RESUMEN DE SEED:');
    console.log('='.repeat(50));

    const conteos = await Promise.all([
      prisma.area.count(),
      prisma.practica.count(),
      prisma.grupo.count(),
      prisma.indicacion.count(),
      prisma.practicaGrupo.count(),
      prisma.grupoIndicacion.count(),
      prisma.reglaAlternativa.count()
    ]);

    console.log(`✅ Áreas:               ${conteos[0]}`);
    console.log(`✅ Prácticas:           ${conteos[1]}`);
    console.log(`✅ Grupos:              ${conteos[2]}`);
    console.log(`✅ Indicaciones:        ${conteos[3]}`);
    console.log(`✅ Prácticas-Grupos:    ${conteos[4]}`);
    console.log(`✅ Grupos-Indicaciones: ${conteos[5]}`);
    console.log(`✅ Reglas Alternativas: ${conteos[6]}`);
    console.log('='.repeat(50));
    console.log('\n🎉 Seed completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  }
}

// ====================================
// Ejecutar y cerrar conexión
// ====================================
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
