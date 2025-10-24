const prisma = require('../config/database');

async function listarTodas(req, res, next) {
  try {
    const indicaciones = await prisma.indicacion.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { orden: 'asc' }]
    });

    res.json({ success: true, data: indicaciones });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const indicacion = await prisma.indicacion.findUnique({
      where: { id_indicacion: parseInt(req.params.id) }
    });

    if (!indicacion) {
      return res.status(404).json({ success: false, error: 'Indicación no encontrada' });
    }

    res.json({ success: true, data: indicacion });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const { texto, tipo, orden } = req.body;

    if (!texto || texto.trim() === '') {
      return res.status(400).json({ success: false, error: 'El texto es requerido' });
    }

    const indicacion = await prisma.indicacion.create({
      data: {
        texto: texto.trim(),
        tipo: tipo || 'GENERAL',
        orden: orden ? parseInt(orden) : 1,
        activo: true
      }
    });

    res.status(201).json({ success: true, data: indicacion });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { texto, tipo, orden } = req.body;

    // Verificar que existe
    const existe = await prisma.indicacion.findUnique({
      where: { id_indicacion: id }
    });

    if (!existe) {
      return res.status(404).json({ success: false, error: 'Indicación no encontrada' });
    }

    // Actualizar
    const indicacion = await prisma.indicacion.update({
      where: { id_indicacion: id },
      data: {
        texto: texto?.trim() || existe.texto,
        tipo: tipo || existe.tipo,
        orden: orden !== undefined ? parseInt(orden) : existe.orden
      }
    });

    res.json({ success: true, data: indicacion });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    // Verificar que existe
    const existe = await prisma.indicacion.findUnique({
      where: { id_indicacion: id }
    });

    if (!existe) {
      return res.status(404).json({ success: false, error: 'Indicación no encontrada' });
    }

    // Eliminación lógica
    await prisma.indicacion.update({
      where: { id_indicacion: id },
      data: { activo: false }
    });

    res.json({ success: true, message: 'Indicación eliminada correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarTodas, obtenerPorId, crear, actualizar, eliminar };
