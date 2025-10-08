// ====================================
// CONTROLADOR - SIMULADOR
// ====================================
//
// Endpoint principal del sistema: Generar indicaciones consolidadas
//
// ====================================

const indicacionesService = require('../services/indicacionesService');
const { HTTP_STATUS } = require('../config/constants');

/**
 * POST /api/simulador/generar
 * Generar indicaciones consolidadas para múltiples prácticas
 * Body: { id_practicas: [1, 2, 3] }
 */
async function generarIndicaciones(req, res, next) {
  try {
    const { id_practicas } = req.body;

    // Validar
    if (!id_practicas || !Array.isArray(id_practicas) || id_practicas.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Debe proporcionar un array de IDs de prácticas (id_practicas)'
      });
    }

    // Convertir a números
    const ids = id_practicas.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Los IDs de prácticas deben ser números válidos'
      });
    }

    // Llamar al servicio
    const resultado = await indicacionesService.generarIndicaciones(ids);

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  generarIndicaciones
};
