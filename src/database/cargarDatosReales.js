import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

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

async function cargarDatosReales() {
    console.log('🚀 Iniciando carga de datos reales del Excel...');
    
    try {
        // Limpiar datos existentes
        console.log('🧹 Limpiando datos existentes...');
        await prisma.gruposAlternativos.deleteMany();
        await prisma.grupoIndicacion.deleteMany();
        await prisma.practicaGrupo.deleteMany();
        await prisma.indicacion.deleteMany();
        await prisma.grupo.deleteMany();
        await prisma.practica.deleteMany();
        
        // Leer el archivo Excel
        console.log('📖 Leyendo archivo Excel...');
        const excelPath = path.join(__dirname, '../../REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx');
        
        let excelBuffer;
        try {
            excelBuffer = readFileSync(excelPath);
        } catch (error) {
            console.error('❌ Error leyendo Excel desde filesystem, intentando con window.fs...');
            // Si no encuentra el archivo, usar window.fs como fallback
            throw new Error('Archivo Excel no encontrado en: ' + excelPath);
        }
        
        const workbook = XLSX.read(excelBuffer);
        const practicasSheet = workbook.Sheets['PRACTICAS'];
        const practicasData = XLSX.utils.sheet_to_json(practicasSheet, { header: 1, defval: null });
        
        console.log(`✅ Excel leído: ${practicasData.length} filas encontradas`);
        
        // Mapas para agrupar datos
        const gruposMap = new Map();
        const indicacionesMap = new Map();
        const practicasArray = [];
        
        // Procesar cada fila del Excel
        console.log('🔄 Procesando prácticas...');
        let procesadas = 0;
        
        for (let i = 1; i < practicasData.length; i++) {
            const fila = practicasData[i];
            
            if (!fila || !fila[1] || !fila[2]) continue; // Saltar filas vacías
            
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
                const keyIndicacion = indicacionTexto.substring(0, 100); // Key truncado para evitar duplicados
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
            
            procesadas++;
            if (procesadas % 100 === 0) {
                console.log(`   Procesadas ${procesadas}/${practicasData.length - 1} prácticas...`);
            }
        }
        
        console.log(`✅ Procesamiento completado: ${procesadas} prácticas`);
        console.log(`📁 Grupos generados: ${gruposMap.size}`);
        console.log(`📝 Indicaciones únicas: ${indicacionesMap.size}`);
        
        // Crear indicaciones en la base de datos
        console.log('💾 Creando indicaciones en la base de datos...');
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
        console.log(`✅ ${indicacionesCreadas.length} indicaciones creadas`);
        
        // Crear grupos en la base de datos
        console.log('📁 Creando grupos en la base de datos...');
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
        console.log(`✅ ${gruposCreados.length} grupos creados`);
        
        // Crear prácticas y vinculaciones
        console.log('🔗 Creando prácticas y vinculaciones...');
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
        
        // Vincular indicaciones a grupos (lógica simplificada)
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
        console.log('');
        console.log('🎯 Grupos creados:');
        gruposCreados.forEach(grupo => {
            console.log(`   - ${grupo.nombre} (${grupo.practicasOriginales.length} prácticas)`);
        });
        
        return {
            success: true,
            estadisticas: {
                practicas: practicasCreadas,
                grupos: gruposCreados.length,
                indicaciones: indicacionesCreadas.length,
                vinculacionesPG: vinculacionesCreadas,
                vinculacionesGI: indicacionesVinculadas
            }
        };
        
    } catch (error) {
        console.error('❌ Error en la carga de datos:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    cargarDatosReales()
        .then(resultado => {
            console.log('✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error ejecutando script:', error);
            process.exit(1);
        });
}

export default cargarDatosReales;
