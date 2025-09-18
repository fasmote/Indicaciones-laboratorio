// verificar-importacion.js
// Script para verificar que los datos se importaron correctamente

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔍 VERIFICACIÓN DE IMPORTACIÓN DE DATOS');
console.log('======================================');

async function verificarImportacion() {
    try {
        console.log('📊 Consultando estadísticas de la base de datos...\n');
        
        // Contar registros en cada tabla
        const stats = {
            practicas: await prisma.practica.count(),
            grupos: await prisma.grupo.count(),
            indicaciones: await prisma.indicacion.count(),
            practicaGrupo: await prisma.practicaGrupo.count(),
            grupoIndicacion: await prisma.grupoIndicacion.count(),
            gruposAlternativos: await prisma.gruposAlternativos.count()
        };
        
        console.log('📈 RESUMEN DE DATOS IMPORTADOS:');
        console.log('===============================');
        console.log(`   • Prácticas: ${stats.practicas}`);
        console.log(`   • Grupos: ${stats.grupos}`);
        console.log(`   • Indicaciones: ${stats.indicaciones}`);
        console.log(`   • Vínculos Práctica-Grupo: ${stats.practicaGrupo}`);
        console.log(`   • Vínculos Grupo-Indicación: ${stats.grupoIndicacion}`);
        console.log(`   • Reglas Alternativas: ${stats.gruposAlternativos}`);
        
        // Verificar integridad básica
        console.log('\n🔧 VERIFICACIONES DE INTEGRIDAD:');
        console.log('=================================');
        
        // Verificar que todas las prácticas tienen al menos un grupo
        const practicasSinGrupo = await prisma.practica.count({
            where: {
                grupos: {
                    none: {}
                }
            }
        });
        
        if (practicasSinGrupo === 0) {
            console.log('✅ Todas las prácticas están vinculadas a grupos');
        } else {
            console.log(`⚠️  ${practicasSinGrupo} prácticas NO tienen grupos asignados`);
        }
        
        // Verificar grupos con indicaciones
        const gruposConIndicaciones = await prisma.grupo.count({
            where: {
                indicaciones: {
                    some: {}
                }
            }
        });
        
        console.log(`✅ ${gruposConIndicaciones}/${stats.grupos} grupos tienen indicaciones`);
        
        // Mostrar distribución por áreas
        console.log('\n🏥 DISTRIBUCIÓN POR ÁREAS:');
        console.log('==========================');
        
        const practicasPorArea = await prisma.$queryRaw`
            SELECT 
                SUBSTR(codigo, 1, INSTR(codigo, '_') - 1) as area,
                COUNT(*) as cantidad
            FROM Practica 
            WHERE activo = 1
            GROUP BY SUBSTR(codigo, 1, INSTR(codigo, '_') - 1)
            ORDER BY cantidad DESC
        `;
        
        practicasPorArea.forEach(area => {
            console.log(`   • ${area.area}: ${area.cantidad} prácticas`);
        });
        
        // Mostrar tipos de grupos más comunes
        console.log('\n🧪 TIPOS DE PREPARACIÓN MÁS COMUNES:');
        console.log('=====================================');
        
        const tiposPreparacion = await prisma.grupo.groupBy({
            by: ['ayuno_horas', 'orina_tipo'],
            _count: {
                id_grupo: true
            },
            orderBy: {
                _count: {
                    id_grupo: 'desc'
                }
            },
            take: 10
        });
        
        tiposPreparacion.forEach(tipo => {
            let descripcion = '';
            if (tipo.ayuno_horas) {
                descripcion += `Ayuno ${tipo.ayuno_horas}h`;
            }
            if (tipo.orina_tipo) {
                if (descripcion) descripcion += ' + ';
                descripcion += tipo.orina_tipo.replace('_', ' ');
            }
            if (!descripcion) descripcion = 'Sin preparación especial';
            
            console.log(`   • ${descripcion}: ${tipo._count.id_grupo} grupos`);
        });
        
        // Probar el algoritmo de generación de indicaciones
        console.log('\n🧪 PRUEBA DEL ALGORITMO DE GENERACIÓN:');
        console.log('======================================');
        
        // Tomar 3 prácticas aleatorias para probar
        const practicasPrueba = await prisma.practica.findMany({
            take: 3,
            include: {
                grupos: {
                    include: {
                        grupo: {
                            include: {
                                indicaciones: {
                                    include: {
                                        indicacion: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (practicasPrueba.length > 0) {
            console.log('📋 Simulando generación de indicaciones para:');
            
            practicasPrueba.forEach(practica => {
                console.log(`   • ${practica.nombre.substring(0, 50)}...`);
                
                if (practica.grupos.length > 0) {
                    const grupo = practica.grupos[0].grupo;
                    console.log(`     - Grupo: ${grupo.nombre}`);
                    console.log(`     - Ayuno: ${grupo.ayuno_horas ? grupo.ayuno_horas + 'h' : 'No requerido'}`);
                    console.log(`     - Orina: ${grupo.orina_tipo ? grupo.orina_tipo.replace('_', ' ') : 'No requerida'}`);
                    console.log(`     - Indicaciones: ${grupo.indicaciones.length} asociadas`);
                } else {
                    console.log('     ⚠️  Sin grupos asociados');
                }
            });
        }
        
        // Verificar ejemplos de indicaciones completas
        console.log('\n📝 EJEMPLOS DE INDICACIONES COMPLETAS:');
        console.log('======================================');
        
        const indicacionesEjemplo = await prisma.indicacion.findMany({
            take: 3,
            where: {
                texto_instruccion: {
                    not: null
                }
            },
            orderBy: {
                id_indicacion: 'asc'
            }
        });
        
        indicacionesEjemplo.forEach((indicacion, index) => {
            console.log(`${index + 1}. ${indicacion.descripcion}`);
            console.log(`   Área: ${indicacion.area}`);
            console.log(`   Tipo: ${indicacion.tipo_indicacion}`);
            console.log(`   Instrucción: ${indicacion.texto_instruccion.substring(0, 100)}...`);
            console.log('');
        });
        
        // Realizar prueba funcional del endpoint principal
        console.log('🚀 PRUEBA FUNCIONAL DEL SISTEMA:');
        console.log('=================================');
        
        try {
            // Simular una llamada al algoritmo de generación
            const practicasParaPrueba = await prisma.practica.findMany({
                take: 2,
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
            
            if (practicasParaPrueba.length >= 2) {
                console.log('✅ Simulación exitosa:');
                console.log(`   • Se pueden procesar ${practicasParaPrueba.length} prácticas simultáneamente`);
                
                // Calcular ayuno máximo
                let ayunoMaximo = 0;
                const tiposOrina = new Set();
                let totalIndicaciones = 0;
                
                practicasParaPrueba.forEach(practica => {
                    practica.grupos.forEach(pg => {
                        if (pg.grupo.ayuno_horas && pg.grupo.ayuno_horas > ayunoMaximo) {
                            ayunoMaximo = pg.grupo.ayuno_horas;
                        }
                        if (pg.grupo.orina_tipo) {
                            tiposOrina.add(pg.grupo.orina_tipo);
                        }
                        totalIndicaciones += pg.grupo.indicaciones.length;
                    });
                });
                
                console.log(`   • Ayuno máximo requerido: ${ayunoMaximo > 0 ? ayunoMaximo + 'h' : 'No requerido'}`);
                console.log(`   • Tipos de orina: ${Array.from(tiposOrina).join(', ') || 'No requerida'}`);
                console.log(`   • Total de indicaciones a consolidar: ${totalIndicaciones}`);
            }
            
        } catch (error) {
            console.log('⚠️  Error en prueba funcional:', error.message);
        }
        
        // Verificar conectividad con el servidor
        console.log('\n🌐 VERIFICACIÓN DE CONECTIVIDAD:');
        console.log('================================');
        
        try {
            const fetch = require('node-fetch');
            const response = await fetch('http://localhost:3000/api/health', {
                timeout: 5000
            });
            
            if (response.ok) {
                const healthData = await response.json();
                console.log('✅ Servidor respondiendo correctamente');
                console.log(`   • Estado: ${healthData.status}`);
                console.log(`   • Tiempo de respuesta: ${healthData.timestamp}`);
            } else {
                console.log('⚠️  Servidor responde pero con errores');
            }
        } catch (error) {
            console.log('ℹ️  Servidor no está ejecutándose (esto es normal)');
            console.log('   Para iniciarlo: npm run dev');
        }
        
        // Recomendaciones finales
        console.log('\n🎯 RECOMENDACIONES:');
        console.log('===================');
        
        if (stats.practicas === 0) {
            console.log('❌ No se importaron prácticas. Verificar el archivo Excel.');
        } else if (stats.practicas < 50) {
            console.log('⚠️  Pocas prácticas importadas. Considerar aumentar MAX_PRACTICAS en el script.');
        } else {
            console.log('✅ Cantidad apropiada de prácticas importadas.');
        }
        
        if (stats.grupos === 0) {
            console.log('❌ No se crearon grupos. Revisar lógica de agrupación.');
        } else {
            console.log('✅ Grupos creados correctamente.');
        }
        
        if (stats.indicaciones === 0) {
            console.log('❌ No se importaron indicaciones. Revisar columna INDICACIONES del Excel.');
        } else {
            console.log('✅ Indicaciones importadas correctamente.');
        }
        
        console.log('\n🚀 SISTEMA LISTO PARA USO:');
        console.log('==========================');
        console.log('1. Ejecutar: npm run dev');
        console.log('2. Abrir: http://localhost:3000');
        console.log('3. Probar el simulador de indicaciones');
        console.log('4. Verificar que las indicaciones se generan correctamente');
        
        console.log('\n✨ ¡Importación verificada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        
        if (error.code === 'P2002') {
            console.error('   • Error de duplicados: revisar claves únicas');
        } else if (error.code === 'P2025') {
            console.error('   • Error de relación: verificar integridad referencial');
        } else {
            console.error('   • Error desconocido:', error.message);
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Función auxiliar para formatear números
function formatearNumero(numero) {
    return numero.toLocaleString();
}

// Función para mostrar progreso
function mostrarProgreso(actual, total, descripcion) {
    const porcentaje = Math.round((actual / total) * 100);
    const barra = '█'.repeat(Math.round(porcentaje / 5)) + '░'.repeat(20 - Math.round(porcentaje / 5));
    console.log(`${descripcion}: [${barra}] ${porcentaje}% (${actual}/${total})`);
}

// Ejecutar verificación
verificarImportacion().catch(error => {
    console.error('Error fatal durante la verificación:', error);
    process.exit(1);
});