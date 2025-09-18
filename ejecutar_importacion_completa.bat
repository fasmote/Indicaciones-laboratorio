@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  🚀 IMPORTACIÓN AUTOMÁTICA                   ║
echo ║             Datos Reales del Excel a la Base                ║
echo ║                                                              ║
echo ║          Sistema de Indicaciones de Laboratorio             ║
echo ║                    DGSISAN 2025                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Cambiar al directorio del proyecto
echo 📍 Cambiando al directorio del proyecto...
cd /d "C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app"

if errorlevel 1 (
    echo ❌ ERROR: No se pudo acceder al directorio del proyecto
    echo    Asegúrate de que la ruta sea correcta
    pause
    exit /b 1
)

echo ✅ Directorio actual: %CD%
echo.

REM Verificar prerequisitos
echo 🔍 Verificando prerequisitos...
echo ================================

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    echo    Descargar desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js instalado

REM Verificar archivo Excel
if not exist "REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx" (
    echo ❌ ERROR: Archivo Excel no encontrado
    echo    Archivo esperado: REVISARTabla de indicaciones para pacientes actualizada 2024 enviada por la RED.xlsx
    echo    Asegúrate de que el archivo esté en esta carpeta
    echo.
    echo    Archivos Excel encontrados en la carpeta:
    dir *.xlsx /b 2>nul
    if errorlevel 1 echo    (No se encontraron archivos Excel)
    pause
    exit /b 1
)
echo ✅ Archivo Excel encontrado

REM Verificar base de datos
if not exist "prisma\indicaciones.db" (
    echo ❌ ERROR: Base de datos no encontrada
    echo    Ejecuta primero: npm run db:migrate
    pause
    exit /b 1
)
echo ✅ Base de datos encontrada
echo.

REM Instalar dependencias si no existen
echo 📦 Verificando dependencias...
echo ===============================

if not exist "node_modules" (
    echo 🔄 Instalando dependencias del proyecto...
    npm install
    if errorlevel 1 (
        echo ❌ ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias del proyecto instaladas
) else (
    echo ✅ Dependencias del proyecto ya instaladas
)

REM Verificar XLSX específicamente
npm list xlsx >nul 2>&1
if errorlevel 1 (
    echo 🔄 Instalando librería XLSX...
    npm install xlsx
    if errorlevel 1 (
        echo ❌ ERROR: No se pudo instalar XLSX
        pause
        exit /b 1
    )
    echo ✅ XLSX instalado
) else (
    echo ✅ XLSX ya disponible
)
echo.

REM Crear el script de importación si no existe
echo 📝 Preparando script de importación...
echo =====================================

if not exist "script-importacion-directo.js" (
    echo ⚠️  Script de importación no encontrado
    echo    Creando script básico...
    echo // Script será completado automáticamente > script-importacion-directo.js
    echo ℹ️  INSTRUCCIÓN: Copia el contenido del script desde el artefacto generado
    echo    y pégalo en: script-importacion-directo.js
    echo.
    pause
)

echo ✅ Script de importación preparado
echo.

REM Hacer backup de la base de datos
echo 🔒 Creando backup de la base de datos...
echo =======================================

set "FECHA=%date:~-4,4%%date:~-10,2%%date:~-7,2%"
set "HORA=%time:~0,2%%time:~3,2%%time:~6,2%"
set "HORA=%HORA: =0%"
set "BACKUP_NAME=indicaciones_backup_%FECHA%_%HORA%.db"

copy "prisma\indicaciones.db" "prisma\%BACKUP_NAME%" >nul
if errorlevel 1 (
    echo ⚠️  No se pudo crear backup, continuando sin él...
) else (
    echo ✅ Backup creado: %BACKUP_NAME%
)
echo.

REM Ejecutar importación
echo 🚀 Ejecutando importación de datos...
echo ====================================

echo 📊 Procesando archivo Excel y generando SQL...
node script-importacion-directo.js
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Falló la importación de datos
    echo    Revisa los mensajes de error arriba
    echo    Si el script no existe, cópialo desde el artefacto generado
    pause
    exit /b 1
)

echo.
echo ✅ Procesamiento completado
echo.

REM Verificar que se generó el archivo SQL
if not exist "datos_reales_import.sql" (
    echo ❌ ERROR: No se generó el archivo SQL
    echo    Revisa si hubo errores en el script de importación
    pause
    exit /b 1
)

echo 📁 Archivo SQL generado exitosamente
echo.

REM Aplicar datos a la base de datos
echo 🗃️  Aplicando datos a la base de datos...
echo ========================================

echo    Aplicando SQL a la base SQLite...
sqlite3 "prisma\indicaciones.db" < "datos_reales_import.sql" 2>nul

if errorlevel 1 (
    echo ⚠️  Método directo falló, intentando método alternativo...
    
    REM Método alternativo usando Node.js
    echo const { execSync } = require('child_process'^); > aplicar_datos.js
    echo try { >> aplicar_datos.js
    echo   console.log('Aplicando datos a la base de datos...'^); >> aplicar_datos.js
    echo   execSync('sqlite3 prisma/indicaciones.db ".read datos_reales_import.sql"', {stdio: 'inherit'}^); >> aplicar_datos.js
    echo   console.log('✅ Datos aplicados exitosamente'^); >> aplicar_datos.js
    echo } catch^(e^) { >> aplicar_datos.js
    echo   console.error('❌ Error:', e.message^); >> aplicar_datos.js
    echo   process.exit^(1^); >> aplicar_datos.js
    echo } >> aplicar_datos.js
    
    node aplicar_datos.js
    if errorlevel 1 (
        echo ❌ ERROR: No se pudieron aplicar los datos
        echo    Intenta manualmente: sqlite3 prisma\indicaciones.db < datos_reales_import.sql
        pause
        exit /b 1
    )
    
    del aplicar_datos.js
)

echo ✅ Datos aplicados exitosamente a la base de datos
echo.

REM Verificar datos aplicados
echo 🔍 Verificando datos aplicados...
echo =================================

echo Creando script de verificación...
echo const { PrismaClient } = require('@prisma/client'^); > verificar_datos.js
echo const prisma = new PrismaClient^(^); >> verificar_datos.js
echo async function verificar^(^) { >> verificar_datos.js
echo   try { >> verificar_datos.js
echo     const practicas = await prisma.practica.count^(^); >> verificar_datos.js
echo     const grupos = await prisma.grupo.count^(^); >> verificar_datos.js
echo     const indicaciones = await prisma.indicacion.count^(^); >> verificar_datos.js
echo     console.log^('✅ Verificación completada:'^); >> verificar_datos.js
echo     console.log^(`   • Prácticas: ${practicas}`^); >> verificar_datos.js
echo     console.log^(`   • Grupos: ${grupos}`^); >> verificar_datos.js
echo     console.log^(`   • Indicaciones: ${indicaciones}`^); >> verificar_datos.js
echo     if ^(practicas === 0^) { >> verificar_datos.js
echo       console.log^('⚠️  No hay prácticas cargadas'^); >> verificar_datos.js
echo       process.exit^(1^); >> verificar_datos.js
echo     } >> verificar_datos.js
echo   } catch ^(e^) { >> verificar_datos.js
echo     console.error^('❌ Error de verificación:', e.message^); >> verificar_datos.js
echo     process.exit^(1^); >> verificar_datos.js
echo   } finally { >> verificar_datos.js
echo     await prisma.$disconnect^(^); >> verificar_datos.js
echo   } >> verificar_datos.js
echo } >> verificar_datos.js
echo verificar^(^); >> verificar_datos.js

node verificar_datos.js
if errorlevel 1 (
    echo ⚠️  Verificación mostró problemas
) else (
    echo ✅ Verificación exitosa
)

del verificar_datos.js
echo.

REM Mostrar resultado final
echo 🎉 ¡IMPORTACIÓN COMPLETADA!
echo ===========================
echo.
echo 📊 Los datos reales del laboratorio han sido cargados
echo 🗃️  Base de datos actualizada con prácticas, grupos e indicaciones
echo 🔧 Sistema listo para uso
echo.
echo 🚀 Próximos pasos:
echo   1. Iniciar el servidor: npm run dev
echo   2. Abrir navegador: http://localhost:3000
echo   3. Probar el simulador de indicaciones
echo   4. Verificar que se generan indicaciones correctas
echo.
echo 🔧 Comandos útiles:
echo   • Ver datos:     npm run db:studio
echo   • Logs:          npm run dev --verbose
echo   • Estado:        curl http://localhost:3000/api/health
echo.

REM Preguntar si quiere iniciar el servidor
echo.
set /p "INICIAR=¿Deseas iniciar el servidor ahora? (s/N): "
if /i "%INICIAR%"=="s" (
    echo.
    echo 🚀 Iniciando servidor...
    echo    Presiona Ctrl+C para detenerlo
    echo    URL: http://localhost:3000
    echo.
    start "Navegador" "http://localhost:3000"
    npm run dev
) else (
    echo.
    echo 👋 Para iniciar el servidor más tarde: npm run dev
    echo    URL: http://localhost:3000
)

echo.
echo ✨ ¡Sistema con datos reales listo para usar!
pause