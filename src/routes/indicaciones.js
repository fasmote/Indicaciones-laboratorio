const express = require('express');
const router = express.Router();
const indicacionesController = require('../controllers/indicacionesController');

router.get('/', indicacionesController.listarTodas);
router.get('/:id', indicacionesController.obtenerPorId);
router.post('/', indicacionesController.crear);
router.put('/:id', indicacionesController.actualizar);
router.delete('/:id', indicacionesController.eliminar);

module.exports = router;
