// ====================================
// RUTAS - PRÁCTICAS
// ====================================
//
// Define las rutas (endpoints) de la API para prácticas.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Las rutas mapean URLs a funciones del controlador.
// Express Router permite modularizar las rutas.
//
// Estructura:
// - Importar Express Router
// - Importar controlador
// - Definir rutas con métodos HTTP
// - Exportar router
//
// ====================================

const express = require('express');
const router = express.Router();
const practicasController = require('../controllers/practicasController');

// ====================================
// ENDPOINTS DE PRÁCTICAS
// ====================================

// ⭐ EXPLICACIÓN: Todas estas rutas están bajo el prefijo /api/practicas
// Ej: GET /api/practicas → listarTodas()

/**
 * GET /api/practicas
 * Listar todas las prácticas activas
 * Query params opcionales: area, buscar, limit, offset
 */
router.get('/', practicasController.listarTodas);

/**
 * GET /api/practicas/:id
 * Obtener una práctica específica por ID
 */
router.get('/:id', practicasController.obtenerPorId);

/**
 * POST /api/practicas
 * Crear una nueva práctica
 * Body: { nombre, codigo_did, id_area }
 */
router.post('/', practicasController.crear);

/**
 * PUT /api/practicas/:id
 * Actualizar una práctica existente
 * Body: { nombre?, id_area?, activo? }
 */
router.put('/:id', practicasController.actualizar);

/**
 * DELETE /api/practicas/:id
 * Eliminar (lógicamente) una práctica
 */
router.delete('/:id', practicasController.eliminar);

// ====================================
// EXPORTAR ROUTER
// ====================================

module.exports = router;

// ====================================
// EJEMPLOS DE USO
// ====================================
//
// GET http://localhost:3000/api/practicas
// GET http://localhost:3000/api/practicas?area=VIROLOGIA
// GET http://localhost:3000/api/practicas/1
// POST http://localhost:3000/api/practicas
// PUT http://localhost:3000/api/practicas/1
// DELETE http://localhost:3000/api/practicas/1
//
// ====================================
