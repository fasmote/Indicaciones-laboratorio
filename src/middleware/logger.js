// ====================================
// MIDDLEWARE DE LOGGING
// ====================================
//
// Registra todas las requests HTTP en consola.
// Útil para debugging y monitoreo.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Un middleware es una función que se ejecuta ANTES de que la request
// llegue al controlador. Tiene acceso a:
// - req (request): Datos de la petición
// - res (response): Objeto para enviar respuesta
// - next: Función para pasar al siguiente middleware/ruta
//
// Estructura de un middleware:
// function middleware(req, res, next) {
//   // Hacer algo
//   next(); // Pasar al siguiente
// }
//
// ====================================

/**
 * Middleware que registra información de cada request
 */
function logger(req, res, next) {
  const startTime = Date.now();

  // ⭐ EXPLICACIÓN: Capturar el momento en que termina la response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // Códigos de color para la consola (opcional)
    const statusColor = getStatusColor(res.statusCode);
    const methodColor = '\x1b[36m'; // Cyan
    const resetColor = '\x1b[0m';   // Reset

    // Formatear el log
    const log = `${timestamp} | ${methodColor}${req.method}${resetColor} ${req.path} | ${statusColor}${res.statusCode}${resetColor} | ${duration}ms`;

    // Imprimir en consola
    console.log(log);

    // En producción, podrías escribir esto en un archivo
    // o enviarlo a un servicio de logging (Winston, Bunyan, etc.)
  });

  // ⭐ EXPLICACIÓN: Llamar a next() para continuar con la request
  next();
}

/**
 * Obtener color según el código de estado HTTP
 */
function getStatusColor(statusCode) {
  if (statusCode >= 500) return '\x1b[31m'; // Rojo (error del servidor)
  if (statusCode >= 400) return '\x1b[33m'; // Amarillo (error del cliente)
  if (statusCode >= 300) return '\x1b[36m'; // Cyan (redirección)
  if (statusCode >= 200) return '\x1b[32m'; // Verde (éxito)
  return '\x1b[0m'; // Reset
}

module.exports = logger;

// ====================================
// EJEMPLO DE SALIDA EN CONSOLA
// ====================================
//
// 2025-10-08T10:30:45.123Z | GET /api/practicas | 200 | 45ms
// 2025-10-08T10:30:46.234Z | POST /api/practicas | 201 | 123ms
// 2025-10-08T10:30:47.345Z | GET /api/practicas/999 | 404 | 12ms
// 2025-10-08T10:30:48.456Z | POST /api/simulador/generar | 200 | 567ms
//
// ====================================
