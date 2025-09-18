import express from 'express';
import prisma from '../database/prisma.js';
import seed from '../database/seed.js';

const router = express.Router();

// Función para limpiar y normalizar texto
function limpiarTexto(texto) {
    if (!texto) return null;
    return texto.toString().trim().replace(/\s+/g, ' ');
}

// Función para detectar patrones en las indicaciones
function analizarIndicacion(indicacion) {
    if (!indicacion) return { tipo: 'SIN_PREPARACION', ayuno: null, orina: null };
    
    const texto = indicacion.toLowerCase();
    
    // Detectar ayuno
    let ayuno = null;
    if (texto.includes('ayuno')) {
        const matchAyuno = texto.match(/ayuno.*?(\d+).*?hora/);
        if (matchAyuno) {
            ayuno = parseInt(matchAyuno[1]);
        } else if (texto.includes('ayuno')) {
            ayuno = 8; // Ayuno por defecto si no especifica horas
        }
    }
    
    // Detectar orina
    let orina = null;
    if (texto.includes('primera orina') || texto.includes('orina de la mañana')) {
        orina = 'primera_manana';
    } else if (texto.includes('24 horas') && texto.includes('orina')) {
        orina = '24_horas';
    } else if (texto.includes('12 horas') && texto.includes('orina')) {
        orina = '12_horas';
    } else if (texto.includes('orina')) {
        orina = 'general';
    }
    
    // Detectar materia fecal
    if (texto.includes('materia fecal') || texto.includes('heces')) {
        return { tipo: 'MATERIA_FECAL', ayuno, orina };
    }
    
    // Detectar recolección especial
    if (texto.includes('recolect') || texto.includes('muestra')) {
        return { tipo: 'RECOLECCION', ayuno, orina };
    }
    
    // Detectar ayuno
    if (ayuno) {
        return { tipo: 'AYUNO', ayuno, orina };
    }
    
    // Detectar medicación
    if (texto.includes('medicación') || texto.includes('medicamento')) {
        return { tipo: 'MEDICACION', ayuno, orina };
    }
    
    // Si tiene texto pero no patrones específicos
    if (texto.length > 10) {
        return { tipo: 'PREPARACION_ESPECIAL', ayuno, orina };
    }
    
    return { tipo: 'SIN_PREPARACION', ayuno, orina };
}

// Función para crear grupo basado en análisis
function crearNombreGrupo(analisis) {
    if (analisis.tipo === 'SIN_PREPARACION') return 'Sin preparación especial';
    if (analisis.tipo === 'AYUNO' && analisis.ayuno) return `Ayuno ${analisis.ayuno} horas`;
    if (analisis.tipo === 'MATERIA_FECAL') return 'Recolección materia fecal';
    if (analisis.tipo === 'RECOLECCION' && analisis.orina === 'primera_manana') return 'Primera orina mañana';
    if (analisis.tipo === 'RECOLECCION' && analisis.orina === '24_horas') return 'Orina 24 horas';
    if (analisis.tipo === 'RECOLECCION' && analisis.orina === '12_horas') return 'Orina 12 horas';
    if (analisis.tipo === 'MEDICACION') return 'Suspensión medicación';
    if (analisis.tipo === 'PREPARACION_ESPECIAL') return 'Preparación especial';
    return 'Indicaciones generales';
}

// GET /api/indicaciones - Obtener todas las indicaciones
router.get('/', async (req, res) => {
    try {
        const indicaciones = await prisma.indicacion.findMany({
            where: {
                estado: 'ACTIVO'
            },
            orderBy: {
                descripcion: 'asc'
            }
        });

        res.json({
            success: true,
            data: indicaciones,
            count: indicaciones.length
        });
    } catch (error) {
        console.error('Error obteniendo indicaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las indicaciones',
            error: error.message
        });
    }
});

// POST /api/indicaciones - Crear nueva indicación
router.post('/', async (req, res) => {
    try {
        const {
            descripcion,
            textoInstruccion,
            tipoIndicacion,
            area,
            idIndicacionInferior
        } = req.body;

        if (!descripcion || !textoInstruccion) {
            return res.status(400).json({
                success: false,
                message: 'Descripción e instrucción son requeridas'
            });
        }

        const indicacion = await prisma.indicacion.create({
            data: {
                descripcion,
                textoInstruccion,
                tipoIndicacion,
                area,
                idIndicacionInferior: idIndicacionInferior ? parseInt(idIndicacionInferior) : null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Indicación creada exitosamente',
            data: indicacion
        });
    } catch (error) {
        console.error('Error creando indicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la indicación',
            error: error.message
        });
    }
});

// POST /api/indicaciones/seed - Cargar datos de prueba
router.post('/seed', async (req, res) => {
    try {
        console.log('🌱 Iniciando carga de datos desde API...');
        await seed();
        
        res.json({
            success: true,
            message: 'Datos de prueba cargados exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en seed:', error);
        res.status(500).json({
            success: false,
            message: 'Error cargando datos de prueba',
            error: error.message
        });
    }
});

// POST /api/indicaciones/cargar-reales - Cargar datos reales del Excel
router.post('/cargar-reales', async (req, res) => {
    try {
        console.log('🚀 Iniciando carga de datos reales del Excel...');
        
        // Recibir datos del Excel procesados en el frontend
        const { excelData } = req.body;
        
        if (!excelData || !Array.isArray(excelData)) {
            return res.status(400).json({
                success: false,
                message: 'Datos del Excel requeridos'
            });
        }
        
        // Limpiar datos existentes
        console.log('🧹 Limpiando datos existentes...');
        await prisma.gruposAlternativos.deleteMany();
        await prisma.grupoIndicacion.deleteMany();
        await prisma.practicaGrupo.deleteMany();
        await prisma.indicacion.deleteMany();
        await prisma.grupo.deleteMany();
        await prisma.practica.deleteMany();
        
        // Mapas para agrupar datos
        const gruposMap = new Map();
        const indicacionesMap = new Map();
        
        console.log(`🔄 Procesando ${excelData.length} prácticas...`);
        
        // Procesar cada fila
        for (let i = 0; i < excelData.length; i++) {
            const fila = excelData[i];
            
            if (!fila[1] || !fila[2]) continue; // Saltar filas vacías
            
            const idPractica = fila[1];
            const descripcion = limpiarTexto(fila[2]);
            const area = limpiarTexto(fila[4]) || 'GENERAL';
            const indicacionTexto = limpiarTexto(fila[7]);
            
            // Crear la práctica
            const practica = {
                idOriginal: idPractica,
                nombre: descripcion,
                codigo: `${area.substring(0, 4).toUpperCase()}${String(idPractica).padStart(3, '0')}`,
                area: area
            };
            
            // Analizar la indicación
            const analisis = analizarIndicacion(indicacionTexto);
            const nombreGrupo = crearNombreGrupo(analisis);
            
            // Crear o encontrar grupo
            if (!gruposMap.has(nombreGrupo)) {
                gruposMap.set(nombreGrupo, {
                    nombre: nombreGrupo,
                    descripcion: `Grupo generado automáticamente para ${analisis.tipo.toLowerCase()}`,
                    ayunoHoras: analisis.ayuno,
                    orinaHoras: analisis.orina === '24_horas' ? 24 : (analisis.orina === '12_horas' ? 12 : null),
                    orinaTipo: analisis.orina,
                    practicas: []
                });
            }
            
            // Agregar práctica al grupo
            gruposMap.get(nombreGrupo).practicas.push(practica);
            
            // Crear indicación si existe texto
            if (indicacionTexto && indicacionTexto.length > 5) {
                const keyIndicacion = indicacionTexto.substring(0, 100);
                if (!indicacionesMap.has(keyIndicacion)) {
                    indicacionesMap.set(keyIndicacion, {
                        descripcion: analisis.tipo === 'SIN_PREPARACION' ? 'Sin preparación especial' : 
                                   analisis.tipo === 'AYUNO' ? `Ayuno de ${analisis.ayuno || 8} horas` :
                                   `Preparación para ${analisis.tipo.toLowerCase()}`,
                        textoInstruccion: indicacionTexto,
                        tipoIndicacion: analisis.tipo,
                        area: area
                    });
                }
            }
        }
        
        console.log(`✅ Procesamiento completado`);
        console.log(`📁 Grupos generados: ${gruposMap.size}`);
        console.log(`📝 Indicaciones únicas: ${indicacionesMap.size}`);
        
        // Crear indicaciones en la base de datos
        console.log('💾 Creando indicaciones...');
        const indicacionesCreadas = [];
        for (const [key, indicacion] of indicacionesMap.entries()) {
            try {
                const indicacionCreada = await prisma.indicacion.create({
                    data: indicacion
                });
                indicacionesCreadas.push(indicacionCreada);
            } catch (error) {
                console.error(`Error creando indicación: ${error.message}`);
            }
        }
        
        // Crear grupos
        console.log('📁 Creando grupos...');
        const gruposCreados = [];
        for (const [nombre, grupo] of gruposMap.entries()) {
            try {
                const grupoCreado = await prisma.grupo.create({
                    data: {
                        nombre: grupo.nombre,
                        descripcion: grupo.descripcion,
                        ayunoHoras: grupo.ayunoHoras,
                        orinaHoras: grupo.orinaHoras,
                        orinaTipo: grupo.orinaTipo
                    }
                });
                gruposCreados.push({ ...grupoCreado, practicasOriginales: grupo.practicas });
            } catch (error) {
                console.error(`Error creando grupo ${nombre}: ${error.message}`);
            }
        }
        
        // Crear prácticas y vinculaciones
        console.log('🔗 Creando prácticas...');
        let practicasCreadas = 0;
        let vinculacionesCreadas = 0;
        
        for (const grupo of gruposCreados) {
            for (const practicaData of grupo.practicasOriginales) {
                try {
                    // Crear la práctica
                    const practica = await prisma.practica.create({
                        data: {
                            nombre: practicaData.nombre,
                            codigo: practicaData.codigo
                        }
                    });
                    
                    // Vincular práctica al grupo
                    await prisma.practicaGrupo.create({
                        data: {
                            idPractica: practica.id,
                            idGrupo: grupo.id
                        }
                    });
                    
                    practicasCreadas++;
                    vinculacionesCreadas++;
                    
                } catch (error) {
                    console.error(`Error creando práctica ${practicaData.codigo}: ${error.message}`);
                }
            }
        }
        
        // Vincular indicaciones a grupos
        console.log('🔗 Vinculando indicaciones a grupos...');
        let indicacionesVinculadas = 0;
        
        for (let i = 0; i < gruposCreados.length && i < indicacionesCreadas.length; i++) {
            try {
                await prisma.grupoIndicacion.create({
                    data: {
                        idGrupo: gruposCreados[i].id,
                        idIndicacion: indicacionesCreadas[i % indicacionesCreadas.length].id,
                        orden: 1
                    }
                });
                indicacionesVinculadas++;
            } catch (error) {
                console.error(`Error vinculando indicación: ${error.message}`);
            }
        }
        
        console.log('\n🎉 ¡CARGA DE DATOS REALES COMPLETADA!');
        console.log('📊 Resumen final:');
        console.log(`   - ${practicasCreadas} prácticas creadas`);
        console.log(`   - ${gruposCreados.length} grupos creados`);
        console.log(`   - ${indicacionesCreadas.length} indicaciones creadas`);
        console.log(`   - ${vinculacionesCreadas} vinculaciones práctica-grupo`);
        console.log(`   - ${indicacionesVinculadas} vinculaciones grupo-indicación`);
        
        res.json({
            success: true,
            message: 'Datos reales cargados exitosamente',
            estadisticas: {
                practicas: practicasCreadas,
                grupos: gruposCreados.length,
                indicaciones: indicacionesCreadas.length,
                vinculacionesPG: vinculacionesCreadas,
                vinculacionesGI: indicacionesVinculadas
            },
            grupos: gruposCreados.map(g => ({ 
                nombre: g.nombre, 
                practicas: g.practicasOriginales.length 
            }))
        });
        
    } catch (error) {
        console.error('❌ Error cargando datos reales:', error);
        res.status(500).json({
            success: false,
            message: 'Error cargando datos reales del Excel',
            error: error.message
        });
    }
});

export default router;
