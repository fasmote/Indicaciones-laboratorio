const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificar() {
  const hemograma = await prisma.practica.findFirst({
    where: { nombre: { contains: 'HEMOGRAMA' } },
    include: {
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

  console.log('🔬 HEMOGRAMA - Verificación Completa:\n');
  console.log('Práctica:', hemograma.nombre);
  console.log('ID:', hemograma.id_practica);
  console.log('Código DID:', hemograma.codigo_did);
  console.log('Grupos:', hemograma.grupos.length);
  console.log('');

  hemograma.grupos.forEach((pg, i) => {
    const g = pg.grupo;
    console.log('Grupo ' + (i+1) + ':', g.nombre);
    console.log('  Ayuno:', g.horas_ayuno, 'horas');
    console.log('  Tipo orina:', g.tipo_orina || 'No requiere');
    console.log('  Indicaciones:', g.indicaciones.length);
    console.log('');

    g.indicaciones.forEach((gi, j) => {
      const ind = gi.indicacion;
      console.log('  Indicación ' + (j+1) + ':');
      console.log('    Tipo:', ind.tipo);
      console.log('    Texto:', ind.texto);
      console.log('');
    });
  });

  await prisma.$disconnect();
}

verificar();
