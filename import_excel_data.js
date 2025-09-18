// script-importacion-excel.js
// Script para cargar datos reales del Excel al sistema de indicaciones

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuración de archivos
const EXCEL_FILE_PATH = 'REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx';
const OUTPUT_SQL_FILE = 'datos_reales_import.sql';

console.log('🔄 Iniciando importación de datos reales del Excel...');
console.log('====================================================');

// Función para limpiar texto
function limpiarTexto(texto) {
    if (!texto || texto === '') return null;
    return texto.toString().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
}

// Función para extraer horas de ayuno del texto
function extraerAyuno(textoAyuno) {
    if (!textoAyuno || textoAyuno === '') return null;
    
    const texto = textoAyuno.toLowerCase();
    if (texto.includes('8 hs') || texto.includes('8 horas')) return 8;
    if (texto.includes('4 hs') || texto.includes('4 horas')) return 4;
    if (texto.includes('3 hs') || texto.includes('3 horas')) return 3;
    if (texto.includes('12 hs') || texto.includes('12 horas')) return 12;
    
    return null;
}

// Función para extraer tipo de orina
function extraerTipoOrina(textoOrina) {
    if (!textoOrina || textoOrina === '') return null;
    
    const texto = textoOrina.toUpperCase();
    if (texto.includes('24 HORAS')) return 'ORINA_24H';
    if (texto.includes('12 HORAS')) return 'ORINA_12H';
    if (texto.includes('2 HORAS')) return 'ORINA_2H';
    if (texto.includes('PRIMERA ORINA')) return 'PRIMERA_ORINA';
    
    return 'ORINA_SIMPLE';
}

try {
    // Leer el archivo Excel
    console.log('📖 Leyendo archivo Excel...');
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    
    // Arrays para almacenar los datos procesados
    const practicas = [];
    const grupos = new Map();
    const indicaciones = new Map();
    const practicaGrupo = [];
    const grupoIndicacion = [];
    
    console.log('📊 Procesando hoja PRACTICAS...');
    
    // Procesar la hoja PRACTICAS
    const practicasSheet = workbook.Sheets['PRACTICAS'];
    const practicasData = XLSX.utils.sheet_to_json(practicasSheet, { defval: "", header: 1 });
    
    // Contadores para estadísticas
    let practicasValidas = 0;
    let gruposCreados = 0;
    let indicacionesCreadas = 0;
    
    for (let i = 1; i < practicasData.length; i++) {
        const row = practicasData[i];
        const idPractica = row[1]; // ID_PRACTICA
        const descripcion = limpiarTexto(row[2]); // DESCRIPCION CONSENSUADA
        const area = limpiarTexto(row[4]); // AREA
        const textoOrina = row[5]; // ORINA
        const textoAyuno = row[6]; // AYUNO
        const textoIndicaciones = row[7]; // INDICACIONES PARA EL PACIENTE
        
        // Validar datos mínimos
        if (!idPractica || !descripcion || !area) {
            continue;
        }
        
        // Crear registro de práctica
        const practica = {
            id_practica: idPractica,
            nombre: descripcion,
            codigo: `${area}_${idPractica}`,
            activo: true,
            area: area
        };
        
        practicas.push(practica);
        practicasValidas++;
        
        // Determinar características de preparación
        const ayunoHoras = extraerAyuno(textoAyuno);
        const tipoOrina = extraerTipoOrina(textoOrina);
        const orinaHoras = tipoOrina && tipoOrina.includes('_') ? 
            parseInt(tipoOrina.split('_')[1]?.replace('H', '')) || null : null;
        
        // Crear grupo basado en características de preparación
        let grupoKey = `${area}_`;
        if (ayunoHoras) grupoKey += `AYUNO${ayunoHoras}_`;
        if (tipoOrina) grupoKey += `${tipoOrina}_`;
        if (!ayunoHoras && !tipoOrina) grupoKey += 'SIN_PREPARACION';
        
        // Crear grupo si no existe
        if (!grupos.has(grupoKey)) {
            const grupo = {
                id_grupo: gruposCreados + 1,
                nombre: grupoKey,
                descripcion: `Grupo ${area}${ayunoHoras ? ` - Ayuno ${ayunoHoras}h` : ''}${tipoOrina ? ` - ${tipoOrina.replace('_', ' ')}` : ''}`,
                ayuno_horas: ayunoHoras,
                orina_horas: orinaHoras,
                orina_tipo: tipoOrina,
                activo: true,
                area: area
            };
            
            grupos.set(grupoKey, grupo);
            gruposCreados++;
        }
        
        // Vincular práctica con grupo
        practicaGrupo.push({
            id_practica: idPractica,
            id_grupo: grupos.get(grupoKey).id_grupo,
            activo: true
        });
        
        // Crear indicación si hay texto
        if (textoIndicaciones && textoIndicaciones.trim()) {
            const indicacionKey = `IND_${idPractica}`;
            
            if (!indicaciones.has(indicacionKey)) {
                const indicacion = {
                    id_indicacion: indicacionesCreadas + 1,
                    descripcion: `Indicación para ${descripcion}`,
                    texto_instruccion: limpiarTexto(textoIndicaciones),
                    tipo_indicacion: 'PREPARACION',
                    area: area,
                    estado: 'ACTIVO'
                };
                
                indicaciones.set(indicacionKey, indicacion);
                indicacionesCreadas++;
                
                // Vincular indicación con grupo
                grupoIndicacion.push({
                    id_grupo: grupos.get(grupoKey).id_grupo,
                    id_indicacion: indicacion.id_indicacion,
                    orden: 1,
                    activo: true
                });
            }
        }
    }
    
    console.log('📊 Procesando indicaciones especializadas...');
    
    // Procesar indicaciones individuales de la hoja IndicacionesIndividuales
    const indicacionesSheet = workbook.Sheets['IndicacionesIndividuales'];
    if (indicacionesSheet) {
        const indicacionesData = XLSX.utils.sheet_to_json(indicacionesSheet, { defval: "", header: 1 });
        
        for (let i = 1; i < Math.min(indicacionesData.length, 100); i++) { // Limitar a 100 para no sobrecargar
            const row = indicacionesData[i];
            const descripcion = limpiarTexto(row[1]); // DESCRIPCIÓN
            
            if (descripcion && descripcion.length > 10) {
                const indicacion = {
                    id_indicacion: indicacionesCreadas + 1,
                    descripcion: descripcion.substring(0, 100),
                    texto_instruccion: descripcion,
                    tipo_indicacion: 'ESPECIALIZADA',
                    area: 'GENERAL',
                    estado: 'ACTIVO'
                };
                
                indicaciones.set(`ESPECIALIZADA_${i}`, indicacion);
                indicacionesCreadas++;
            }
        }
    }
    
    console.log('📝 Generando archivo SQL...');
    
    // Generar SQL de inserción
    let sqlOutput = '';
    sqlOutput += '-- Archivo de importación de datos reales del Excel\n';
    sqlOutput += '-- Generado automáticamente\n\n';
    
    sqlOutput += '-- Limpiar datos existentes\n';
    sqlOutput += 'DELETE FROM PracticaGrupo;\n';
    sqlOutput += 'DELETE FROM GrupoIndicacion;\n';
    sqlOutput += 'DELETE FROM GruposAlternativos;\n';
    sqlOutput += 'DELETE FROM Practica;\n';
    sqlOutput += 'DELETE FROM Grupo;\n';
    sqlOutput += 'DELETE FROM Indicacion;\n\n';
    
    // Insertar prácticas
    sqlOutput += '-- Insertar prácticas\n';
    practicas.forEach(practica => {
        const nombre = practica.nombre.replace(/'/g, "''");
        const codigo = practica.codigo.replace(/'/g, "''");
        
        sqlOutput += `INSERT INTO Practica (id_practica, nombre, codigo, activo, fecha_creacion) VALUES (${practica.id_practica}, '${nombre}', '${codigo}', ${practica.activo ? 1 : 0}, datetime('now'));\n`;
    });
    
    sqlOutput += '\n-- Insertar grupos\n';
    grupos.forEach(grupo => {
        const nombre = grupo.nombre.replace(/'/g, "''");
        const descripcion = grupo.descripcion.replace(/'/g, "''");
        
        sqlOutput += `INSERT INTO Grupo (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_ultima_modificacion) VALUES (${grupo.id_grupo}, '${nombre}', '${descripcion}', ${grupo.ayuno_horas || 'NULL'}, ${grupo.orina_horas || 'NULL'}, ${grupo.orina_tipo ? `'${grupo.orina_tipo}'` : 'NULL'}, ${grupo.activo ? 1 : 0}, datetime('now'), datetime('now'));\n`;
    });
    
    sqlOutput += '\n-- Insertar indicaciones\n';
    indicaciones.forEach(indicacion => {
        const descripcion = indicacion.descripcion.replace(/'/g, "''");
        const textoInstruccion = indicacion.texto_instruccion.replace(/'/g, "''");
        const tipoIndicacion = indicacion.tipo_indicacion.replace(/'/g, "''");
        const area = indicacion.area.replace(/'/g, "''");
        
        sqlOutput += `INSERT INTO Indicacion (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, fecha_alta, fecha_ultima_modificacion) VALUES (${indicacion.id_indicacion}, '${descripcion}', '${textoInstruccion}', '${tipoIndicacion}', '${area}', 'ACTIVO', datetime('now'), datetime('now'));\n`;
    });
    
    sqlOutput += '\n-- Vincular prácticas con grupos\n';
    practicaGrupo.forEach(vinculo => {
        sqlOutput += `INSERT INTO PracticaGrupo (id_practica, id_grupo, activo, fecha_vinculacion) VALUES (${vinculo.id_practica}, ${vinculo.id_grupo}, ${vinculo.activo ? 1 : 0}, datetime('now'));\n`;
    });
    
    sqlOutput += '\n-- Vincular grupos con indicaciones\n';
    grupoIndicacion.forEach(vinculo => {
        sqlOutput += `INSERT INTO GrupoIndicacion (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) VALUES (${vinculo.id_grupo}, ${vinculo.id_indicacion}, ${vinculo.orden}, ${vinculo.activo ? 1 : 0}, datetime('now'));\n`;
    });
    
    // Agregar algunas reglas alternativas de ejemplo
    sqlOutput += '\n-- Agregar reglas alternativas de ejemplo\n';
    sqlOutput += `INSERT INTO GruposAlternativos (id_grupo_alternativo, id_grupo_condicion_1, id_grupo_condicion_2, id_grupo_resultante, descripcion_caso, activo, fecha_creacion) VALUES (1, 1, 2, 1, 'Cuando se combinan ayuno de 8h y ayuno de 4h, se aplica el más restrictivo', 1, datetime('now'));\n`;
    
    // Escribir archivo
    fs.writeFileSync(OUTPUT_SQL_FILE, sqlOutput);
    
    // Mostrar estadísticas
    console.log('✅ Importación completada exitosamente!');
    console.log('==========================================');
    console.log(`📊 Estadísticas de importación:`);
    console.log(`   • Prácticas importadas: ${practicasValidas}`);
    console.log(`   • Grupos creados: ${gruposCreados}`);
    console.log(`   • Indicaciones creadas: ${indicacionesCreadas}`);
    console.log(`   • Vínculos práctica-grupo: ${practicaGrupo.length}`);
    console.log(`   • Vínculos grupo-indicación: ${grupoIndicacion.length}`);
    console.log(`\n📁 Archivo SQL generado: ${OUTPUT_SQL_FILE}`);
    console.log(`\n🚀 Para aplicar los datos, ejecutar:`);
    console.log(`   sqlite3 prisma/indicaciones.db < ${OUTPUT_SQL_FILE}`);
    
    // Mostrar áreas encontradas
    const areasUnicas = new Set(practicas.map(p => p.area));
    console.log(`\n🏥 Áreas de laboratorio encontradas (${areasUnicas.size}):`);
    areasUnicas.forEach(area => console.log(`   • ${area}`));
    
    // Mostrar tipos de preparación
    const tiposPreparacion = new Set();
    grupos.forEach(grupo => {
        if (grupo.ayuno_horas) tiposPreparacion.add(`Ayuno ${grupo.ayuno_horas}h`);
        if (grupo.orina_tipo) tiposPreparacion.add(grupo.orina_tipo);
    });
    
    console.log(`\n🧪 Tipos de preparación encontrados (${tiposPreparacion.size}):`);
    tiposPreparacion.forEach(tipo => console.log(`   • ${tipo}`));
    
} catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
