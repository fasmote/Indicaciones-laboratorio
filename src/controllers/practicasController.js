import prisma from '../database/prisma.js';

// Obtener todas las prácticas
export const getPracticas = async (req, res) => {
    try {
        const practicas = await prisma.practica.findMany({
            where: {
                activo: true
            },
            include: {
                grupos: {
                    include: {
                        grupo: {
                            select: {
                                id: true,
                                nombre: true,
                                descripcion: true,
                                ayunoHoras: true,
                                orinaHoras: true,
                                orinaTipo: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        res.json({
            success: true,
            data: practicas,
            count: practicas.length
        });
    } catch (error) {
        console.error('Error obteniendo prácticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las prácticas',
            error: error.message
        });
    }
};

// Obtener una práctica por ID
export const getPracticaById = async (req, res) => {
    try {
        const { id } = req.params;
        const practica = await prisma.practica.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                grupos: {
                    include: {
                        grupo: {
                            include: {
                                indicaciones: {
                                    include: {
                                        indicacion: true
                                    },
                                    orderBy: {
                                        orden: 'asc'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!practica) {
            return res.status(404).json({
                success: false,
                message: 'Práctica no encontrada'
            });
        }

        res.json({
            success: true,
            data: practica
        });
    } catch (error) {
        console.error('Error obteniendo práctica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la práctica',
            error: error.message
        });
    }
};

// Crear nueva práctica
export const createPractica = async (req, res) => {
    try {
        const { nombre, codigo } = req.body;

        if (!nombre || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y código son requeridos'
            });
        }

        const practica = await prisma.practica.create({
            data: {
                nombre,
                codigo
            }
        });

        res.status(201).json({
            success: true,
            message: 'Práctica creada exitosamente',
            data: practica
        });
    } catch (error) {
        console.error('Error creando práctica:', error);
        
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una práctica con ese código'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear la práctica',
            error: error.message
        });
    }
};

// Actualizar práctica
export const updatePractica = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, codigo, activo } = req.body;

        const practica = await prisma.practica.update({
            where: {
                id: parseInt(id)
            },
            data: {
                ...(nombre && { nombre }),
                ...(codigo && { codigo }),
                ...(activo !== undefined && { activo })
            }
        });

        res.json({
            success: true,
            message: 'Práctica actualizada exitosamente',
            data: practica
        });
    } catch (error) {
        console.error('Error actualizando práctica:', error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Práctica no encontrada'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar la práctica',
            error: error.message
        });
    }
};

// Eliminar práctica (soft delete)
export const deletePractica = async (req, res) => {
    try {
        const { id } = req.params;

        const practica = await prisma.practica.update({
            where: {
                id: parseInt(id)
            },
            data: {
                activo: false
            }
        });

        res.json({
            success: true,
            message: 'Práctica eliminada exitosamente',
            data: practica
        });
    } catch (error) {
        console.error('Error eliminando práctica:', error);
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Práctica no encontrada'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar la práctica',
            error: error.message
        });
    }
};
