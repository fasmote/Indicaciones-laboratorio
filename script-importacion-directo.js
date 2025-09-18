// script-importacion-directo.js
// Script para importar datos reales del Excel al sistema (ES6 Module)

import XLSX from 'xlsx';
import fs from 'fs';

console.log('🚀 IMPORTACIÓN DIRECTA DE DATOS REALES');
console.log('=====================================');

const CONFIG = {
    EXCEL_FILE: 'REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx',
    OUTPUT_FILE: 'datos_reales_import.sql',
    LIMITE_PRACTICAS: 300
};

// Verificar que el archivo Excel existe
if (!fs.existsSync(CONFIG.EXCEL_FILE)) {
    console.error('❌ ERROR: Archivo Excel no encontrado:', CONFIG.EXCEL_FILE);
    console.error('   Asegúrate de que el archivo esté en la misma carpeta que este script.');
    process.exit(1);
}

console.log('✅ Archivo Excel encontrado');

try {
    // PASO 1: Leer Excel
    console.log('📖 Leyendo archivo Excel...');
    const workbook = XLSX.readFile(CONFIG.EXCEL_FILE);
    const practicasSheet = workbook.Sheets['PRACTICAS'];
    const practicasData = XLSX.utils.sheet_to_json(practicasSheet, { defval: "", header: 1 });
    
    console.log(`   📊 ${practicasData.length - 1} prácticas disponibles`);
    
    // PASO 2: Configurar columnas
    const headers = practicasData[0];
    const colIndices = {
        id: headers.indexOf("ID_PRACTICA"),
        descripcion: headers.indexOf("DESCRIPCION CONSENSUADA"), 
        area: headers.indexOf("AREA"),
        orina: headers.indexOf("ORINA"),
        ayuno: headers.indexOf("AYUNO"),
        indicaciones: headers.indexOf("INDICACIONES PARA EL PACIENTE")
    };
    
    console.log('   🔍 Mapeado de columnas:');
    console.log(`      ID_PRACTICA: ${colIndices.id}`);
    console.log(`      DESCRIPCION: ${colIndices.descripcion}`);
    console.log(`      AREA: ${colIndices.area}`);
    console.log(`      INDICACIONES: ${colIndices.indicaciones}`);
    
    // PASO 3: Funciones de utilidad
    function limpiarTexto(texto) {
        if (!texto || texto === '') return null;
        return texto.toString()
            .trim()
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/'/g, "''")
            .substring(0, 500); // Limitar longitud para evitar errores SQL
    }
    
    function extraerAyuno(textoAyuno) {
        if (!textoAyuno) return null;
        const texto = textoAyuno.toLowerCase();
        if (texto.includes('12') && texto.includes('h')) return 12;
        if (texto.includes('8') && texto.includes('h')) return 8;
        if (texto.includes('4') && texto.includes('h')) return 4;
        if (texto.includes('3') && texto.includes('h')) return 3;
        return null;
    }
    
    function extraerOrina(textoOrina) {
        if (!textoOrina) return { tipo: null, horas: null };
        const texto = textoOrina.toUpperCase();
        if (texto.includes('24 HORAS')) return { tipo: 'ORINA_24H', horas: 24 };
        if (texto.includes('12 HORAS')) return { tipo: 'ORINA_12H', horas: 12 };
        if (texto.includes('2 HORAS')) return { tipo: 'ORINA_2H', horas: 2 };
        if (texto.includes('PRIMERA ORINA')) return { tipo: 'PRIMERA_ORINA', horas: null };
        return { tipo: null, horas: null };
    }
    
    // PASO 4: Procesar datos
    console.log(`🔄 Procesando ${CONFIG.LIMITE_PRACTICAS} prácticas...`);
    
    const practicas = [];
    const grupos = new Map();
    const indicaciones = new Map();
    const vinculos = { practicaGrupo: [], grupoIndicacion: [] };
    let contadores = { practicasValidas: 0, gruposCreados: 0, indicacionesCreadas: 0 };
    
    // Filtrar solo las áreas principales para empezar
    const AREAS_PRINCIPALES = ['QUIMICA', 'HEMATO/HEMOSTASIA', 'ENDOCRINO', 'BACTERIO', 'VIROLOGIA', 'INMUNOLOGIA'];
    
    for (let i = 1; i <= Math.min(CONFIG.LIMITE_PRACTICAS, practicasData.length - 1); i++) {
        const row = practicasData[i];
        
        const idPractica = row[colIndices.id];
        const descripcion = limpiarTexto(row[colIndices.descripcion]);
        const area = limpiarTexto(row[colIndices.area]);
        const textoOrina = row[colIndices.orina];
        const textoAyuno = row[colIndices.ayuno];
        const textoIndicaciones = row[colIndices.indicaciones];
        
        // Validaciones básicas
        if (!idPractica || !descripcion || !area) continue;
        
        // Filtrar por áreas principales
        if (!AREAS_PRINCIPALES.includes(area)) continue;
        
        // Crear práctica
        const practica = {
            id_practica: idPractica,
            nombre: descripcion.substring(0, 200),
            codigo: `${area.substring(0, 4)}_${idPractica}`,
            activo: true,
            area: area
        };
        
        practicas.push(practica);
        contadores.practicasValidas++;
        
        // Procesar requerimientos
        const ayunoHoras = extraerAyuno(textoAyuno);
        const infoOrina = extraerOrina(textoOrina);
        
        // Crear clave de grupo
        let grupoKey = area;
        if (ayunoHoras) grupoKey += `_AYUNO${ayunoHoras}H`;
        if (infoOrina.tipo) grupoKey += `_${infoOrina.tipo}`;
        if (!ayunoHoras && !infoOrina.tipo) grupoKey += '_SIN_PREPARACION';
        
        // Crear grupo si no existe
        if (!grupos.has(grupoKey)) {
            const grupoId = contadores.gruposCreados + 1;
            const grupo = {
                id_grupo: grupoId,
                nombre: grupoKey.substring(0, 100), // Limitar longitud
                descripcion: `Grupo ${area}${ayunoHoras ? ` - Ayuno ${ayunoHoras}h` : ''}${infoOrina.tipo ? ` - ${infoOrina.tipo.replace('_', ' ')}` : ''}`.substring(0, 200),
                ayuno_horas: ayunoHoras,
                orina_horas: infoOrina.horas,
                orina_tipo: infoOrina.tipo,
                activo: true,
                area: area
            };
            
            grupos.set(grupoKey, grupo);
            contadores.gruposCreados++;
        }
        
        // Vincular práctica-grupo
        vinculos.practicaGrupo.push({
            id_practica: idPractica,
            id_grupo: grupos.get(grupoKey).id_grupo,
            activo: true
        });
        
        // Procesar indicación
        if (textoIndicaciones && textoIndicaciones.trim().length > 20) {
            const indicacionId = contadores.indicacionesCreadas + 1;
            const indicacionKey = `IND_${idPractica}`;
            
            const indicacion = {
                id_indicacion: indicacionId,
                descripcion: `Indicación ${area} - ${descripcion.substring(0, 30)}...`.substring(0, 100),
                texto_instruccion: limpiarTexto(textoIndicaciones),
                tipo_indicacion: 'PREPARACION',
                area: area,
                estado: 'ACTIVO'
            };
            
            indicaciones.set(indicacionKey, indicacion);
            contadores.indicacionesCreadas++;
            
            // Vincular indicación con grupo
            vinculos.grupoIndicacion.push({
                id_grupo: grupos.get(grupoKey).id_grupo,
                id_indicacion: indicacionId,
                orden: 1,
                activo: true
            });
        }
        
        // Mostrar progreso
        if (i % 50 === 0) {
            console.log(`   📈 Procesadas ${contadores.practicasValidas} prácticas válidas de ${i} revisadas...`);
        }
    }
    
    console.log(`\n✅ Procesamiento completado:`);
    console.log(`   • Prácticas válidas: ${contadores.practicasValidas}`);
    console.log(`   • Grupos creados: ${contadores.gruposCreados}`);
    console.log(`   • Indicaciones creadas: ${contadores.indicacionesCreadas}`);
    console.log(`   • Vínculos práctica-grupo: ${vinculos.practicaGrupo.length}`);
    console.log(`   • Vínculos grupo-indicación: ${vinculos.grupoIndicacion.length}`);
    
    // PASO 5: Generar SQL
    console.log('\n📝 Generando archivo SQL...');
    
    let sql = '';
    sql += '-- Datos reales importados del Excel DGSISAN 2025\n';
    sql += `-- Generado el ${new Date().toLocaleString()}\n`;
    sql += `-- Total de prácticas: ${contadores.practicasValidas}\n`;
    sql += `-- Total de grupos: ${contadores.gruposCreados}\n`;
    sql += `-- Total de indicaciones: ${contadores.indicacionesCreadas}\n\n`;
    
    // Limpiar datos existentes
    sql += '-- Limpiar datos existentes\n';
    sql += 'DELETE FROM PracticaGrupo;\n';
    sql += 'DELETE FROM GrupoIndicacion;\n';
    sql += 'DELETE FROM GruposAlternativos;\n';
    sql += 'DELETE FROM Practica;\n';
    sql += 'DELETE FROM Grupo;\n';
    sql += 'DELETE FROM Indicacion;\n\n';
    
    // Insertar prácticas
    sql += '-- INSERTAR PRÁCTICAS\n';
    practicas.forEach(practica => {
        sql += `INSERT INTO Practica (id_practica, nombre, codigo, activo, fecha_creacion) VALUES (${practica.id_practica}, '${practica.nombre}', '${practica.codigo}', 1, datetime('now'));\n`;
    });
    
    // Insertar grupos
    sql += '\n-- INSERTAR GRUPOS\n';
    grupos.forEach(grupo => {
        sql += `INSERT INTO Grupo (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_ultima_modificacion) VALUES (${grupo.id_grupo}, '${grupo.nombre}', '${grupo.descripcion}', ${grupo.ayuno_horas || 'NULL'}, ${grupo.orina_horas || 'NULL'}, ${grupo.orina_tipo ? `'${grupo.orina_tipo}'` : 'NULL'}, 1, datetime('now'), datetime('now'));\n`;
    });
    
    // Insertar indicaciones
    sql += '\n-- INSERTAR INDICACIONES\n';
    indicaciones.forEach(indicacion => {
        sql += `INSERT INTO Indicacion (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, fecha_alta, fecha_ultima_modificacion) VALUES (${indicacion.id_indicacion}, '${indicacion.descripcion}', '${indicacion.texto_instruccion}', '${indicacion.tipo_indicacion}', '${indicacion.area}', 'ACTIVO', datetime('now'), datetime('now'));\n`;
    });
    
    // Insertar vínculos
    sql += '\n-- INSERTAR VÍNCULOS PRÁCTICA-GRUPO\n';
    vinculos.practicaGrupo.forEach(vinculo => {
        sql += `INSERT INTO PracticaGrupo (id_practica, id_grupo, activo, fecha_vinculacion) VALUES (${vinculo.id_practica}, ${vinculo.id_grupo}, 1, datetime('now'));\n`;
    });
    
    sql += '\n-- INSERTAR VÍNCULOS GRUPO-INDICACIÓN\n';
    vinculos.grupoIndicacion.forEach(vinculo => {
        sql += `INSERT INTO GrupoIndicacion (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) VALUES (${vinculo.id_grupo}, ${vinculo.id_indicacion}, ${vinculo.orden}, 1, datetime('now'));\n`;
    });
    
    // Reglas alternativas de ejemplo
    sql += '\n-- REGLAS ALTERNATIVAS DE EJEMPLO\n';
    sql += `INSERT INTO GruposAlternativos (id_grupo_alternativo, id_grupo_condicion_1, id_grupo_condicion_2, id_grupo_resultante, descripcion_caso, activo, fecha_creacion) VALUES (1, 1, 2, 1, 'Combinar ayunos: se toma el más restrictivo', 1, datetime('now'));\n`;
    
    // Guardar archivo SQL
    fs.writeFileSync(CONFIG.OUTPUT_FILE, sql);
    
    console.log(`✅ Archivo SQL generado: ${CONFIG.OUTPUT_FILE}`);
    console.log(`   📄 Tamaño: ${sql.length} caracteres`);
    
    // Mostrar estadísticas por área
    const estadisticasPorArea = new Map();
    practicas.forEach(practica => {
        const area = practica.area;
        estadisticasPorArea.set(area, (estadisticasPorArea.get(area) || 0) + 1);
    });
    
    console.log('\n🏥 Distribución por áreas:');
    estadisticasPorArea.forEach((cantidad, area) => {
        console.log(`   • ${area}: ${cantidad} prácticas`);
    });
    
    // Mostrar tipos de preparación
    const tiposPreparacion = new Set();
    grupos.forEach(grupo => {
        if (grupo.ayuno_horas) tiposPreparacion.add(`Ayuno ${grupo.ayuno_horas}h`);
        if (grupo.orina_tipo) tiposPreparacion.add(grupo.orina_tipo.replace('_', ' '));
    });
    
    console.log(`\n🧪 Tipos de preparación encontrados (${tiposPreparacion.size}):`);
    tiposPreparacion.forEach(tipo => console.log(`   • ${tipo}`));
    
    console.log('\n🎉 IMPORTACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('======================================');
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Aplicar a la base de datos:');
    console.log(`   sqlite3 prisma/indicaciones.db < ${CONFIG.OUTPUT_FILE}`);
    console.log('2. Iniciar el servidor:');
    console.log('   npm run dev');
    console.log('3. Probar en el navegador:');
    console.log('   http://localhost:3000');
    
} catch (error) {
    console.error('\n❌ ERROR durante la importación:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
