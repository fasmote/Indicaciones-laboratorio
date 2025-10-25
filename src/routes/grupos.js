const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');

// CRUD básico de grupos
router.get('/', gruposController.listarTodos);
router.get('/:id', gruposController.obtenerPorId);
router.post('/', gruposController.crear);
router.put('/:id', gruposController.actualizar);
router.delete('/:id', gruposController.eliminar);

// Gestión de relaciones: Grupos ↔ Indicaciones
router.post('/:id/indicaciones', gruposController.agregarIndicacion);
router.delete('/:id/indicaciones/:idIndicacion', gruposController.removerIndicacion);

// Gestión de relaciones: Grupos ↔ Prácticas
router.post('/:id/practicas', gruposController.agregarPractica);
router.delete('/:id/practicas/:idPractica', gruposController.removerPractica);

module.exports = router;
