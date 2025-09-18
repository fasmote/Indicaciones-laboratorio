import prisma from '../database/prisma.js';

// Obtener todos los grupos
export const getGrupos = async (req, res) => {
    try {
        const grupos = await prisma.grupo.findMany({
            where: {
                activo: true
            },
            include: {
                practicas: {
                    include: {
                        practica: {
                            select: {
                                id: true,
                                nombre: true,
                                codigo: true
                            }
                        }
                    }
                },
                indicaciones: {
                    include: {
                        indicacion: true
                    },
                    orderBy: {
                        orden: 'asc'
                    }
                }
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        res.json({
            success: true,
            data: grupos,
            count: grupos.length
        });
    } catch (error) {
        console.error('Error obteniendo grupos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los grupos',
            error: error.message
        });
    }
};

// Crear nuevo grupo
export const createGrupo = async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            ayunoHoras, 
            orinaHoras, 
            orinaTipo,
            indicaciones = []
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const grupo = await prisma.grupo.create({
            data: {
                nombre,
                descripcion,
                ayunoHoras: ayunoHoras ? parseInt(ayunoHoras) : null,
                orinaHoras: orinaHoras ? parseInt(orinaHoras) : null,
                orinaTipo,
                indicaciones: {
                    create: indicaciones.map((ind, index) => ({
                        idIndicacion: ind.id,
                        orden: ind.orden || index + 1
                    }))
                }
            },
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
        });

        res.status(201).json({
            success: true,
            message: 'Grupo creado exitosamente',
            data: grupo
        });
    } catch (error) {
        console.error('Error creando grupo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el grupo',
            error: error.message
        });
    }
};

// Obtener grupo por ID
export const getGrupoById = async (req, res) => {
    try {
        const { id } = req.params;
        const grupo = await prisma.grupo.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                practicas: {
                    include: {
                        practica: true
                    }
                },
                indicaciones: {
                    include: {
                        indicacion: true
                    },
                    orderBy: {
                        orden: 'asc'
                    }
                },
                gruposAlternativosCondicion1: {
                    include: {
                        grupoCondicion2: true,
                        grupoResultante: true
                    }
                },
                gruposAlternativosCondicion2: {
                    include: {
                        grupoCondicion1: true,
                        grupoResultante: true
                    }
                }
            }
        });

        if (!grupo) {
            return res.status(404).json({
                success: false,
                message: 'Grupo no encontrado'
            });
        }

        res.json({
            success: true,
            data: grupo
        });
    } catch (error) {
        console.error('Error obteniendo grupo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el grupo',
            error: error.message
        });
    }
};

// Vincular práctica a grupo
export const vincularPractica = async (req, res) => {
    try {
        const { grupoId, practicaId } = req.body;

        if (!grupoId || !practicaId) {
            return res.status(400).json({
                success: false,
                message: 'ID de grupo y práctica son requeridos'
            });
        }

        const vinculacion = await prisma.practicaGrupo.create({
            data: {
                idGrupo: parseInt(grupoId),
                idPractica: parseInt(practicaId)
            }
        });

        res.status(201).json({
            success: true,
            message: 'Práctica vinculada al grupo exitosamente',
            data: vinculacion
        });
    } catch (error) {
        console.error('Error vinculando práctica:', error);
        
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'La práctica ya está vinculada a este grupo'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al vincular la práctica',
            error: error.message
        });
    }
};

// Generar indicaciones para múltiples prácticas
export const generarIndicaciones = async (req, res) => {
    try {
        const { practicasIds } = req.body;

        if (!practicasIds || !Array.isArray(practicasIds) || practicasIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de IDs de prácticas'
            });
        }

        // Obtener todas las prácticas con sus grupos e indicaciones
        const practicas = await prisma.practica.findMany({
            where: {
                id: { in: practicasIds.map(id => parseInt(id)) },
                activo: true
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

        // Lógica para generar indicaciones compatibles
        let indicacionesGeneradas = [];
        let ayunoMaximo = 0;
        let orinaRequerida = null;

        // Recopilar todas las indicaciones únicas
        const indicacionesUnicas = new Map();

        practicas.forEach(practica => {
            practica.grupos.forEach(pg => {
                const grupo = pg.grupo;
                
                // Verificar ayuno máximo requerido
                if (grupo.ayunoHoras && grupo.ayunoHoras > ayunoMaximo) {
                    ayunoMaximo = grupo.ayunoHoras;
                }

                // Verificar requerimiento de orina
                if (grupo.orinaHoras || grupo.orinaTipo) {
                    orinaRequerida = {
                        horas: grupo.orinaHoras,
                        tipo: grupo.orinaTipo
                    };
                }

                // Agregar indicaciones del grupo
                grupo.indicaciones.forEach(gi => {
                    const key = gi.indicacion.id;
                    if (!indicacionesUnicas.has(key)) {
                        indicacionesUnicas.set(key, {
                            ...gi.indicacion,
                            orden: gi.orden,
                            grupo: grupo.nombre
                        });
                    }
                });
            });
        });

        // Convertir a array y ordenar
        indicacionesGeneradas = Array.from(indicacionesUnicas.values())
            .sort((a, b) => a.orden - b.orden);

        // Generar indicación de ayuno si es necesario
        if (ayunoMaximo > 0) {
            indicacionesGeneradas.unshift({
                id: 'ayuno_generado',
                descripcion: `Ayuno de ${ayunoMaximo} horas`,
                textoInstruccion: `El paciente debe mantener ayuno de ${ayunoMaximo} horas antes del estudio. Puede tomar agua.`,
                tipoIndicacion: 'AYUNO',
                area: 'GENERAL',
                orden: 0
            });
        }

        // Generar indicación de orina si es necesario
        if (orinaRequerida) {
            const textoOrina = orinaRequerida.horas 
                ? `Recolectar orina de ${orinaRequerida.horas} horas` 
                : `Recolectar ${orinaRequerida.tipo}`;
            
            indicacionesGeneradas.push({
                id: 'orina_generada',
                descripcion: textoOrina,
                textoInstruccion: `${textoOrina}. Seguir las instrucciones del laboratorio para la correcta recolección.`,
                tipoIndicacion: 'RECOLECCION',
                area: 'GENERAL',
                orden: 999
            });
        }

        res.json({
            success: true,
            data: {
                practicas: practicas.map(p => ({
                    id: p.id,
                    nombre: p.nombre,
                    codigo: p.codigo
                })),
                indicaciones: indicacionesGeneradas,
                resumen: {
                    ayunoRequerido: ayunoMaximo,
                    orinaRequerida,
                    totalIndicaciones: indicacionesGeneradas.length
                }
            }
        });

    } catch (error) {
        console.error('Error generando indicaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar las indicaciones',
            error: error.message
        });
    }
};
