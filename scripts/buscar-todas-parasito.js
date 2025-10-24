// Buscar todas las prácticas relacionadas con parasitología
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscar() {
  try {
    console.log('🔍 Buscando prácticas con "PARASIT"...\n');

    const practicas = await prisma.practica.findMany({
      where: {
        OR: [
          { nombre: { contains: 'PARASIT' } },
          { nombre: { contains: 'MATERIA FECAL' } }
        ]
      },
      include: {
        area: true,
        grupos: {
          include: {
            grupo: {
              include: {
                indicaciones: {
                  include: { indicacion: true }
                }
              }
            }
          }
        }
      }
    });

    console.log(`Encontradas ${practicas.length} prácticas:\n`);

    practicas.forEach((p, i) => {
      console.log(`${i + 1}. ${p.nombre}`);
      console.log(`   ID: ${p.id_practica}`);
      console.log(`   Código: ${p.codigo_did}`);
      console.log(`   Área: ${p.area?.nombre || 'Sin área'}`);
      console.log(`   Grupos: ${p.grupos.length}`);

      if (p.grupos.length > 0) {
        p.grupos.forEach((pg, idx) => {
          const g = pg.grupo;
          console.log(`      Grupo ${idx + 1}: ${g.nombre} (${g.indicaciones.length} indicaciones)`);
        });
      } else {
        console.log(`      ⚠️  SIN GRUPOS ASIGNADOS`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

buscar();
