const express = require('express');
const router = express.Router();
const simuladorController = require('../controllers/simuladorController');

// Endpoint principal del simulador
router.post('/generar', simuladorController.generarIndicaciones);

module.exports = router;
