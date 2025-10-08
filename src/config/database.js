// ====================================
// CONFIGURACIÓN DE PRISMA CLIENT
// ====================================
//
// Este archivo centraliza la configuración del cliente de Prisma.
// Usa el patrón Singleton para evitar múltiples instancias.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Prisma Client es el ORM que nos permite interactuar con la BD.
// En vez de escribir SQL manualmente, usamos métodos JavaScript:
//
// Ejemplo SQL:
//   SELECT * FROM PRACTICA WHERE activo = 1;
//
// Equivalente con Prisma:
//   await prisma.practica.findMany({ where: { activo: true } });
//
// Ventajas de Prisma:
// - Type-safe (detecta errores antes de ejecutar)
// - Autocomplete en el editor
// - Abstracción de base de datos (cambiar SQLite → MySQL sin cambiar código)
// - Migraciones automáticas
//
// ====================================

const { PrismaClient } = require('@prisma/client');

// ⭐ EXPLICACIÓN: Patrón Singleton
// Creamos UNA SOLA instancia de Prisma Client que se reutiliza
// en toda la aplicación. Esto evita abrir múltiples conexiones a la BD.

let prisma;

// En desarrollo, usar hot-reload sin crear múltiples instancias
if (process.env.NODE_ENV === 'production') {
  // ⭐ PRODUCCIÓN: Crear una instancia única
  prisma = new PrismaClient({
    log: ['error', 'warn'], // Solo errores y warnings en producción
  });
} else {
  // ⭐ DESARROLLO: Reutilizar instancia si existe (evita problemas con nodemon)
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'], // Mostrar queries en desarrollo
    });
  }
  prisma = global.prisma;
}

// ⭐ EXPLICACIÓN: Manejo de cierre graceful
// Cuando la aplicación se cierra, cerrar la conexión a la BD
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Conexión a base de datos cerrada');
});

// ⭐ EXPLICACIÓN: Manejo de errores de conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Conexión a base de datos establecida');
  })
  .catch((error) => {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  });

// ⭐ EXPLICACIÓN: Exportar la instancia
// Esta instancia se importará en todos los servicios y controladores
module.exports = prisma;

// ====================================
// EJEMPLO DE USO
// ====================================
//
// En cualquier archivo del proyecto:
//
// const prisma = require('./config/database');
//
// // Obtener todas las prácticas activas
// const practicas = await prisma.practica.findMany({
//   where: { activo: true },
//   include: { area: true } // Incluir datos del área
// });
//
// // Crear una nueva práctica
// const nuevaPractica = await prisma.practica.create({
//   data: {
//     nombre: 'GLUCEMIA',
//     codigo_did: '12345678',
//     id_area: 2
//   }
// });
//
// // Actualizar una práctica
// await prisma.practica.update({
//   where: { id_practica: 1 },
//   data: { activo: false }
// });
//
// // Eliminar (físicamente, NO recomendado)
// await prisma.practica.delete({
//   where: { id_practica: 1 }
// });
//
// ====================================
