// ====================================
// SERVIDOR EXPRESS - Sistema de Indicaciones de Laboratorio
// ====================================
//
// Este es el punto de entrada del servidor backend.
// Configura Express, middlewares, rutas y manejo de errores.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Express es un framework web minimalista para Node.js.
// Facilita la creación de servidores HTTP y APIs REST.
//
// Estructura básica:
// 1. Importar dependencias
// 2. Crear aplicación Express
// 3. Configurar middlewares (CORS, JSON parser, logger)
// 4. Registrar rutas (endpoints de la API)
// 5. Manejo de errores
// 6. Iniciar servidor en un puerto
//
// ====================================

const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar configuración
require('dotenv').config(); // Cargar variables de entorno desde .env

// Importar rutas
const practicasRoutes = require('./routes/practicas');
const gruposRoutes = require('./routes/grupos');
const indicacionesRoutes = require('./routes/indicaciones');
const simuladorRoutes = require('./routes/simulador');

// Importar middlewares personalizados
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// ====================================
// 1. CREAR APLICACIÓN EXPRESS
// ====================================

const app = express();
const PORT = process.env.PORT || 3000;

console.log('\n🚀 Iniciando servidor...\n');

// ====================================
// 2. MIDDLEWARES GLOBALES
// ====================================

// ⭐ EXPLICACIÓN: Middlewares son funciones que se ejecutan antes de llegar a las rutas

// 2.1. CORS (Cross-Origin Resource Sharing)
// Permite que el frontend (en el navegador) llame a la API desde otro origen
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// 2.2. Parser de JSON
// Convierte el body de las requests en objetos JavaScript
app.use(express.json({ limit: '10mb' }));

// 2.3. Parser de URL-encoded (para formularios)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2.4. Logger personalizado
// Registra todas las requests en consola
app.use(logger);

// 2.5. Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, '../public')));

// ====================================
// 3. RUTAS DE LA API
// ====================================

// ⭐ EXPLICACIÓN: Registrar rutas bajo el prefijo /api

// Ruta de salud (health check)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.1.0'
  });
});

// Rutas principales
app.use('/api/practicas', practicasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/indicaciones', indicacionesRoutes);
app.use('/api/simulador', simuladorRoutes);

// ====================================
// 4. RUTA CATCH-ALL (Frontend SPA)
// ====================================

// ⭐ EXPLICACIÓN: Si no es una ruta de API, servir el index.html
// Esto permite que el frontend maneje sus propias rutas (SPA - Single Page Application)
app.get('*', (req, res) => {
  // Si la ruta empieza con /api, es un 404 de API
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint no encontrado'
    });
  }

  // Sino, servir el index.html del frontend
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ====================================
// 5. MANEJO DE ERRORES
// ====================================

// ⭐ EXPLICACIÓN: Middleware de errores DEBE ir al final
// Se ejecuta cuando hay un error en cualquier parte de la app
app.use(errorHandler);

// ====================================
// 6. INICIAR SERVIDOR
// ====================================

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`✅ Servidor iniciado exitosamente`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🗄️  Base de datos: SQLite (prisma/indicaciones.db)`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('\n📋 Endpoints disponibles:');
  console.log('   GET  /api/health                 - Estado del servidor');
  console.log('   GET  /api/practicas              - Listar prácticas');
  console.log('   GET  /api/practicas/:id          - Obtener práctica por ID');
  console.log('   POST /api/practicas              - Crear práctica');
  console.log('   GET  /api/grupos                 - Listar grupos');
  console.log('   GET  /api/indicaciones           - Listar indicaciones');
  console.log('   POST /api/simulador/generar      - Generar indicaciones consolidadas');
  console.log('\n💡 Presiona Ctrl+C para detener el servidor\n');
});

// ====================================
// 7. MANEJO DE CIERRE GRACEFUL
// ====================================

// ⭐ EXPLICACIÓN: Cerrar conexiones cuando se detiene el servidor (Ctrl+C)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`\n\n🛑 Señal ${signal} recibida. Cerrando servidor...`);

  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos si no termina
  setTimeout(() => {
    console.error('⚠️  Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
}

// ====================================
// 8. MANEJO DE ERRORES NO CAPTURADOS
// ====================================

// Errores no manejados en promesas
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  // En producción, podrías querer cerrar el servidor aquí
});

// Excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // En producción, cerrar el servidor
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// ====================================
// EXPORTAR APP (para testing)
// ====================================

module.exports = app;
