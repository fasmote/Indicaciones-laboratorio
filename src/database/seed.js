import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Iniciando seed de la base de datos...');

    try {
        // Limpiar datos existentes
        await prisma.gruposAlternativos.deleteMany();
        await prisma.grupoIndicacion.deleteMany();
        await prisma.practicaGrupo.deleteMany();
        await prisma.indicacion.deleteMany();
        await prisma.grupo.deleteMany();
        await prisma.practica.deleteMany();

        console.log('🧹 Datos existentes eliminados');

        // Crear Prácticas
        const practicas = await Promise.all([
            prisma.practica.create({
                data: {
                    nombre: 'Glucemia en Ayunas',
                    codigo: 'GLUC001'
                }
            }),
            prisma.practica.create({
                data: {
                    nombre: 'Hemograma Completo',
                    codigo: 'HEMO001'
                }
            }),
            prisma.practica.create({
                data: {
                    nombre: 'Orina Completa',
                    codigo: 'ORIN001'
                }
            }),
            prisma.practica.create({
                data: {
                    nombre: 'Perfil Lipídico',
                    codigo: 'LIPI001'
                }
            }),
            prisma.practica.create({
                data: {
                    nombre: 'Urea y Creatinina',
                    codigo: 'UREA001'
                }
            }),
            prisma.practica.create({
                data: {
                    nombre: 'Ácido Úrico',
                    codigo: 'ACUR001'
                }
            })
        ]);

        console.log('✅ Prácticas creadas:', practicas.length);

        // Crear Indicaciones
        const indicaciones = await Promise.all([
            prisma.indicacion.create({
                data: {
                    descripcion: 'Ayuno de 8 horas',
                    textoInstruccion: 'El paciente debe mantener ayuno de 8 horas antes del estudio. Puede tomar agua.',
                    tipoIndicacion: 'AYUNO',
                    area: 'Química'
                }
            }),
            prisma.indicacion.create({
                data: {
                    descripcion: 'Ayuno de 12 horas',
                    textoInstruccion: 'El paciente debe mantener ayuno de 12 horas antes del estudio. Puede tomar agua.',
                    tipoIndicacion: 'AYUNO',
                    area: 'Química'
                }
            }),
            prisma.indicacion.create({
                data: {
                    descripcion: 'Primera orina de la mañana',
                    textoInstruccion: 'Recolectar la primera orina de la mañana en frasco estéril proporcionado por el laboratorio.',
                    tipoIndicacion: 'RECOLECCION',
                    area: 'Microbiología'
                }
            }),
            prisma.indicacion.create({
                data: {
                    descripcion: 'Sin preparación especial',
                    textoInstruccion: 'Esta práctica no requiere preparación especial. Puede realizarse en cualquier momento del día.',
                    tipoIndicacion: 'GENERAL',
                    area: 'General'
                }
            }),
            prisma.indicacion.create({
                data: {
                    descripcion: 'Recolección de orina de 24 horas',
                    textoInstruccion: 'Comenzar la recolección descartando la primera orina de la mañana. Recolectar toda la orina durante 24 horas, incluyendo la primera orina de la mañana siguiente.',
                    tipoIndicacion: 'RECOLECCION',
                    area: 'Microbiología'
                }
            })
        ]);

        console.log('✅ Indicaciones creadas:', indicaciones.length);

        // Crear Grupos
        const grupos = await Promise.all([
            prisma.grupo.create({
                data: {
                    nombre: 'Ayuno 8 horas',
                    descripcion: 'Grupo para prácticas que requieren ayuno de 8 horas',
                    ayunoHoras: 8
                }
            }),
            prisma.grupo.create({
                data: {
                    nombre: 'Ayuno 12 horas',
                    descripcion: 'Grupo para prácticas que requieren ayuno de 12 horas',
                    ayunoHoras: 12
                }
            }),
            prisma.grupo.create({
                data: {
                    nombre: 'Sin preparación',
                    descripcion: 'Grupo para prácticas que no requieren preparación especial'
                }
            }),
            prisma.grupo.create({
                data: {
                    nombre: 'Primera orina',
                    descripcion: 'Grupo para prácticas que requieren primera orina de la mañana',
                    orinaTipo: 'primera_manana'
                }
            }),
            prisma.grupo.create({
                data: {
                    nombre: 'Orina 24 horas',
                    descripcion: 'Grupo para prácticas que requieren recolección de orina de 24 horas',
                    orinaHoras: 24,
                    orinaTipo: '24_horas'
                }
            })
        ]);

        console.log('✅ Grupos creados:', grupos.length);

        // Vincular Indicaciones a Grupos
        await Promise.all([
            // Grupo "Ayuno 8 horas" -> Indicación "Ayuno de 8 horas"
            prisma.grupoIndicacion.create({
                data: {
                    idGrupo: grupos[0].id,
                    idIndicacion: indicaciones[0].id,
                    orden: 1
                }
            }),
            // Grupo "Ayuno 12 horas" -> Indicación "Ayuno de 12 horas"
            prisma.grupoIndicacion.create({
                data: {
                    idGrupo: grupos[1].id,
                    idIndicacion: indicaciones[1].id,
                    orden: 1
                }
            }),
            // Grupo "Sin preparación" -> Indicación "Sin preparación especial"
            prisma.grupoIndicacion.create({
                data: {
                    idGrupo: grupos[2].id,
                    idIndicacion: indicaciones[3].id,
                    orden: 1
                }
            }),
            // Grupo "Primera orina" -> Indicación "Primera orina de la mañana"
            prisma.grupoIndicacion.create({
                data: {
                    idGrupo: grupos[3].id,
                    idIndicacion: indicaciones[2].id,
                    orden: 1
                }
            }),
            // Grupo "Orina 24 horas" -> Indicación "Recolección de orina de 24 horas"
            prisma.grupoIndicacion.create({
                data: {
                    idGrupo: grupos[4].id,
                    idIndicacion: indicaciones[4].id,
                    orden: 1
                }
            })
        ]);

        console.log('✅ Indicaciones vinculadas a grupos');

        // Vincular Prácticas a Grupos
        await Promise.all([
            // Glucemia -> Ayuno 8 horas
            prisma.practicaGrupo.create({
                data: {
                    idPractica: practicas[0].id, // Glucemia
                    idGrupo: grupos[0].id        // Ayuno 8 horas
                }
            }),
            // Perfil Lipídico -> Ayuno 12 horas
            prisma.practicaGrupo.create({
                data: {
                    idPractica: practicas[3].id, // Perfil Lipídico
                    idGrupo: grupos[1].id        // Ayuno 12 horas
                }
            }),
            // Hemograma -> Sin preparación
            prisma.practicaGrupo.create({
                data: {
                    idPractica: practicas[1].id, // Hemograma
                    idGrupo: grupos[2].id        // Sin preparación
                }
            }),
            // Urea y Creatinina -> Sin preparación
            prisma.practicaGrupo.create({
                data: {
                    idPractica: practicas[4].id, // Urea y Creatinina
                    idGrupo: grupos[2].id        // Sin preparación
                }
            }),
            // Ácido Úrico -> Sin preparación
            prisma.practicaGrupo.create({
                data: {
                    idPractica: practicas[5].id, // Ácido Úrico
                    idGrupo: grupos[2].id        // Sin preparación
                }
            }),
            // Orina Completa -> Primera orina
            prisma.practicaGrupo.create({
                data: {
                    idPractica: practicas[2].id, // Orina Completa
                    idGrupo: grupos[3].id        // Primera orina
                }
            })
        ]);

        console.log('✅ Prácticas vinculadas a grupos');

        // Crear un Grupo Alternativo de ejemplo
        // Si se piden Glucemia + Perfil Lipídico juntas, usar grupo "Ayuno 12 horas"
        await prisma.gruposAlternativos.create({
            data: {
                idGrupoCondicion1: grupos[0].id, // Ayuno 8 horas
                idGrupoCondicion2: grupos[1].id, // Ayuno 12 horas  
                idGrupoResultante: grupos[1].id, // Usar Ayuno 12 horas
                descripcionCaso: 'Cuando se requieren tanto glucemia como perfil lipídico, se aplica el ayuno mayor (12 horas)'
            }
        });

        console.log('✅ Grupos alternativos creados');

        console.log('\n🎉 Seed completado exitosamente!');
        console.log('📊 Resumen de datos creados:');
        console.log(`   - ${practicas.length} prácticas`);
        console.log(`   - ${indicaciones.length} indicaciones`);
        console.log(`   - ${grupos.length} grupos`);
        console.log('   - Vinculaciones y reglas alternativas configuradas');

    } catch (error) {
        console.error('❌ Error en el seed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar seed si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seed()
        .catch((error) => {
            console.error('❌ Error ejecutando seed:', error);
            process.exit(1);
        });
}

export default seed;
