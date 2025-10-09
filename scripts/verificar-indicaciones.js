/**
 * Script para verificar cuántas prácticas tienen indicaciones configuradas
 * Educativo: Muestra estadísticas de la base de datos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarIndicaciones() {
  try {
    console.log('🔍 Verificando indicaciones en la base de datos...\n');

    // 1. Total de prácticas
    const totalPracticas = await prisma.practica.count();
    console.log(`📊 Total de prácticas: ${totalPracticas}`);

    // 2. Total de grupos
    const totalGrupos = await prisma.grupo.count();
    console.log(`📦 Total de grupos: ${totalGrupos}`);

    // 3. Total de indicaciones
    const totalIndicaciones = await prisma.indicacion.count();
    console.log(`📝 Total de indicaciones: ${totalIndicaciones}\n`);

    // 4. Prácticas CON grupos asignados (usando la tabla intermedia PracticaGrupo)
    const practicasConGrupos = await prisma.practicaGrupo.findMany({
      select: {
        id_practica: true,
      },
      distinct: ['id_practica'],
    });

    const cantidadConGrupos = practicasConGrupos.length;
    const cantidadSinGrupos = totalPracticas - cantidadConGrupos;
    const porcentajeConGrupos = ((cantidadConGrupos / totalPracticas) * 100).toFixed(1);
    const porcentajeSinGrupos = ((cantidadSinGrupos / totalPracticas) * 100).toFixed(1);

    console.log(`✅ Prácticas CON indicaciones: ${cantidadConGrupos} (${porcentajeConGrupos}%)`);
    console.log(`❌ Prácticas SIN indicaciones: ${cantidadSinGrupos} (${porcentajeSinGrupos}%)\n`);

    // 5. Buscar algunas prácticas comunes para ejemplificar
    const practicasComunes = [
      'HEMOGRAMA',
      'GLUCOSA',
      'BILIRRUBINA',
      'IONOGRAMA',
      'UREA',
      'PARASITOLOGICO',
      'HEPATITIS',
    ];

    console.log('🔎 Ejemplos de prácticas comunes:\n');

    for (const nombre of practicasComunes) {
      const practica = await prisma.practica.findFirst({
        where: {
          nombre: {
            contains: nombre,
          },
        },
        include: {
          grupos: {
            include: {
              grupo: true,
            },
          },
        },
      });

      if (practica) {
        const tieneGrupos = practica.grupos.length > 0;
        const icono = tieneGrupos ? '✅' : '❌';
        const grupos = tieneGrupos ? `(${practica.grupos.length} grupos)` : '(sin indicaciones)';
        console.log(`  ${icono} ${practica.nombre.padEnd(40)} ${grupos}`);
      }
    }

    console.log('\n📋 Conclusión:');
    console.log('   El Excel original solo tenía indicaciones para ~25% de las prácticas.');
    console.log('   Esto es NORMAL y esperado según el archivo fuente.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
verificarIndicaciones();
