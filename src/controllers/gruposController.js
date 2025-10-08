const prisma = require('../config/database');

async function listarTodos(req, res, next) {
  try {
    const grupos = await prisma.grupo.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    res.json({ success: true, data: grupos });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: parseInt(req.params.id) },
      include: {
        indicaciones: {
          where: { activo: true },
          include: { indicacion: true },
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!grupo) {
      return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
    }

    res.json({ success: true, data: grupo });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarTodos, obtenerPorId };
