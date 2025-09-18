// importacion-inteligente-final.js
// Script definitivo para importar datos reales del Excel al sistema de indicaciones

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 IMPORTACIÓN DE DATOS REALES - VERSIÓN FINAL');
console.log('================================================');

// Configuración principal
const CONFIG = {
    EXCEL_FILE: 'REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx',
    OUTPUT_FILE: 'datos_reales_import.sql',
    BACKUP_DB: true,
    MAX_PRACTICAS: 1000, // Aumentado para datos reales
    AREAS_FILTRO: [], // Vacío = todas las áreas
    DEBUG: false
};

// Utilidades mejoradas
const utils = {
    limpiarTexto(texto) {
        if (!texto || texto === '') return null;
        return texto.toString()
            .trim()
            .replace(/\r?\n/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/'/g, "''") // Escape para SQL
            .substring(0, 500); // Limitar longitud
    },

    extraerNumero(texto, patron) {
        if (!texto) return null;
        const match = texto.toString().match(patron);
        return match ? parseInt(match[1]) : null;
    },

    extraerAyuno(texto) {
        if (!texto) return null;
        const textoLower = texto.toString().toLowerCase();
        
        // Patrones de búsqueda para ayuno
        const patrones = [
            { regex: /(\d+)\s*h.*ayun/i, factor: 1 },
            { regex: /ayun.*(\d+)\s*h/i, factor: 1 },
            { regex: /(\d+)\s*hora.*ayun/i, factor: 1 },
            { regex: /ayun.*(\d+)\s*hora/i, factor: 1 }
        ];

        for (const patron of patrones) {
            const match = textoLower.match(patron.regex);
            if (match) {
                const horas = parseInt(match[1]);
                if (horas >= 3 && horas <= 24) return horas;
            }
        }
        
        // Valores comunes por defecto
        if (textoLower.includes('12') && textoLower.includes('ayun')) return 12;
        if (textoLower.includes('8') && textoLower.includes('ayun')) return 8;
        if (textoLower.includes('4') && textoLower.includes('ayun')) return 4;
        
        return null;
    },

    extraerOrina(texto) {
        if (!texto) return { tipo: null, horas: null };
        
        const textoUpper = texto.toString().toUpperCase();
        const textoLower = texto.toString().toLowerCase();
        
        // Orina de 24 horas
        if (textoUpper.includes('24') && (textoUpper.includes('HORA') || textoUpper.includes('H'))) {
            return { tipo: 'ORINA_24H', horas: 24 };
        }
        
        // Orina de 12 horas
        if (textoUpper.includes('12') && (textoUpper.includes('HORA') || textoUpper.includes('H'))) {
            return { tipo: 'ORINA_12H', horas: 12 };
        }
        
        // Orina de 2 horas
        if (textoUpper.includes('2') && (textoUpper.includes('HORA') || textoUpper.includes('H'))) {
            return { tipo: 'ORINA_2H', horas: 2 };
        }
        
        // Primera orina
        if (textoLower.includes('primera') && textoLower.includes('orin')) {
            return { tipo: 'PRIMERA_ORINA', horas: null };
        }
        
        // Orina simple
        if (textoLower.includes('orin') && !textoLower.includes('hora')) {
            return { tipo: 'ORINA_SIMPLE', horas: null };
        }
        
        return { tipo: null, horas: null };
    },

    generarHash(texto) {
        if (!texto) return 'HASH_VACIO';
        const textoLimpio = texto.toString()
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return crypto.createHash('md5')
            .update(textoLimpio)
            .digest('hex')
            .substring(0, 8)
            .toUpperCase();
    },

    determinarPrioridad(textoIndicacion, area = '') {
        if (!textoIndicacion) return 5;
        
        const texto = textoIndicacion.toLowerCase();
        
        // Máxima prioridad: ayuno, medicación
        if (texto.includes('ayun') || texto.includes('medicación') || texto.includes('medicament')) {
            return 1;
        }
        
        // Alta prioridad: preparación especial
        if (texto.includes('suspender') || texto.includes('interrump')) {
            return 1;
        }
        
        // Media-alta: recolección
        if (texto.includes('recolect') || texto.includes('primera orina') || texto.includes('24 hora')) {
            return 2;
        }
        
        // Media: preparación general
        if (texto.includes('preparación') || texto.includes('ante') || texto.includes('dia anterior')) {
            return 3;
        }
        
        // Por área
        if (area.includes('QUIM') || area.includes('ENDOCR')) return 2;
        if (area.includes('HEMAT') || area.includes('HEMOG')) return 4;
        
        return 4; // Prioridad normal por defecto
    }
};

class ProcesadorExcelFinal {
    constructor() {
        this.practicas = new Map();
        this.grupos = new Map();
        this.indicaciones = new Map();
        this.vinculos = {
            practicaGrupo: [],
            grupoIndicacion: []
        };
        this.estadisticas = {
            practicasLeidas: 0,
            practicasValidas: 0,
            gruposCreados: 0,
            indicacionesCreadas: 0,
            errores: []
        };
    }

    async procesar() {
        try {
            console.log('📖 Leyendo archivo Excel...');
            this.verificarArchivo();
            
            const workbook = this.leerExcel();
            await this.analizarEstructura(workbook);
            await this.procesarDatos(workbook);
            await this.optimizarDatos();
            await this.generarSQL();
            this.mostrarResultados();
            
        } catch (error) {
            console.error('❌ Error crítico:', error.message);
            if (CONFIG.DEBUG) console.error(error.stack);
            throw error;
        }
    }

    verificarArchivo() {
        if (!fs.existsSync(CONFIG.EXCEL_FILE)) {
            throw new Error(`Archivo Excel no encontrado: ${CONFIG.EXCEL_FILE}`);
        }
        console.log('✅ Archivo Excel localizado');
    }

    leerExcel() {
        try {
            const workbook = XLSX.readFile(CONFIG.EXCEL_FILE);
            console.log('✅ Archivo Excel leído correctamente');
            return workbook;
        } catch (error) {
            throw new Error(`Error leyendo Excel: ${error.message}`);
        }
    }

    async analizarEstructura(workbook) {
        console.log('🔍 Analizando estructura del Excel...');
        
        const sheetNames = workbook.SheetNames;
        console.log('   Hojas encontradas:', sheetNames.join(', '));
        
        // Usar la primera hoja disponible
        const mainSheet = workbook.Sheets[sheetNames[0]];
        const range = XLSX.utils.decode_range(mainSheet['!ref']);
        
        console.log(`   Rango de datos: ${range.s.r + 1} a ${range.e.r + 1} filas`);
        console.log(`   Columnas: A a ${String.fromCharCode(65 + range.e.c)}`);
        
        // Analizar headers
        const headers = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellRef = XLSX.utils.encode_cell({r: 0, c: col});
            const cell = mainSheet[cellRef];
            headers.push(cell ? cell.v : '');
        }
        
        console.log('   Headers detectados:');
        headers.forEach((header, idx) => {
            if (header) console.log(`     ${String.fromCharCode(65 + idx)}: ${header}`);
        });
        
        return { sheetNames, mainSheet, headers, range };
    }

    async procesarDatos(workbook) {
        console.log('🧪 Procesando datos del Excel...');
        
        const mainSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(mainSheet, { 
            defval: "", 
            header: 1,
            raw: false // Para obtener texto formateado
        });
        
        const headers = data[0];
        console.log('   Headers encontrados:', headers);
        
        // Detectar índices de columnas importantes
        const indices = this.detectarIndicesColumnas(headers);
        console.log('   Índices detectados:', indices);
        
        let filasProcesadas = 0;
        const totalFilas = Math.min(data.length, CONFIG.MAX_PRACTICAS + 1);
        
        console.log(`   Procesando ${totalFilas - 1} filas de datos...`);
        
        for (let i = 1; i < totalFilas; i++) {
            const fila = data[i];
            this.estadisticas.practicasLeidas++;
            
            try {
                if (await this.procesarFilaPractica(fila, indices, i)) {
                    filasProcesadas++;
                }
            } catch (error) {
                this.estadisticas.errores.push(`Fila ${i}: ${error.message}`);
                if (CONFIG.DEBUG) console.log(`   ⚠️  Error en fila ${i}: ${error.message}`);
            }
            
            // Progreso cada 100 filas
            if (filasProcesadas % 100 === 0) {
                console.log(`   📊 Procesadas ${filasProcesadas} prácticas válidas...`);
            }
        }
        
        console.log(`✅ Procesamiento completado: ${filasProcesadas} prácticas válidas de ${this.estadisticas.practicasLeidas} leídas`);
    }

    detectarIndicesColumnas(headers) {
        const indices = {};
        
        headers.forEach((header, idx) => {
            const headerUpper = header.toString().toUpperCase();
            
            // ID de práctica
            if (headerUpper.includes('ID') && (headerUpper.includes('PRACT') || headerUpper.includes('CODIGO'))) {
                indices.idPractica = idx;
            }
            
            // Descripción/Nombre
            if (headerUpper.includes('DESCRIP') || headerUpper.includes('NOMBRE') || headerUpper.includes('PRACTICA')) {
                indices.descripcion = idx;
            }
            
            // Área
            if (headerUpper.includes('AREA') || headerUpper.includes('SECTOR') || headerUpper.includes('SERVICIO')) {
                indices.area = idx;
            }
            
            // Indicaciones
            if (headerUpper.includes('INDICACION') || headerUpper.includes('INSTRUC') || headerUpper.includes('PREPARACION')) {
                indices.indicaciones = idx;
            }
            
            // Ayuno
            if (headerUpper.includes('AYUN')) {
                indices.ayuno = idx;
            }
            
            // Orina
            if (headerUpper.includes('ORIN')) {
                indices.orina = idx;
            }
        });
        
        return indices;
    }

    async procesarFilaPractica(fila, indices, numeroFila) {
        // Extraer datos básicos
        const idPractica = fila[indices.idPractica] || numeroFila;
        const descripcion = utils.limpiarTexto(fila[indices.descripcion]);
        const area = utils.limpiarTexto(fila[indices.area]) || 'GENERAL';
        
        // Validaciones básicas
        if (!descripcion || descripcion.length < 3) return false;
        if (CONFIG.AREAS_FILTRO.length > 0 && !CONFIG.AREAS_FILTRO.includes(area)) return false;
        
        // Crear práctica
        const practica = {
            id_practica: parseInt(idPractica) || this.estadisticas.practicasValidas + 1,
            nombre: descripcion.substring(0, 200),
            codigo: `${area.substring(0, 4).replace(/[^A-Z]/g, 'X')}_${idPractica}`.substring(0, 20),
            activo: true,
            area: area
        };
        
        this.practicas.set(practica.id_practica, practica);
        this.estadisticas.practicasValidas++;
        
        // Procesar preparación
        const textoAyuno = fila[indices.ayuno] || '';
        const textoOrina = fila[indices.orina] || '';
        const textoIndicaciones = fila[indices.indicaciones] || '';
        
        const ayunoHoras = utils.extraerAyuno(textoAyuno + ' ' + textoIndicaciones);
        const infoOrina = utils.extraerOrina(textoOrina + ' ' + textoIndicaciones);
        
        // Crear o encontrar grupo
        const grupoId = await this.crearOEncontrarGrupo(area, ayunoHoras, infoOrina);
        
        // Vincular práctica con grupo
        this.vinculos.practicaGrupo.push({
            id_practica: practica.id_practica,
            id_grupo: grupoId,
            activo: true
        });
        
        // Procesar indicaciones específicas si existen
        if (textoIndicaciones && textoIndicaciones.trim().length > 20) {
            await this.procesarIndicacionEspecifica(
                textoIndicaciones, 
                grupoId, 
                area, 
                descripcion
            );
        }
        
        return true;
    }

    async crearOEncontrarGrupo(area, ayunoHoras, infoOrina) {
        // Crear clave única para el grupo
        let grupoKey = `${area}`;
        if (ayunoHoras) grupoKey += `_AYUNO${ayunoHoras}H`;
        if (infoOrina.tipo) grupoKey += `_${infoOrina.tipo}`;
        if (!ayunoHoras && !infoOrina.tipo) grupoKey += '_SIN_PREP';
        
        // Si ya existe, devolver ID
        if (this.grupos.has(grupoKey)) {
            return this.grupos.get(grupoKey).id_grupo;
        }
        
        // Crear nuevo grupo
        const grupoId = this.estadisticas.gruposCreados + 1;
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
        this.estadisticas.gruposCreados++;
        
        // Crear indicaciones básicas para el grupo
        await this.crearIndicacionesBasicasGrupo(grupoId, area, ayunoHoras, infoOrina);
        
        return grupoId;
    }

    async crearIndicacionesBasicasGrupo(grupoId, area, ayunoHoras, infoOrina) {
        const indicacionesBasicas = [];
        
        // Indicación de ayuno
        if (ayunoHoras) {
            indicacionesBasicas.push({
                descripcion: `Ayuno de ${ayunoHoras} horas`,
                texto: `Debe mantener ayuno de ${ayunoHoras} horas antes del estudio. Solo puede tomar agua.`,
                tipo: 'AYUNO',
                prioridad: 1
            });
        }
        
        // Indicación de orina
        if (infoOrina.tipo) {
            let textoOrina = '';
            switch (infoOrina.tipo) {
                case 'ORINA_24H':
                    textoOrina = 'Recolectar orina de 24 horas en frasco estéril.';
                    break;
                case 'ORINA_12H':
                    textoOrina = 'Recolectar orina de 12 horas en frasco estéril.';
                    break;
                case 'PRIMERA_ORINA':
                    textoOrina = 'Recolectar la primera orina de la mañana en frasco estéril.';
                    break;
                default:
                    textoOrina = 'Recolectar muestra de orina en frasco estéril.';
            }
            
            indicacionesBasicas.push({
                descripcion: `Recolección de ${infoOrina.tipo.replace('_', ' ').toLowerCase()}`,
                texto: textoOrina,
                tipo: 'ORINA',
                prioridad: 2
            });
        }
        
        // Indicación general sin preparación
        if (!ayunoHoras && !infoOrina.tipo) {
            indicacionesBasicas.push({
                descripcion: 'Sin preparación especial',
                texto: 'No requiere preparación especial. Concurrir en horario asignado.',
                tipo: 'GENERAL',
                prioridad: 5
            });
        }
        
        // Crear las indicaciones
        for (const indicacionData of indicacionesBasicas) {
            const indicacionId = await this.crearIndicacion(indicacionData, area);
            
            // Vincular con grupo
            this.vinculos.grupoIndicacion.push({
                id_grupo: grupoId,
                id_indicacion: indicacionId,
                orden: indicacionData.prioridad,
                activo: true
            });
        }
    }

    async crearIndicacion(indicacionData, area) {
        const hash = utils.generarHash(indicacionData.texto);
        const indicacionKey = `IND_${hash}`;
        
        // Si ya existe, reutilizar
        if (this.indicaciones.has(indicacionKey)) {
            return this.indicaciones.get(indicacionKey).id_indicacion;
        }
        
        // Crear nueva indicación
        const indicacionId = this.estadisticas.indicacionesCreadas + 1;
        const indicacion = {
            id_indicacion: indicacionId,
            descripcion: indicacionData.descripcion,
            texto_instruccion: indicacionData.texto,
            tipo_indicacion: indicacionData.tipo || 'GENERAL',
            area: area,
            estado: 'ACTIVO',
            prioridad: indicacionData.prioridad || 3
        };
        
        this.indicaciones.set(indicacionKey, indicacion);
        this.estadisticas.indicacionesCreadas++;
        
        return indicacionId;
    }

    async procesarIndicacionEspecifica(textoIndicacion, grupoId, area, descripcionPractica) {
        const indicacionData = {
            descripcion: `Indicaciones para ${descripcionPractica.substring(0, 50)}...`,
            texto: textoIndicacion,
            tipo: 'ESPECIFICA',
            prioridad: utils.determinarPrioridad(textoIndicacion, area)
        };
        
        const indicacionId = await this.crearIndicacion(indicacionData, area);
        
        // Verificar si ya está vinculada
        const yaVinculada = this.vinculos.grupoIndicacion.some(
            v => v.id_grupo === grupoId && v.id_indicacion === indicacionId
        );
        
        if (!yaVinculada) {
            this.vinculos.grupoIndicacion.push({
                id_grupo: grupoId,
                id_indicacion: indicacionId,
                orden: indicacionData.prioridad,
                activo: true
            });
        }
    }

    generarDescripcionGrupo(area, ayunoHoras, infoOrina) {
        let descripcion = `Grupo ${area}`;
        
        const detalles = [];
        if (ayunoHoras) detalles.push(`Ayuno ${ayunoHoras}h`);
        if (infoOrina.tipo) {
            const tipoLegible = infoOrina.tipo.replace('_', ' ').toLowerCase();
            detalles.push(tipoLegible);
        }
        if (detalles.length === 0) detalles.push('Sin preparación');
        
        return `${descripcion} - ${detalles.join(', ')}`;
    }

    async optimizarDatos() {
        console.log('🔧 Optimizando datos...');
        
        // Eliminar grupos sin prácticas
        const gruposConPracticas = new Set(this.vinculos.practicaGrupo.map(v => v.id_grupo));
        const gruposAEliminar = [];
        
        this.grupos.forEach((grupo, key) => {
            if (!gruposConPracticas.has(grupo.id_grupo)) {
                gruposAEliminar.push(key);
            }
        });
        
        gruposAEliminar.forEach(key => this.grupos.delete(key));
        
        // Ordenar vínculos por prioridad
        this.vinculos.grupoIndicacion.sort((a, b) => a.orden - b.orden);
        
        console.log(`✅ Optimización completada - Eliminados ${gruposAEliminar.length} grupos huérfanos`);
    }

    async generarSQL() {
        console.log('📝 Generando archivo SQL...');
        
        let sql = this.generarCabeceraSQL();
        sql += this.generarLimpiezaSQL();
        sql += this.generarInsertPracticasSQL();
        sql += this.generarInsertGruposSQL();
        sql += this.generarInsertIndicacionesSQL();
        sql += this.generarInsertVinculosSQL();
        sql += this.generarReglasEjemploSQL();
        
        fs.writeFileSync(CONFIG.OUTPUT_FILE, sql);
        console.log(`✅ Archivo SQL generado: ${CONFIG.OUTPUT_FILE}`);
    }

    generarCabeceraSQL() {
        return `-- =====================================================
-- DATOS REALES DEL LABORATORIO
-- Importación automática desde Excel
-- =====================================================
-- Archivo: ${CONFIG.EXCEL_FILE}
-- Generado: ${new Date().toLocaleString()}
-- Prácticas: ${this.estadisticas.practicasValidas}
-- Grupos: ${this.estadisticas.gruposCreados}
-- Indicaciones: ${this.estadisticas.indicacionesCreadas}
-- =====================================================

`;
    }

    generarLimpiezaSQL() {
        return `-- Limpiar datos existentes
DELETE FROM GrupoIndicacion;
DELETE FROM PracticaGrupo;
DELETE FROM GruposAlternativos;
DELETE FROM Practica;
DELETE FROM Grupo;
DELETE FROM Indicacion;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name IN ('Practica', 'Grupo', 'Indicacion');

`;
    }

    generarInsertPracticasSQL() {
        let sql = '-- PRÁCTICAS DE LABORATORIO\n';
        this.practicas.forEach(practica => {
            sql += `INSERT INTO Practica (id_practica, nombre, codigo, activo, fecha_creacion) ` +
                   `VALUES (${practica.id_practica}, '${practica.nombre}', '${practica.codigo}', 1, datetime('now'));\n`;
        });
        return sql + '\n';
    }

    generarInsertGruposSQL() {
        let sql = '-- GRUPOS DE INDICACIONES\n';
        this.grupos.forEach(grupo => {
            const ayuno = grupo.ayuno_horas || 'NULL';
            const orinaHoras = grupo.orina_horas || 'NULL';
            const orinaTipo = grupo.orina_tipo ? `'${grupo.orina_tipo}'` : 'NULL';
            
            sql += `INSERT INTO Grupo (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_ultima_modificacion) ` +
                   `VALUES (${grupo.id_grupo}, '${grupo.nombre}', '${grupo.descripcion}', ${ayuno}, ${orinaHoras}, ${orinaTipo}, 1, datetime('now'), datetime('now'));\n`;
        });
        return sql + '\n';
    }

    generarInsertIndicacionesSQL() {
        let sql = '-- INDICACIONES INDIVIDUALES\n';
        this.indicaciones.forEach(indicacion => {
            sql += `INSERT INTO Indicacion (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, fecha_alta, fecha_ultima_modificacion) ` +
                   `VALUES (${indicacion.id_indicacion}, '${indicacion.descripcion}', '${indicacion.texto_instruccion}', '${indicacion.tipo_indicacion}', '${indicacion.area}', 'ACTIVO', datetime('now'), datetime('now'));\n`;
        });
        return sql + '\n';
    }

    generarInsertVinculosSQL() {
        let sql = '-- VÍNCULOS PRÁCTICA-GRUPO\n';
        this.vinculos.practicaGrupo.forEach(vinculo => {
            sql += `INSERT INTO PracticaGrupo (id_practica, id_grupo, activo, fecha_vinculacion) ` +
                   `VALUES (${vinculo.id_practica}, ${vinculo.id_grupo}, 1, datetime('now'));\n`;
        });
        
        sql += '\n-- VÍNCULOS GRUPO-INDICACIÓN\n';
        this.vinculos.grupoIndicacion.forEach(vinculo => {
            sql += `INSERT INTO GrupoIndicacion (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) ` +
                   `VALUES (${vinculo.id_grupo}, ${vinculo.id_indicacion}, ${vinculo.orden}, 1, datetime('now'));\n`;
        });
        
        return sql + '\n';
    }

    generarReglasEjemploSQL() {
        return `-- REGLAS ALTERNATIVAS DE EJEMPLO
INSERT INTO GruposAlternativos (id_grupo_alternativo, id_grupo_condicion_1, id_grupo_condicion_2, id_grupo_resultante, descripcion_caso, activo, fecha_creacion) 
VALUES (1, 1, 2, 1, 'Combinar ayunos: prevalece el más restrictivo', 1, datetime('now'));

INSERT INTO GruposAlternativos (id_grupo_alternativo, id_grupo_condicion_1, id_grupo_condicion_2, id_grupo_resultante, descripcion_caso, activo, fecha_creacion) 
VALUES (2, 3, 4, 5, 'Combinación especial de orina 24h con ayuno', 1, datetime('now'));

`;
    }

    mostrarResultados() {
        console.log('\n🎉 ¡IMPORTACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('==========================================');
        
        console.log(`📊 Estadísticas finales:`);
        console.log(`   • Filas leídas del Excel: ${this.estadisticas.practicasLeidas}`);
        console.log(`   • Prácticas válidas: ${this.estadisticas.practicasValidas}`);
        console.log(`   • Grupos creados: ${this.estadisticas.gruposCreados}`);
        console.log(`   • Indicaciones generadas: ${this.estadisticas.indicacionesCreadas}`);
        console.log(`   • Vínculos práctica-grupo: ${this.vinculos.practicaGrupo.length}`);
        console.log(`   • Vínculos grupo-indicación: ${this.vinculos.grupoIndicacion.length}`);
        
        if (this.estadisticas.errores.length > 0) {
            console.log(`   • Errores encontrados: ${this.estadisticas.errores.length}`);
            if (CONFIG.DEBUG) {
                console.log('\n⚠️  Errores detallados:');
                this.estadisticas.errores.slice(0, 10).forEach(error => {
                    console.log(`     ${error}`);
                });
            }
        }
        
        // Estadísticas por área
        const areaStats = new Map();
        this.practicas.forEach(practica => {
            const area = practica.area;
            areaStats.set(area, (areaStats.get(area) || 0) + 1);
        });
        
        console.log('\n🏥 Distribución por áreas:');
        Array.from(areaStats.entries())
            .sort((a, b) => b[1] - a[1])
            .forEach