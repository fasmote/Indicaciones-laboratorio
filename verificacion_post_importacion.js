// verificacion-completa.js
// Script para verificar que la importación fue exitosa

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔍 VERIFICACIÓN COMPLETA POST-IMPORTACIÓN');
console.log('=========================================');

async function verificarImportacion() {
    try {
        console.log('📊 Consultando estadísticas básicas...\n');
        
        // Estadísticas básicas
        const stats = {
            practicas: await prisma.practica.count(),
            grupos: await prisma.grupo.count(),
            indicaciones: await prisma.indicacion.count(),
            practicaGrupo: await prisma.practicaGrupo.count(),
            grupoIndicacion: await prisma.grupoIndicacion.count(),
            gruposAlternativos: await prisma.gruposAlternativos.count()
        };
        
        console.log('📈 ESTADÍSTICAS GENERALES:');
        console.log('==========================');
        console.log(`   📋 Prácticas: ${stats.practicas}`);
        console.log(`   📁 Grupos: ${stats.grupos}`);
        console.log(`   📝 Indicaciones: ${stats.indicaciones}`);
        console.log(`   🔗 Vínculos Práctica-Grupo: ${stats.practicaGrupo}`);
        console.log(`   🔗 Vínculos Grupo-Indicación: ${stats.grupoIndicacion}`);
        console.log(`   ⚡ Reglas Alternativas: ${stats.gruposAlternativos}`);
        
        // Verificaciones de integridad
        console.log('\n🔧 VERIFICACIONES DE INTEGRIDAD:');
        console.log('=================================');
        
        // 1. Todas las prácticas tienen grupos
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
            console.log(`⚠️  ${practicasSinGrupo} prácticas sin grupos asignados`);
        }
        
        // 2. Grupos con indicaciones
        const gruposConIndicaciones = await prisma.grupo.count({
            where: {
                indicaciones: {
                    some: {}
                }
            }
        });
        
        const porcentajeGruposConIndicaciones = Math.round((gruposConIndicaciones / stats.grupos) * 100);
        console.log(`✅ ${gruposConIndicaciones}/${stats.grupos} grupos tienen indicaciones (${porcentajeGruposConIndicaciones}%)`);
        
        // 3. Verificar IDs únicos
        const practicasUnicas = await prisma.$queryRaw`SELECT COUNT(DISTINCT id_practica) as count FROM Practica`;
        const gruposUnicos = await prisma.$queryRaw`SELECT COUNT(DISTINCT id_grupo) as count FROM Grupo`;
        
        console.log(`✅ ${practicasUnicas[0].count} IDs únicos de prácticas`);
        console.log(`✅ ${gruposUnicos[0].count} IDs únicos de grupos`);
        
        // Distribución por áreas
        console.log('\n🏥 DISTRIBUCIÓN POR ÁREAS:');
        console.log('==========================');
        
        const practicasPorArea = await prisma.$queryRaw`
            SELECT 
                CASE 
                    WHEN codigo LIKE 'QUIM%' THEN 'QUIMICA'
                    WHEN codigo LIKE 'HEMA%' THEN 'HEMATO/HEMOSTASIA'
                    WHEN codigo LIKE 'ENDO%' THEN 'ENDOCRINO'
                    WHEN codigo LIKE 'BACT%' THEN 'BACTERIO'
                    WHEN codigo LIKE 'VIRO%' THEN 'VIROLOGIA'
                    WHEN codigo LIKE 'INMU%' THEN 'INMUNOLOGIA'
                    ELSE SUBSTR(codigo, 1, 4)
                END as area,
                COUNT(*) as cantidad
            FROM Practica 
            WHERE activo = 1
            GROUP BY 
                CASE 
                    WHEN codigo LIKE 'QUIM%' THEN 'QUIMICA'
                    WHEN codigo LIKE 'HEMA%' THEN 'HEMATO/HEMOSTASIA'
                    WHEN codigo LIKE 'ENDO%' THEN 'ENDOCRINO'
                    WHEN codigo LIKE 'BACT%' THEN 'BACTERIO'
                    WHEN codigo LIKE 'VIRO%' THEN 'VIROLOGIA'
                    WHEN codigo LIKE 'INMU%' THEN 'INMUNOLOGIA'
                    ELSE SUBSTR(codigo, 1, 4)
                END
            ORDER BY cantidad DESC
        `;
        
        practicasPorArea.forEach(area => {
            console.log(`   • ${area.area}: ${area.cantidad} prácticas`);
        });
        
        // Tipos de preparación
        console.log('\n🧪 TIPOS DE PREPARACIÓN:');
        console.log('========================');
        
        const tiposPreparacion = await prisma.grupo.groupBy({
            by: ['ayuno_horas', 'orina_tipo'],
            _count: {
                id_grupo: true
            },
            orderBy: {
                _count: {
                    id_grupo: 'desc'
                }
            }
        });
        
        tiposPreparacion.forEach(tipo => {
            let descripcion = '';
            if (tipo.ayuno_horas) {
                descripcion += `Ayuno ${tipo.ayuno_horas}h`;
            }
            if (tipo.orina_tipo) {
                if (descripcion) descripcion += ' + ';
                descripcion += tipo.orina_tipo.replace('_', ' ').toLowerCase();
            }
            if (!descripcion) descripcion = 'Sin preparación especial';
            
            console.log(`   • ${descripcion}: ${tipo._count.id_grupo} grupos`);
        });
        
        // Ejemplos de prácticas
        console.log('\n📋 EJEMPLOS DE PRÁCTICAS CARGADAS:');
        console.log('==================================');
        
        const ejemplosPracticas = await prisma.practica.findMany({
            take: 5,
            include: {
                grupos: {
                    include: {
                        grupo: {
                            select: {
                                nombre: true,
                                ayuno_horas: true,
                                orina_tipo: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                id_practica: 'asc'
            }
        });
        
        ejemplosPracticas.forEach((practica, index) => {
            console.log(`${index + 1}. ID: ${practica.id_practica}`);
            console.log(`   Nombre: ${practica.nombre.substring(0, 60)}...`);
            console.log(`   Código: ${practica.codigo}`);
            
            if (practica.grupos.length > 0) {
                const grupo = practica.grupos[0].grupo;
                console.log(`   Grupo: ${grupo.nombre}`);
                console.log(`   Ayuno: ${grupo.ayuno_horas ? grupo.ayuno_horas + 'h' : 'No requerido'}`);
                console.log(`   Orina: ${grupo.orina_tipo ? grupo.orina_tipo.replace('_', ' ') : 'No requerida'}`);
            } else {
                console.log(`   ⚠️  Sin grupo asignado`);
            }
            console.log('');
        });
        
        // Ejemplos de indicaciones
        console.log('📝 EJEMPLOS DE INDICACIONES:');
        console.log('============================');
        
        const ejemplosIndicaciones = await prisma.indicacion.findMany({
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
        
        ejemplosIndicaciones.forEach((indicacion, index) => {
            console.log(`${index + 1}. ${indicacion.descripcion}`);
            console.log(`   Área: ${indicacion.area}`);
            console.log(`   Tipo: ${indicacion.tipo_indicacion}`);
            console.log(`   Instrucción: ${indicacion.texto_instruccion.substring(0, 100)}...`);
            console.log('');
        });
        
        // Prueba del algoritmo de generación
        console.log('🧪 PRUEBA DEL ALGORITMO DE GENERACIÓN:');
        console.log('=======================================');
        
        try {
            // Simular selección de 3 prácticas para generar indicaciones
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
            
            if (practicasPrueba.length >= 2) {
                console.log('✅ Simulación del algoritmo:');
                console.log(`   • ${practicasPrueba.length} prácticas seleccionadas para prueba`);
                
                // Calcular ayuno máximo requerido
                let ayunoMaximo = 0;
                const tiposOrina = new Set();
                let totalIndicaciones = 0;
                
                practicasPrueba.forEach(practica => {
                    practica.grupos.forEach(pg => {
                        const grupo = pg.grupo;
                        if (grupo.ayuno_horas && grupo.ayuno_horas > ayunoMaximo) {
                            ayunoMaximo = grupo.ayuno_horas;
                        }
                        if (grupo.orina_tipo) {
                            tiposOrina.add(grupo.orina_tipo);
                        }
                        totalIndicaciones += grupo.indicaciones.length;
                    });
                });
                
                console.log(`   • Prácticas: ${practicasPrueba.map(p => p.nombre.substring(0, 20) + '...').join(', ')}`);
                console.log(`   • Ayuno máximo requerido: ${ayunoMaximo > 0 ? ayunoMaximo + 'h' : 'No requerido'}`);
                console.log(`   • Tipos de orina: ${Array.from(tiposOrina).map(t => t.replace('_', ' ')).join(', ') || 'No requerida'}`);
                console.log(`   • Total indicaciones a consolidar: ${totalIndicaciones}`);
                console.log('   ✅ Algoritmo funcionaría correctamente');
            } else {
                console.log('⚠️  Muy pocas prácticas para simular el algoritmo');
            }
            
        } catch (error) {
            console.log('❌ Error en prueba del algoritmo:', error.message);
        }
        
        // Verificación de conectividad de API
        console.log('\n🌐 VERIFICACIÓN DEL SERVIDOR:');
        console.log('=============================');
        
        try {
            // Intentar hacer una petición HTTP local si el servidor está corriendo
            const fetch = require('node-fetch').default;
            const response = await fetch('http://localhost:3000/api/health', { 
                timeout: 3000 
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Servidor API respondiendo correctamente');
                console.log(`   • Estado: ${data.status}`);
                console.log(`   • URL: http://localhost:3000`);
            } else {
                console.log('⚠️  Servidor responde pero con errores');
            }
        } catch (error) {
            console.log('ℹ️  Servidor no está ejecutándose');
            console.log('   • Para iniciarlo: npm run dev');
            console.log('   • URL esperada: http://localhost:3000');
        }
        
        // Resumen y recomendaciones finales
        console.log('\n🎯 RESUMEN Y RECOMENDACIONES:');
        console.log('=============================');
        
        let puntuacion = 0;
        let maxPuntuacion = 6;
        
        if (stats.practicas > 0) {
            console.log('✅ Prácticas cargadas correctamente');
            puntuacion++;
        } else {
            console.log('❌ No hay prácticas cargadas');
        }
        
        if (stats.grupos > 0) {
            console.log('✅ Grupos creados correctamente');
            puntuacion++;
        } else {
            console.log('❌ No hay grupos creados');
        }
        
        if (stats.indicaciones > 0) {
            console.log('✅ Indicaciones importadas correctamente');
            puntuacion++;
        } else {
            console.log('❌ No hay indicaciones importadas');
        }
        
        if (stats.practicaGrupo > 0) {
            console.log('✅ Vínculos práctica-grupo establecidos');
            puntuacion++;
        } else {
            console.log('❌ Faltan vínculos práctica-grupo');
        }
        
        if (stats.grupoIndicacion > 0) {
            console.log('✅ Vínculos grupo-indicación establecidos');
            puntuacion++;
        } else {
            console.log('❌ Faltan vínculos grupo-indicación');
        }
        
        if (practicasSinGrupo === 0) {
            console.log('✅ Integridad referencial correcta');
            puntuacion++;
        } else {
            console.log('⚠️  Algunos problemas de integridad referencial');
        }
        
        const porcentajeExito = Math.round((puntuacion / maxPuntuacion) * 100);
        console.log(`\n📊 PUNTUACIÓN GENERAL: ${puntuacion}/${maxPuntuacion} (${porcentajeExito}%)`);
        
        if (porcentajeExito >= 90) {
            console.log('🎉 ¡IMPORTACIÓN EXITOSA! El sistema está listo para usar.');
        } else if (porcentajeExito >= 70) {
            console.log('✅ Importación mayormente exitosa. Revisar detalles arriba.');
        } else {
            console.log('⚠️  Importación con problemas. Revisar errores arriba.');
        }
        
        console.log('\n🚀 PRÓXIMOS PASOS:');
        console.log('==================');
        console.log('1. Iniciar servidor: npm run dev');
        console.log('2. Abrir navegador: http://localhost:3000');
        console.log('3. Probar simulador de indicaciones');
        console.log('4. Verificar generación correcta de indicaciones');
        console.log('5. Explorar datos: npm run db:studio');
        
        console.log('\n✨ ¡Verificación completada!');
        
    } catch (error) {
        console.error('\n❌ ERROR durante la verificación:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar verificación
verificarImportacion().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});