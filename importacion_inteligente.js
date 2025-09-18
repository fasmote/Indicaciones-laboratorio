// importacion-inteligente.js
// Script mejorado para importación inteligente de datos del Excel

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 IMPORTACIÓN INTELIGENTE DE DATOS DEL EXCEL');
console.log('============================================');

// Configuración
const CONFIG = {
    EXCEL_FILE: 'REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx',
    OUTPUT_FILE: 'datos_reales_import.sql',
    MAX_PRACTICAS: 500, // Limitar para pruebas iniciales
    AREAS_PRINCIPALES: ['QUIMICA', 'HEMATO/HEMOSTASIA', 'ENDOCRINO', 'BACTERIO', 'VIROLOGIA']
};

// Utilidades
const utils = {
    // Limpiar y normalizar texto
    limpiarTexto(texto) {
        if (!texto || texto === '') return null;
        return texto.toString()
            .trim()
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/'/g, "''");
    },
    
    // Generar hash único para agrupar indicaciones similares
    generarHash(texto) {
        if (!texto) return null;
        const textoLimpio = texto.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return crypto.createHash('md5').update(textoLimpio).digest('hex').substring(0, 8);
    },
    
    // Extraer horas de ayuno
    extraerAyuno(texto) {
        if (!texto) return null;
        const textoLower = texto.toLowerCase();
        
        // Buscar patrones de ayuno
        const patrones = [
            { regex: /12\s*h/, horas: 12 },
            { regex: /8\s*h/, horas: 8 },
            { regex: /4\s*h/, horas: 4 },
            { regex: /3\s*h/, horas: 3 }
        ];
        
        for (const patron of patrones) {
            if (patron.regex.test(textoLower)) {
                return patron.horas;
            }
        }
        
        return null;
    },
    
    // Extraer información de orina
    extraerOrina(texto) {
        if (!texto) return { tipo: null, horas: null };
        
        const textoUpper = texto.toUpperCase();
        
        if (textoUpper.includes('24 HORAS') || textoUpper.includes('24H')) {
            return { tipo: 'ORINA_24H', horas: 24 };
        }
        if (textoUpper.includes('12 HORAS') || textoUpper.includes('12H')) {
            return { tipo: 'ORINA_12H', horas: 12 };
        }
        if (textoUpper.includes('2 HORAS') || textoUpper.includes('2H')) {
            return { tipo: 'ORINA_2H', horas: 2 };
        }
        if (textoUpper.includes('PRIMERA ORINA') || textoUpper.includes('PRIMERA MICCIÓN')) {
            return { tipo: 'PRIMERA_ORINA', horas: null };
        }
        
        return { tipo: null, horas: null };
    },
    
    // Determinar prioridad de indicación
    determinarPrioridad(textoIndicacion) {
        if (!textoIndicacion) return 5;
        
        const texto = textoIndicacion.toLowerCase();
        
        // Alta prioridad: ayuno, medicación
        if (texto.includes('ayuno') || texto.includes('medicación') || texto.includes('suspender')) {
            return 1;
        }
        
        // Media-alta: recolección especial
        if (texto.includes('recolectar') || texto.includes('primera orina') || texto.includes('24 horas')) {
            return 2;
        }
        
        // Media: preparación general
        if (texto.includes('preparación') || texto.includes('antes del estudio')) {
            return 3;
        }
        
        // Baja: información general
        return 4;
    }
};

// Clases principales
class ProcesadorExcel {
    constructor() {
        this.practicas = new Map();
        this.grupos = new Map();
        this.indicaciones = new Map();
        this.vinculos = {
            practicaGrupo: [],
            grupoIndicacion: []
        };
        this.contadores = {
            practicasValidas: 0,
            gruposCreados: 0,
            indicacionesCreadas: 0
        };
    }
    
    async procesar() {
        try {
            console.log('📖 Leyendo archivo Excel...');
            const workbook = XLSX.readFile(CONFIG.EXCEL_FILE);
            
            await this.procesarPracticas(workbook);
            await this.procesarIndicacionesEspecializadas(workbook);
            await this.optimizarGrupos();
            await this.generarSQL();
            
            this.mostrarEstadisticas();
            
        } catch (error) {
            console.error('❌ Error durante el procesamiento:', error.message);
            throw error;
        }
    }
    
    async procesarPracticas(workbook) {
        console.log('🧪 Procesando prácticas de laboratorio...');
        
        const sheet = workbook.Sheets['PRACTICAS'];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 });
        
        const headers = data[0];
        const indices = {
            idPractica: headers.indexOf("ID_PRACTICA"),
            descripcion: headers.indexOf("DESCRIPCION CONSENSUADA"),
            area: headers.indexOf("AREA"),
            orina: headers.indexOf("ORINA"),
            ayuno: headers.indexOf("AYUNO"),
            indicaciones: headers.indexOf("INDICACIONES PARA EL PACIENTE")
        };
        
        let procesadas = 0;
        
        for (let i = 1; i < Math.min(data.length, CONFIG.MAX_PRACTICAS + 1); i++) {
            const row = data[i];
            
            const idPractica = row[indices.idPractica];
            const descripcion = utils.limpiarTexto(row[indices.descripcion]);
            const area = utils.limpiarTexto(row[indices.area]);
            const textoOrina = row[indices.orina];
            const textoAyuno = row[indices.ayuno];
            const textoIndicaciones = row[indices.indicaciones];
            
            // Validaciones básicas
            if (!idPractica || !descripcion || !area) continue;
            if (CONFIG.AREAS_PRINCIPALES.length > 0 && !CONFIG.AREAS_PRINCIPALES.includes(area)) continue;
            
            // Crear práctica
            const practica = {
                id_practica: idPractica,
                nombre: descripcion.substring(0, 200),
                codigo: `${area.substring(0, 4).toUpperCase()}_${idPractica}`,
                activo: true,
                area: area
            };
            
            this.practicas.set(idPractica, practica);
            this.contadores.practicasValidas++;
            
            // Procesar requerimientos de preparación
            const ayunoHoras = utils.extraerAyuno(textoAyuno);
            const infoOrina = utils.extraerOrina(textoOrina);
            
            // Crear o encontrar grupo apropiado
            const grupoId = this.crearOEncontrarGrupo(area, ayunoHoras, infoOrina);
            
            // Vincular práctica con grupo
            this.vinculos.practicaGrupo.push({
                id_practica: idPractica,
                id_grupo: grupoId,
                activo: true
            });
            
            // Procesar indicaciones específicas
            if (textoIndicaciones && textoIndicaciones.trim()) {
                this.procesarIndicacionIndividual(
                    textoIndicaciones, 
                    grupoId, 
                    area, 
                    `Indicaciones para ${descripcion.substring(0, 50)}...`
                );
            }
            
            procesadas++;
            
            if (procesadas % 50 === 0) {
                console.log(`   Procesadas ${procesadas} prácticas...`);
            }
        }
        
        console.log(`✅ ${procesadas} prácticas procesadas exitosamente`);
    }
    
    crearOEncontrarGrupo(area, ayunoHoras, infoOrina) {
        // Crear clave única para el grupo
        let grupoKey = area;
        if (ayunoHoras) grupoKey += `_AYUNO${ayunoHoras}H`;
        if (infoOrina.tipo) grupoKey += `_${infoOrina.tipo}`;
        if (!ayunoHoras && !infoOrina.tipo) grupoKey += '_SIN_PREPARACION';
        
        // Si el grupo ya existe, retornar su ID
        if (this.grupos.has(grupoKey)) {
            return this.grupos.get(grupoKey).id_grupo;
        }
        
        // Crear nuevo grupo
        const grupoId = this.contadores.gruposCreados + 1;
        const grupo = {
            id_grupo: grupoId,
            nombre: grupoKey,
            descripcion: this.generarDescripcionGrupo(area, ayunoHoras, infoOrina),
            ayuno_horas: ayunoHoras,
            orina_horas: infoOrina.horas,
            orina_tipo: infoOrina.tipo,
            activo: true,
            area: area
        };
        
        this.grupos.set(grupoKey, grupo);
        this.contadores.gruposCreados++;
        
        return grupoId;
    }
    
    generarDescripcionGrupo(area, ayunoHoras, infoOrina) {
        let descripcion = `Grupo ${area}`;
        
        if (ayunoHoras) {
            descripcion += ` - Ayuno ${ayunoHoras} horas`;
        }
        
        if (infoOrina.tipo) {
            const tipoLegible = infoOrina.tipo.replace('_', ' ').toLowerCase();
            descripcion += ` - ${tipoLegible}`;
            if (infoOrina.horas) {
                descripcion += ` (${infoOrina.horas}h)`;
            }
        }
        
        if (!ayunoHoras && !infoOrina.tipo) {
            descripcion += ' - Sin preparación especial';
        }
        
        return descripcion;
    }
    
    procesarIndicacionIndividual(textoIndicacion, grupoId, area, descripcionCorta) {
        // Generar hash para evitar duplicados
        const hash = utils.generarHash(textoIndicacion);
        const indicacionKey = `IND_${hash}`;
        
        let indicacionId;
        
        // Si la indicación ya existe, reutilizarla
        if (this.indicaciones.has(indicacionKey)) {
            indicacionId = this.indicaciones.get(indicacionKey).id_indicacion;
        } else {
            // Crear nueva indicación
            indicacionId = this.contadores.indicacionesCreadas + 1;
            
            const indicacion = {
                id_indicacion: indicacionId,
                descripcion: descripcionCorta.substring(0, 100),
                texto_instruccion: textoIndicacion.substring(0, 1000),
                tipo_indicacion: 'PREPARACION',
                area: area,
                estado: 'ACTIVO',
                prioridad: utils.determinarPrioridad(textoIndicacion)
            };
            
            this.indicaciones.set(indicacionKey, indicacion);
            this.contadores.indicacionesCreadas++;
        }
        
        // Vincular indicación con grupo (evitar duplicados)
        const vinculoExiste = this.vinculos.grupoIndicacion.some(
            v => v.id_grupo === grupoId && v.id_indicacion === indicacionId
        );
        
        if (!vinculoExiste) {
            this.vinculos.grupoIndicacion.push({
                id_grupo: grupoId,
                id_indicacion: indicacionId,
                orden: this.indicaciones.get(indicacionKey).prioridad,
                activo: true
            });
        }
    }
    
    async procesarIndicacionesEspecializadas(workbook) {
        console.log('🔬 Procesando indicaciones especializadas...');
        
        const sheet = workbook.Sheets['IndicacionesIndividuales'];
        if (!sheet) {
            console.log('   ⚠️  Hoja IndicacionesIndividuales no encontrada, saltando...');
            return;
        }
        
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 });
        let procesadas = 0;
        
        for (let i = 1; i < Math.min(data.length, 50); i++) { // Limitar a 50
            const row = data[i];
            const descripcion = utils.limpiarTexto(row[1]);
            
            if (descripcion && descripcion.length > 20) {
                const indicacionId = this.contadores.indicacionesCreadas + 1;
                const indicacionKey = `ESP_${indicacionId}`;
                
                const indicacion = {
                    id_indicacion: indicacionId,
                    descripcion: descripcion.substring(0, 100),
                    texto_instruccion: descripcion,
                    tipo_indicacion: 'ESPECIALIZADA',
                    area: 'GENERAL',
                    estado: 'ACTIVO',
                    prioridad: 3
                };
                
                this.indicaciones.set(indicacionKey, indicacion);
                this.contadores.indicacionesCreadas++;
                procesadas++;
            }
        }
        
        console.log(`✅ ${procesadas} indicaciones especializadas procesadas`);
    }
    
    async optimizarGrupos() {
        console.log('🔧 Optimizando grupos y relaciones...');
        
        // Eliminar grupos sin prácticas asociadas
        const gruposConPracticas = new Set(this.vinculos.practicaGrupo.map(v => v.id_grupo));
        const gruposAEliminar = [];
        
        this.grupos.forEach((grupo, key) => {
            if (!gruposConPracticas.has(grupo.id_grupo)) {
                gruposAEliminar.push(key);
            }
        });
        
        gruposAEliminar.forEach(key => {
            this.grupos.delete(key);
            console.log(`   Eliminado grupo sin prácticas: ${key}`);
        });
        
        // Ordenar vínculos grupo-indicación por prioridad
        this.vinculos.grupoIndicacion.sort((a, b) => {
            const indicacionA = Array.from(this.indicaciones.values())
                .find(ind => ind.id_indicacion === a.id_indicacion);
            const indicacionB = Array.from(this.indicaciones.values())
                .find(ind => ind.id_indicacion === b.id_indicacion);
            
            return (indicacionA?.prioridad || 5) - (indicacionB?.prioridad || 5);
        });
        
        console.log('✅ Optimización completada');
    }
    
    async generarSQL() {
        console.log('📝 Generando archivo SQL...');
        
        let sql = '';
        sql += '-- Datos reales importados del Excel\n';
        sql += `-- Generado el ${new Date().toLocaleString()}\n`;
        sql += '-- Total de prácticas: ' + this.contadores.practicasValidas + '\n';
        sql += '-- Total de grupos: ' + this.contadores.gruposCreados + '\n';
        sql += '-- Total de indicaciones: ' + this.contadores.indicacionesCreadas + '\n\n';
        
        // Limpiar tablas
        sql += '-- Limpiar datos existentes\n';
        sql += 'DELETE FROM PracticaGrupo;\n';
        sql += 'DELETE FROM GrupoIndicacion;\n';
        sql += 'DELETE FROM GruposAlternativos;\n';
        sql += 'DELETE FROM Practica;\n';
        sql += 'DELETE FROM Grupo;\n';
        sql += 'DELETE FROM Indicacion;\n\n';
        
        // Insertar prácticas
        sql += '-- PRÁCTICAS\n';
        this.practicas.forEach(practica => {
            sql += `INSERT INTO Practica (id_practica, nombre, codigo, activo, fecha_creacion) VALUES (${practica.id_practica}, '${practica.nombre}', '${practica.codigo}', 1, datetime('now'));\n`;
        });
        
        sql += '\n-- GRUPOS\n';
        this.grupos.forEach(grupo => {
            sql += `INSERT INTO Grupo (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_ultima_modificacion) VALUES (${grupo.id_grupo}, '${grupo.nombre}', '${grupo.descripcion}', ${grupo.ayuno_horas || 'NULL'}, ${grupo.orina_horas || 'NULL'}, ${grupo.orina_tipo ? `'${grupo.orina_tipo}'` : 'NULL'}, 1, datetime('now'), datetime('now'));\n`;
        });
        
        sql += '\n-- INDICACIONES\n';
        this.indicaciones.forEach(indicacion => {
            sql += `INSERT INTO Indicacion (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, fecha_alta, fecha_ultima_modificacion) VALUES (${indicacion.id_indicacion}, '${indicacion.descripcion}', '${indicacion.texto_instruccion}', '${indicacion.tipo_indicacion}', '${indicacion.area}', 'ACTIVO', datetime('now'), datetime('now'));\n`;
        });
        
        sql += '\n-- VÍNCULOS PRÁCTICA-GRUPO\n';
        this.vinculos.practicaGrupo.forEach(vinculo => {
            sql += `INSERT INTO PracticaGrupo (id_practica, id_grupo, activo, fecha_vinculacion) VALUES (${vinculo.id_practica}, ${vinculo.id_grupo}, 1, datetime('now'));\n`;
        });
        
        sql += '\n-- VÍNCULOS GRUPO-INDICACIÓN\n';
        this.vinculos.grupoIndicacion.forEach(vinculo => {
            sql += `INSERT INTO GrupoIndicacion (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) VALUES (${vinculo.id_grupo}, ${vinculo.id_indicacion}, ${vinculo.orden}, 1, datetime('now'));\n`;
        });
        
        // Reglas alternativas de ejemplo
        sql += '\n-- REGLAS ALTERNATIVAS DE EJEMPLO\n';
        sql += `INSERT INTO GruposAlternativos (id_grupo_alternativo, id_grupo_condicion_1, id_grupo_condicion_2, id_grupo_resultante, descripcion_caso, activo, fecha_creacion) VALUES (1, 1, 2, 1, 'Combinar ayunos: se toma el más restrictivo', 1, datetime('now'));\n`;
        
        fs.writeFileSync(CONFIG.OUTPUT_FILE, sql);
        console.log(`✅ Archivo SQL generado: ${CONFIG.OUTPUT_FILE}`);
    }
    
    mostrarEstadisticas() {
        console.log('\n🎉 IMPORTACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('=====================================');
        console.log(`📊 Estadísticas de importación:`);
        console.log(`   • Prácticas válidas: ${this.contadores.practicasValidas}`);
        console.log(`   • Grupos creados: ${this.contadores.gruposCreados}`);
        console.log(`   • Indicaciones únicas: ${this.contadores.indicacionesCreadas}`);
        console.log(`   • Vínculos práctica-grupo: ${this.vinculos.practicaGrupo.length}`);
        console.log(`   • Vínculos grupo-indicación: ${this.vinculos.grupoIndicacion.length}`);
        
        // Estadísticas por área
        const estadisticasPorArea = new Map();
        this.practicas.forEach(practica => {
            const area = practica.area;
            if (!estadisticasPorArea.has(area)) {
                estadisticasPorArea.set(area, 0);
            }
            estadisticasPorArea.set(area, estadisticasPorArea.get(area) + 1);
        });
        
        console.log('\n🏥 Distribución por áreas:');
        estadisticasPorArea.forEach((cantidad, area) => {
            console.log(`   • ${area}: ${cantidad} prácticas`);
        });
        
        console.log('\n🚀 Próximos pasos:');
        console.log('   1. Ejecutar: sqlite3 prisma/indicaciones.db < datos_reales_import.sql');
        console.log('   2. Verificar: npm run db:studio');
        console.log('   3. Iniciar servidor: npm run dev');
        console.log('   4. Probar en: http://localhost:3000');
    }
}

// Ejecutar el procesamiento
async function main() {
    try {
        const procesador = new ProcesadorExcel();
        await procesador.procesar();
    } catch (error) {
        console.error('\n❌ Error fatal:', error.message);
        process.exit(1);
    }
}

// Verificar que el archivo Excel existe antes de ejecutar
if (!fs.existsSync(CONFIG.EXCEL_FILE)) {
    console.error('❌ ERROR: Archivo Excel no encontrado:', CONFIG.EXCEL_FILE);
    console.error('   Asegúrate de que el archivo esté en la misma carpeta que este script.');
    process.exit(1);
}

main();
