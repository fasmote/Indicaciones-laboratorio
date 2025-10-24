// Script para verificar qué hay en la BD para ESTUDIO PARASITOLÓGICO
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificar() {
  try {
    console.log('🔍 Buscando "ESTUDIO PARASITOLÓGICO SERIADO DE MATERIA FECAL"...\n');

    // Buscar la práctica
    const practica = await prisma.practica.findFirst({
      where: {
        nombre: {
          contains: 'PARASITOLOGICO SERIADO'
        }
      },
      include: {
        grupos: {
          include: {
            grupo: {
              include: {
                indicaciones: {
                  include: {
                    indicacion: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!practica) {
      console.log('❌ No se encontró la práctica');
      return;
    }

    console.log(`✅ Práctica encontrada: ${practica.nombre}`);
    console.log(`   ID: ${practica.id_practica}`);
    console.log(`   Código DID: ${practica.codigo_did}`);
    console.log(`   Área: ${practica.id_area}`);
    console.log(`\n📁 Grupos asignados: ${practica.grupos.length}\n`);

    if (practica.grupos.length === 0) {
      console.log('⚠️  Esta práctica NO tiene grupos asignados');
      console.log('   Por eso no aparecen indicaciones en la aplicación.\n');
    } else {
      practica.grupos.forEach((pg, idx) => {
        const grupo = pg.grupo;
        console.log(`\n${idx + 1}. Grupo: ${grupo.nombre}`);
        console.log(`   ID: ${grupo.id_grupo}`);
        console.log(`   Descripción: ${grupo.descripcion || 'N/A'}`);
        console.log(`   Ayuno: ${grupo.horas_ayuno || 'N/A'} horas`);
        console.log(`   Tipo orina: ${grupo.tipo_orina || 'N/A'}`);
        console.log(`   Indicaciones: ${grupo.indicaciones.length}`);

        if (grupo.indicaciones.length > 0) {
          grupo.indicaciones.forEach((gi, i) => {
            const ind = gi.indicacion;
            console.log(`      ${i + 1}. ${ind.texto}`);
            console.log(`         Tipo: ${ind.tipo}, Orden: ${ind.orden}`);
          });
        }
      });
    }

    // Buscar en tabla de indicaciones originales si existe
    console.log('\n\n🔍 Buscando en INDICACION si existe alguna relacionada...\n');
    const indicaciones = await prisma.indicacion.findMany({
      where: {
        texto: {
          contains: 'parasit'
        }
      },
      take: 10
    });

    console.log(`Encontradas ${indicaciones.length} indicaciones con "parasit":`);
    indicaciones.forEach((ind, i) => {
      console.log(`${i + 1}. [${ind.tipo}] ${ind.texto.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
