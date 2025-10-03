// exportar-a-mysql.js
// Script para exportar datos de SQLite a MySQL

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

console.log('🔄 EXPORTANDO DATOS DE SQLITE A MYSQL');
console.log('=====================================\n');

async function exportarAMySQL() {
    try {
        let sqlOutput = '';
        
        // Cabecera del archivo SQL
        sqlOutput += '-- =====================================================\n';
        sqlOutput += '-- EXPORTACIÓN DE DATOS PARA MYSQL\n';
        sqlOutput += `-- Generado: ${new Date().toLocaleString()}\n`;
        sqlOutput += '-- Fuente: indicaciones.db (SQLite)\n';
        sqlOutput += '-- Destino: Indicaciones_local (MySQL)\n';
        sqlOutput += '-- =====================================================\n\n';
        
        sqlOutput += '-- Configuración para MySQL\n';
        sqlOutput += 'SET FOREIGN_KEY_CHECKS=0;\n';
        sqlOutput += 'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n';
        sqlOutput += 'SET time_zone = "+00:00";\n\n';
        
        // Limpiar tablas existentes
        sqlOutput += '-- Limpiar datos existentes\n';
        sqlOutput += 'TRUNCATE TABLE GrupoIndicacion;\n';
        sqlOutput += 'TRUNCATE TABLE PracticaGrupo;\n';
        sqlOutput += 'TRUNCATE TABLE GruposAlternativos;\n';
        sqlOutput += 'TRUNCATE TABLE Indicacion;\n';
        sqlOutput += 'TRUNCATE TABLE Grupo;\n';
        sqlOutput += 'TRUNCATE TABLE Practica;\n\n';
        
        // Exportar PRACTICAS
        console.log('📊 Exportando Prácticas...');
        const practicas = await prisma.practica.findMany({
            orderBy: { id_practica: 'asc' }
        });
        
        if (practicas.length > 0) {
            sqlOutput += '-- =====================================================\n';
            sqlOutput += `-- PRACTICAS (${practicas.length} registros)\n`;
            sqlOutput += '-- =====================================================\n';
            
            for (const practica of practicas) {
                const nombre = practica.nombre.replace(/'/g, "''");
                const codigo = practica.codigo.replace(/'/g, "''");
                const activo = practica.activo ? 1 : 0;
                const fecha = practica.fecha_creacion ? 
                    practica.fecha_creacion.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                
                sqlOutput += `INSERT INTO Practica (id_practica, nombre, codigo, activo, fecha_creacion) VALUES `;
                sqlOutput += `(${practica.id_practica}, '${nombre}', '${codigo}', ${activo}, '${fecha}');\n`;
            }
            sqlOutput += '\n';
            console.log(`✅ ${practicas.length} prácticas exportadas`);
        }
        
        // Exportar GRUPOS
        console.log('📊 Exportando Grupos...');
        const grupos = await prisma.grupo.findMany({
            orderBy: { id_grupo: 'asc' }
        });
        
        if (grupos.length > 0) {
            sqlOutput += '-- =====================================================\n';
            sqlOutput += `-- GRUPOS (${grupos.length} registros)\n`;
            sqlOutput += '-- =====================================================\n';
            
            for (const grupo of grupos) {
                const nombre = grupo.nombre.replace(/'/g, "''");
                const descripcion = grupo.descripcion ? grupo.descripcion.replace(/'/g, "''") : '';
                const ayunoHoras = grupo.ayuno_horas || 'NULL';
                const orinaHoras = grupo.orina_horas || 'NULL';
                const orinaTipo = grupo.orina_tipo ? `'${grupo.orina_tipo}'` : 'NULL';
                const activo = grupo.activo ? 1 : 0;
                const fechaAlta = grupo.fecha_alta ? 
                    grupo.fecha_alta.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                const fechaBaja = grupo.fecha_baja ? 
                    `'${grupo.fecha_baja.toISOString().slice(0, 19).replace('T', ' ')}'` : 
                    'NULL';
                const fechaMod = grupo.fecha_ultima_modificacion ? 
                    grupo.fecha_ultima_modificacion.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                
                sqlOutput += `INSERT INTO Grupo (id_grupo, nombre, descripcion, ayuno_horas, orina_horas, orina_tipo, activo, fecha_alta, fecha_baja, fecha_ultima_modificacion) VALUES `;
                sqlOutput += `(${grupo.id_grupo}, '${nombre}', '${descripcion}', ${ayunoHoras}, ${orinaHoras}, ${orinaTipo}, ${activo}, '${fechaAlta}', ${fechaBaja}, '${fechaMod}');\n`;
            }
            sqlOutput += '\n';
            console.log(`✅ ${grupos.length} grupos exportados`);
        }
        
        // Exportar INDICACIONES
        console.log('📊 Exportando Indicaciones...');
        const indicaciones = await prisma.indicacion.findMany({
            orderBy: { id_indicacion: 'asc' }
        });
        
        if (indicaciones.length > 0) {
            sqlOutput += '-- =====================================================\n';
            sqlOutput += `-- INDICACIONES (${indicaciones.length} registros)\n`;
            sqlOutput += '-- =====================================================\n';
            
            for (const indicacion of indicaciones) {
                const descripcion = indicacion.descripcion.replace(/'/g, "''");
                const texto = indicacion.texto_instruccion.replace(/'/g, "''");
                const tipo = indicacion.tipo_indicacion ? indicacion.tipo_indicacion.replace(/'/g, "''") : 'GENERAL';
                const area = indicacion.area ? indicacion.area.replace(/'/g, "''") : 'GENERAL';
                const estado = indicacion.estado || 'ACTIVO';
                const idInferior = indicacion.id_indicacion_inferior || 'NULL';
                const fechaAlta = indicacion.fecha_alta ? 
                    indicacion.fecha_alta.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                const fechaBaja = indicacion.fecha_baja ? 
                    `'${indicacion.fecha_baja.toISOString().slice(0, 19).replace('T', ' ')}'` : 
                    'NULL';
                const fechaMod = indicacion.fecha_ultima_modificacion ? 
                    indicacion.fecha_ultima_modificacion.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                
                sqlOutput += `INSERT INTO Indicacion (id_indicacion, descripcion, texto_instruccion, tipo_indicacion, area, estado, id_indicacion_inferior, fecha_alta, fecha_baja, fecha_ultima_modificacion) VALUES `;
                sqlOutput += `(${indicacion.id_indicacion}, '${descripcion}', '${texto}', '${tipo}', '${area}', '${estado}', ${idInferior}, '${fechaAlta}', ${fechaBaja}, '${fechaMod}');\n`;
            }
            sqlOutput += '\n';
            console.log(`✅ ${indicaciones.length} indicaciones exportadas`);
        }
        
        // Exportar PRACTICA_GRUPO
        console.log('📊 Exportando relaciones Practica-Grupo...');
        const practicaGrupos = await prisma.practicaGrupo.findMany();
        
        if (practicaGrupos.length > 0) {
            sqlOutput += '-- =====================================================\n';
            sqlOutput += `-- PRACTICA_GRUPO (${practicaGrupos.length} relaciones)\n`;
            sqlOutput += '-- =====================================================\n';
            
            for (const rel of practicaGrupos) {
                const activo = rel.activo ? 1 : 0;
                const fecha = rel.fecha_vinculacion ? 
                    rel.fecha_vinculacion.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                
                sqlOutput += `INSERT INTO PracticaGrupo (id_practica, id_grupo, activo, fecha_vinculacion) VALUES `;
                sqlOutput += `(${rel.id_practica}, ${rel.id_grupo}, ${activo}, '${fecha}');\n`;
            }
            sqlOutput += '\n';
            console.log(`✅ ${practicaGrupos.length} relaciones Practica-Grupo exportadas`);
        }
        
        // Exportar GRUPO_INDICACION
        console.log('📊 Exportando relaciones Grupo-Indicacion...');
        const grupoIndicaciones = await prisma.grupoIndicacion.findMany();
        
        if (grupoIndicaciones.length > 0) {
            sqlOutput += '-- =====================================================\n';
            sqlOutput += `-- GRUPO_INDICACION (${grupoIndicaciones.length} relaciones)\n`;
            sqlOutput += '-- =====================================================\n';
            
            for (const rel of grupoIndicaciones) {
                const activo = rel.activo ? 1 : 0;
                const orden = rel.orden || 0;
                const fecha = rel.fecha_vinculacion ? 
                    rel.fecha_vinculacion.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                
                sqlOutput += `INSERT INTO GrupoIndicacion (id_grupo, id_indicacion, orden, activo, fecha_vinculacion) VALUES `;
                sqlOutput += `(${rel.id_grupo}, ${rel.id_indicacion}, ${orden}, ${activo}, '${fecha}');\n`;
            }
            sqlOutput += '\n';
            console.log(`✅ ${grupoIndicaciones.length} relaciones Grupo-Indicacion exportadas`);
        }
        
        // Exportar GRUPOS_ALTERNATIVOS
        console.log('📊 Exportando Grupos Alternativos...');
        const gruposAlternativos = await prisma.gruposAlternativos.findMany();
        
        if (gruposAlternativos.length > 0) {
            sqlOutput += '-- =====================================================\n';
            sqlOutput += `-- GRUPOS_ALTERNATIVOS (${gruposAlternativos.length} registros)\n`;
            sqlOutput += '-- =====================================================\n';
            
            for (const alt of gruposAlternativos) {
                const descripcion = alt.descripcion_caso ? alt.descripcion_caso.replace(/'/g, "''") : '';
                const activo = alt.activo ? 1 : 0;
                const fecha = alt.fecha_creacion ? 
                    alt.fecha_creacion.toISOString().slice(0, 19).replace('T', ' ') : 
                    'NOW()';
                
                sqlOutput += `INSERT INTO GruposAlternativos (id_grupo_alternativo, id_grupo_condicion_1, id_grupo_condicion_2, id_grupo_resultante, descripcion_caso, activo, fecha_creacion) VALUES `;
                sqlOutput += `(${alt.id_grupo_alternativo}, ${alt.id_grupo_condicion_1}, ${alt.id_grupo_condicion_2}, ${alt.id_grupo_resultante}, '${descripcion}', ${activo}, '${fecha}');\n`;
            }
            sqlOutput += '\n';
            console.log(`✅ ${gruposAlternativos.length} grupos alternativos exportados`);
        }
        
        // Restaurar configuración de MySQL
        sqlOutput += '-- Restaurar configuración\n';
        sqlOutput += 'SET FOREIGN_KEY_CHECKS=1;\n\n';
        
        sqlOutput += '-- =====================================================\n';
        sqlOutput += '-- EXPORTACIÓN COMPLETADA\n';
        sqlOutput += '-- =====================================================\n';
        
        // Guardar archivo
        const filename = 'export-para-mysql.sql';
        fs.writeFileSync(filename, sqlOutput);
        
        console.log('\n✅ EXPORTACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('=====================================');
        console.log(`📁 Archivo generado: ${filename}`);
        console.log('\n📊 Resumen de exportación:');
        console.log(`   • Prácticas: ${practicas.length}`);
        console.log(`   • Grupos: ${grupos.length}`);
        console.log(`   • Indicaciones: ${indicaciones.length}`);
        console.log(`   • Relaciones Practica-Grupo: ${practicaGrupos.length}`);
        console.log(`   • Relaciones Grupo-Indicacion: ${grupoIndicaciones.length}`);
        console.log(`   • Grupos Alternativos: ${gruposAlternativos.length}`);
        
        console.log('\n🚀 Próximos pasos para importar a MySQL:');
        console.log('   1. Abre DBeaver y conecta a tu base MySQL');
        console.log('   2. Haz clic derecho en la base "Indicaciones_local"');
        console.log('   3. Selecciona "SQL Editor" > "Execute SQL Script"');
        console.log(`   4. Selecciona el archivo: ${filename}`);
        console.log('   5. Ejecuta el script');
        console.log('\n   O desde línea de comandos:');
        console.log('   mysql -u root -p Indicaciones_local < export-para-mysql.sql');
        
    } catch (error) {
        console.error('❌ Error durante la exportación:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

exportarAMySQL();
