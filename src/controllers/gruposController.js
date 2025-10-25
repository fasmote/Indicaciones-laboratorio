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

// ==========================================
// GESTIÓN DE RELACIONES: GRUPOS ↔ INDICACIONES
// ==========================================

async function agregarIndicacion(req, res, next) {
  try {
    const idGrupo = parseInt(req.params.id);
    const { id_indicacion, orden } = req.body;

    // Validar datos
    if (!id_indicacion) {
      return res.status(400).json({ success: false, error: 'El ID de indicación es requerido' });
    }

    // Verificar que el grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo }
    });

    if (!grupo) {
      return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
    }

    // Verificar que la indicación existe
    const indicacion = await prisma.indicacion.findUnique({
      where: { id_indicacion: parseInt(id_indicacion) }
    });

    if (!indicacion) {
      return res.status(404).json({ success: false, error: 'Indicación no encontrada' });
    }

    // Verificar si ya está asociada
    const yaExiste = await prisma.grupoIndicacion.findFirst({
      where: {
        id_grupo: idGrupo,
        id_indicacion: parseInt(id_indicacion),
        activo: true
      }
    });

    if (yaExiste) {
      return res.status(400).json({ success: false, error: 'Esta indicación ya está asociada al grupo' });
    }

    // Crear la relación
    const relacion = await prisma.grupoIndicacion.create({
      data: {
        id_grupo: idGrupo,
        id_indicacion: parseInt(id_indicacion),
        orden: orden ? parseInt(orden) : 1,
        activo: true
      },
      include: {
        indicacion: true
      }
    });

    res.status(201).json({ success: true, data: relacion });
  } catch (error) {
    next(error);
  }
}

async function removerIndicacion(req, res, next) {
  try {
    const idGrupo = parseInt(req.params.id);
    const idIndicacion = parseInt(req.params.idIndicacion);

    // Buscar la relación
    const relacion = await prisma.grupoIndicacion.findFirst({
      where: {
        id_grupo: idGrupo,
        id_indicacion: idIndicacion,
        activo: true
      }
    });

    if (!relacion) {
      return res.status(404).json({ success: false, error: 'Relación no encontrada' });
    }

    // Eliminación lógica
    await prisma.grupoIndicacion.update({
      where: { id_grupo_indicacion: relacion.id_grupo_indicacion },
      data: { activo: false }
    });

    res.json({ success: true, message: 'Indicación removida del grupo correctamente' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// GESTIÓN DE RELACIONES: GRUPOS ↔ PRÁCTICAS
// ==========================================

async function agregarPractica(req, res, next) {
  try {
    const idGrupo = parseInt(req.params.id);
    const { id_practica } = req.body;

    // Validar datos
    if (!id_practica) {
      return res.status(400).json({ success: false, error: 'El ID de práctica es requerido' });
    }

    // Verificar que el grupo existe
    const grupo = await prisma.grupo.findUnique({
      where: { id_grupo: idGrupo }
    });

    if (!grupo) {
      return res.status(404).json({ success: false, error: 'Grupo no encontrado' });
    }

    // Verificar que la práctica existe
    const practica = await prisma.practica.findUnique({
      where: { id_practica: parseInt(id_practica) }
    });

    if (!practica) {
      return res.status(404).json({ success: false, error: 'Práctica no encontrada' });
    }

    // Verificar si ya está asociada
    const yaExiste = await prisma.practicaGrupo.findFirst({
      where: {
        id_grupo: idGrupo,
        id_practica: parseInt(id_practica),
        activo: true
      }
    });

    if (yaExiste) {
      return res.status(400).json({ success: false, error: 'Esta práctica ya está asociada al grupo' });
    }

    // Crear la relación
    const relacion = await prisma.practicaGrupo.create({
      data: {
        id_grupo: idGrupo,
        id_practica: parseInt(id_practica),
        activo: true
      },
      include: {
        practica: true
      }
    });

    res.status(201).json({ success: true, data: relacion });
  } catch (error) {
    next(error);
  }
}

async function removerPractica(req, res, next) {
  try {
    const idGrupo = parseInt(req.params.id);
    const idPractica = parseInt(req.params.idPractica);

    // Buscar la relación
    const relacion = await prisma.practicaGrupo.findFirst({
      where: {
        id_grupo: idGrupo,
        id_practica: idPractica,
        activo: true
      }
    });

    if (!relacion) {
      return res.status(404).json({ success: false, error: 'Relación no encontrada' });
    }

    // Eliminación lógica
    await prisma.practicaGrupo.update({
      where: { id_practica_grupo: relacion.id_practica_grupo },
      data: { activo: false }
    });

    res.json({ success: true, message: 'Práctica removida del grupo correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  agregarIndicacion,
  removerIndicacion,
  agregarPractica,
  removerPractica
};
