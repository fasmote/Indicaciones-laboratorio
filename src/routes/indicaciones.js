const express = require('express');
const router = express.Router();
const indicacionesController = require('../controllers/indicacionesController');

router.get('/', indicacionesController.listarTodas);

module.exports = router;
