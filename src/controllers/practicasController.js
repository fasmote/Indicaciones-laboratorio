// ====================================
// CONTROLADOR - PRÁCTICAS
// ====================================
//
// Maneja la lógica de los endpoints de prácticas.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// Los controladores:
// 1. Reciben la request (req)
// 2. Procesan datos / llaman servicios
// 3. Devuelven la response (res)
//
// NO deben contener lógica de negocio compleja.
// La lógica compleja va en services/.
//
// ====================================

const prisma = require('../config/database');
const { HTTP_STATUS, MENSAJES, LIMITES } = require('../config/constants');

// ====================================
// LISTAR TODAS LAS PRÁCTICAS
// ====================================

/**
 * GET /api/practicas
 * Listar todas las prácticas activas
 * Query params: ?area=VIROLOGIA&buscar=PCR&limit=20&offset=0
 */
async function listarTodas(req, res, next) {
  try {
    // ⭐ EXPLICACIÓN: Extraer parámetros de query
    const { area, buscar, limit, offset } = req.query;

    // Construir filtros dinámicamente
    const where = {
      activo: true
    };

    // Filtro por área (si se proporciona)
    if (area) {
      where.area = {
        nombre: area.toUpperCase()
      };
    }

    // Búsqueda por nombre (si se proporciona)
    if (buscar) {
      where.nombre = {
        contains: buscar,
        // SQLite LIKE es case-insensitive por defecto
      };
    }

    // Opciones de paginación
    const take = limit ? Math.min(parseInt(limit), LIMITES.PAGINACION_MAX) : LIMITES.PAGINACION_DEFAULT;
    const skip = offset ? parseInt(offset) : 0;

    // ⭐ EXPLICACIÓN: Query a la base de datos con Prisma
    const [practicas, total] = await Promise.all([
      prisma.practica.findMany({
        where,
        include: {
          area: true // Incluir datos del área
        },
        orderBy: { nombre: 'asc' },
        take,
        skip
      }),
      // Contar total (para paginación)
      prisma.practica.count({ where })
    ]);

    // ⭐ EXPLICACIÓN: Responder con éxito
    res.json({
      success: true,
      data: practicas,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore: (skip + take) < total
      }
    });

  } catch (error) {
    // ⭐ EXPLICACIÓN: Pasar el error al middleware de errores
    next(error);
  }
}

// ====================================
// OBTENER PRÁCTICA POR ID
// ====================================

/**
 * GET /api/practicas/:id
 * Obtener una práctica específica con sus grupos
 */
async function obtenerPorId(req, res, next) {
  try {
    const { id } = req.params;

    // ⭐ EXPLICACIÓN: Convertir a número y validar
    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'ID debe ser un número'
      });
    }

    // Buscar práctica
    const practica = await prisma.practica.findUnique({
      where: { id_practica: idNumero },
      include: {
        area: true,
        grupos: {
          where: { activo: true },
          include: {
            grupo: {
              include: {
                indicaciones: {
                  where: { activo: true },
                  include: {
                    indicacion: true
                  },
                  orderBy: { orden: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    // Validar que existe
    if (!practica) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: MENSAJES.ERROR.PRACTICA_NO_ENCONTRADA
      });
    }

    res.json({
      success: true,
      data: practica
    });

  } catch (error) {
    next(error);
  }
}

// ====================================
// CREAR NUEVA PRÁCTICA
// ====================================

/**
 * POST /api/practicas
 * Crear una nueva práctica
 * Body: { nombre, codigo_did, id_area }
 */
async function crear(req, res, next) {
  try {
    const { nombre, codigo_did, id_area } = req.body;

    // ⭐ EXPLICACIÓN: Validaciones
    if (!nombre || !codigo_did) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Nombre y código DID son obligatorios'
      });
    }

    // Validar longitud
    if (nombre.length > LIMITES.MAX_LONGITUD_NOMBRE) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: `Nombre demasiado largo (máximo ${LIMITES.MAX_LONGITUD_NOMBRE} caracteres)`
      });
    }

    // Verificar que no exista código DID duplicado
    const existe = await prisma.practica.findUnique({
      where: { codigo_did }
    });

    if (existe) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: MENSAJES.ERROR.CODIGO_DID_DUPLICADO
      });
    }

    // Crear práctica
    const nuevaPractica = await prisma.practica.create({
      data: {
        nombre: nombre.trim(),
        codigo_did: codigo_did.trim(),
        id_area: id_area ? parseInt(id_area) : null,
        activo: true
      },
      include: { area: true }
    });

    // Responder con 201 Created
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: nuevaPractica,
      message: MENSAJES.EXITO.PRACTICA_CREADA
    });

  } catch (error) {
    next(error);
  }
}

// ====================================
// ACTUALIZAR PRÁCTICA
// ====================================

/**
 * PUT /api/practicas/:id
 * Actualizar una práctica existente
 * Body: { nombre?, id_area?, activo? }
 */
async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, id_area, activo } = req.body;

    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'ID debe ser un número'
      });
    }

    // Construir datos de actualización
    const dataActualizacion = {};

    if (nombre !== undefined) {
      dataActualizacion.nombre = nombre.trim();
    }
    if (id_area !== undefined) {
      dataActualizacion.id_area = id_area ? parseInt(id_area) : null;
    }
    if (activo !== undefined) {
      dataActualizacion.activo = Boolean(activo);
    }

    // Actualizar
    const practicaActualizada = await prisma.practica.update({
      where: { id_practica: idNumero },
      data: dataActualizacion,
      include: { area: true }
    });

    res.json({
      success: true,
      data: practicaActualizada,
      message: MENSAJES.EXITO.PRACTICA_ACTUALIZADA
    });

  } catch (error) {
    // Si no existe, Prisma lanza error P2025
    next(error);
  }
}

// ====================================
// ELIMINAR PRÁCTICA (LÓGICAMENTE)
// ====================================

/**
 * DELETE /api/practicas/:id
 * Eliminar (marcar como inactiva) una práctica
 */
async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    const idNumero = parseInt(id);
    if (isNaN(idNumero)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'ID debe ser un número'
      });
    }

    // ⭐ EXPLICACIÓN: Eliminación LÓGICA (no física)
    // Solo marcamos activo = false
    await prisma.practica.update({
      where: { id_practica: idNumero },
      data: { activo: false }
    });

    res.json({
      success: true,
      message: MENSAJES.EXITO.PRACTICA_ELIMINADA
    });

  } catch (error) {
    next(error);
  }
}

// ====================================
// EXPORTAR FUNCIONES
// ====================================

module.exports = {
  listarTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
