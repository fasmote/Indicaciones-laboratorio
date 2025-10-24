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

async function crear(req, res, next) {
  try {
    const { nombre, descripcion, horas_ayuno, tipo_orina, horas_orina } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    const grupo = await prisma.grupo.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        horas_ayuno: horas_ayuno ? parseInt(horas_ayuno) : null,
        tipo_orina: tipo_orina || null,
        horas_orina: horas_orina ? parseInt(horas_orina) : null,
        activo: true
      }
    });

    res.status(201).json({ success: true, data: grupo });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, horas_ayuno, tipo_orina, horas_orina } = req.body;

    // Verificar que existe
    const existe = await prisma.grupo.findUnique({
      where: { id_grupo: id }
    });

    if (!existe) {
      return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
    }

    // Actualizar
    const grupo = await prisma.grupo.update({
      where: { id_grupo: id },
      data: {
        nombre: nombre?.trim() || existe.nombre,
        descripcion: descripcion !== undefined ? (descripcion?.trim() || null) : existe.descripcion,
        horas_ayuno: horas_ayuno !== undefined ? (horas_ayuno ? parseInt(horas_ayuno) : null) : existe.horas_ayuno,
        tipo_orina: tipo_orina !== undefined ? tipo_orina : existe.tipo_orina,
        horas_orina: horas_orina !== undefined ? (horas_orina ? parseInt(horas_orina) : null) : existe.horas_orina
      }
    });

    res.json({ success: true, data: grupo });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    // Verificar que existe
    const existe = await prisma.grupo.findUnique({
      where: { id_grupo: id }
    });

    if (!existe) {
      return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
    }

    // Eliminación lógica
    await prisma.grupo.update({
      where: { id_grupo: id },
      data: { activo: false }
    });

    res.json({ success: true, message: 'Grupo eliminado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarTodos, obtenerPorId, crear, actualizar, eliminar };
