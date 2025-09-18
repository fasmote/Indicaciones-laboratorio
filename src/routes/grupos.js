import express from 'express';
import {
    getGrupos,
    getGrupoById,
    createGrupo,
    vincularPractica,
    generarIndicaciones
} from '../controllers/gruposController.js';

const router = express.Router();

// GET /api/grupos - Obtener todos los grupos
router.get('/', getGrupos);

// GET /api/grupos/:id - Obtener un grupo por ID
router.get('/:id', getGrupoById);

// POST /api/grupos - Crear nuevo grupo
router.post('/', createGrupo);

// POST /api/grupos/vincular-practica - Vincular práctica a grupo
router.post('/vincular-practica', vincularPractica);

// POST /api/grupos/generar-indicaciones - Generar indicaciones para múltiples prácticas
router.post('/generar-indicaciones', generarIndicaciones);

export default router;
