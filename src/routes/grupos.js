const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');

router.get('/', gruposController.listarTodos);
router.get('/:id', gruposController.obtenerPorId);

module.exports = router;
