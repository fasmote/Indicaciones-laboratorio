// ====================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ====================================
//
// Captura y procesa todos los errores de la aplicación.
// Devuelve respuestas JSON consistentes.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Los middlewares de error tienen 4 parámetros: (err, req, res, next)
// Express detecta automáticamente que es un error handler por los 4 parámetros.
//
// Se ejecuta cuando:
// - Se llama next(error)
// - Se lanza una excepción en un controlador async
// - Ocurre un error en cualquier middleware
//
// ====================================

const { HTTP_STATUS, MENSAJES } = require('../config/constants');

/**
 * Middleware global de manejo de errores
 * @param {Error} err - Error capturado
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  // ⭐ EXPLICACIÓN: Registrar el error en consola (en producción iría a un log)
  console.error('\n❌ ERROR CAPTURADO:');
  console.error('Ruta:', req.method, req.path);
  console.error('Timestamp:', new Date().toISOString());
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('');

  // ====================================
  // IDENTIFICAR TIPO DE ERROR
  // ====================================

  let statusCode = HTTP_STATUS.INTERNAL_ERROR;
  let errorMessage = MENSAJES.ERROR.ERROR_INTERNO;
  let errorDetails = null;

  // 1. Errores de Prisma (Base de Datos)
  if (err.code && err.code.startsWith('P')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;

    switch (err.code) {
      case 'P2002': // Unique constraint violation
        errorMessage = 'Ya existe un registro con ese valor único';
        errorDetails = err.meta?.target;
        break;

      case 'P2025': // Record not found
        errorMessage = 'Registro no encontrado';
        statusCode = HTTP_STATUS.NOT_FOUND;
        break;

      case 'P2003': // Foreign key constraint failed
        errorMessage = 'Error de integridad referencial';
        break;

      case 'P2014': // Required relation missing
        errorMessage = 'Falta una relación requerida';
        break;

      default:
        errorMessage = MENSAJES.ERROR.ERROR_BD;
        errorDetails = process.env.NODE_ENV === 'development' ? err.code : null;
    }
  }

  // 2. Errores de Validación
  else if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorMessage = 'Error de validación';
    errorDetails = err.details || err.message;
  }

  // 3. Errores personalizados (con statusCode)
  else if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  }

  // 4. Errores de sintaxis JSON
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorMessage = 'JSON inválido en el body de la request';
  }

  // 5. Error genérico
  else {
    errorMessage = err.message || MENSAJES.ERROR.ERROR_INTERNO;
  }

  // ====================================
  // CONSTRUIR RESPUESTA
  // ====================================

  const errorResponse = {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Agregar detalles solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    if (errorDetails) {
      errorResponse.details = errorDetails;
    }
    errorResponse.stack = err.stack;
  }

  // ====================================
  // ENVIAR RESPUESTA
  // ====================================

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;

// ====================================
// EJEMPLO DE RESPUESTA DE ERROR
// ====================================
//
// En desarrollo:
// {
//   "success": false,
//   "error": "Ya existe un registro con ese valor único",
//   "timestamp": "2025-10-08T10:30:45.123Z",
//   "path": "/api/practicas",
//   "method": "POST",
//   "details": ["codigo_did"],
//   "stack": "Error: ...\n    at ..."
// }
//
// En producción (sin detalles sensibles):
// {
//   "success": false,
//   "error": "Ya existe un registro con ese valor único",
//   "timestamp": "2025-10-08T10:30:45.123Z",
//   "path": "/api/practicas",
//   "method": "POST"
// }
//
// ====================================
