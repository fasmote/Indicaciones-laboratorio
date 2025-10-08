// Script temporal para crear relación práctica-grupo
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Vincular práctica 11 (ACIDO URICO EN ORINA 24H) con grupo 4 (ORINA_24H)
  await prisma.practicaGrupo.create({
    data: {
      id_practica: 11,
      id_grupo: 4,
      activo: true
    }
  });
  console.log('✅ Práctica 11 vinculada al grupo 4 (ORINA_24H)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
