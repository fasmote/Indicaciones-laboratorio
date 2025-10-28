const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarGlucemia() {
  try {
    // Buscar GLUCEMIA (glucosa en sangre, no orina)
    const glucemias = await prisma.practica.findMany({
      where: {
        OR: [
          { nombre: { contains: 'GLUCEMIA' } },
          { nombre: { contains: 'GLUCOSA' } }
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
      },
      take: 10
    });

    console.log(`\n📊 Encontradas ${glucemias.length} prácticas con GLUCEMIA/GLUCOSA:\n`);

    glucemias.forEach((practica, idx) => {
      console.log(`${idx + 1}. ${practica.nombre} (ID: ${practica.id_practica})`);
      console.log(`   Código: ${practica.codigo_did}`);
      console.log(`   Grupos: ${practica.grupos.length}`);

      if (practica.grupos.length === 0) {
        console.log(`   ⚠️ SIN GRUPOS (sin indicaciones)`);
      } else {
        practica.grupos.forEach((pg, i) => {
          const grupo = pg.grupo;
          console.log(`   Grupo ${i+1}: ${grupo.nombre}`);
          console.log(`      Ayuno: ${grupo.horas_ayuno || 'Sin ayuno'} ${grupo.horas_ayuno ? 'horas' : ''}`);
          console.log(`      Indicaciones: ${grupo.indicaciones.length}`);
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarGlucemia();
