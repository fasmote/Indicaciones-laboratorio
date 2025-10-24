const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');

router.get('/', gruposController.listarTodos);
router.get('/:id', gruposController.obtenerPorId);
router.post('/', gruposController.crear);
router.put('/:id', gruposController.actualizar);
router.delete('/:id', gruposController.eliminar);

module.exports = router;
