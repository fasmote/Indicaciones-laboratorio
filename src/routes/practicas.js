import express from 'express';
import {
    getPracticas,
    getPracticaById,
    createPractica,
    updatePractica,
    deletePractica
} from '../controllers/practicasController.js';

const router = express.Router();

// GET /api/practicas - Obtener todas las prácticas
router.get('/', getPracticas);

// GET /api/practicas/:id - Obtener una práctica por ID
router.get('/:id', getPracticaById);

// POST /api/practicas - Crear nueva práctica
router.post('/', createPractica);

// PUT /api/practicas/:id - Actualizar práctica
router.put('/:id', updatePractica);

// DELETE /api/practicas/:id - Eliminar práctica (soft delete)
router.delete('/:id', deletePractica);

export default router;
