const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarGlucosa() {
  try {
    // Buscar GLUCOSA
    const glucosa = await prisma.practica.findFirst({
      where: {
        OR: [
          { nombre: { contains: 'GLUCOSA' } },
          { codigo_did: { contains: 'GLUCOSA' } }
        ]
      },
      include: {
        grupos: {
          where: { activo: true },
          include: {
            grupo: {
              include: {
                indicaciones: {
                  where: { activo: true },
                  include: { indicacion: true }
                }
              }
            }
          }
        }
      }
    });

    if (!glucosa) {
      console.log('❌ No se encontró GLUCOSA');
      return;
    }

    console.log('✅ GLUCOSA encontrada:');
    console.log('   ID:', glucosa.id_practica);
    console.log('   Nombre:', glucosa.nombre);
    console.log('   Código:', glucosa.codigo_did);
    console.log('   Grupos asociados:', glucosa.grupos.length);

    if (glucosa.grupos.length === 0) {
      console.log('\n⚠️ GLUCOSA NO TIENE GRUPOS ASOCIADOS');
      console.log('   Esto explica por qué no muestra ayuno.');
    } else {
      glucosa.grupos.forEach((pg, i) => {
        const grupo = pg.grupo;
        console.log(`\n   Grupo ${i+1}: ${grupo.nombre}`);
        console.log(`      Ayuno: ${grupo.horas_ayuno || 'Sin ayuno'} ${grupo.horas_ayuno ? 'horas' : ''}`);
        console.log(`      Indicaciones: ${grupo.indicaciones.length}`);

        if (grupo.indicaciones.length > 0) {
          grupo.indicaciones.forEach((gi, idx) => {
            console.log(`         ${idx+1}. ${gi.indicacion.texto}`);
          });
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarGlucosa();
