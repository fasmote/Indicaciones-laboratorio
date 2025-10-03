@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🔄 EXPORTAR DATOS SQLITE A MYSQL                   ║
echo ║                                                              ║
echo ║     Sistema de Indicaciones de Laboratorio                  ║
echo ║                 DGSISAN 2025                                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app"

echo 📍 Directorio de trabajo: %CD%
echo.

echo 🔍 Verificando prerequisitos...
echo ================================

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    pause
    exit /b 1
)
echo ✅ Node.js instalado

REM Verificar base de datos SQLite
if not exist "prisma\indicaciones.db" (
    echo ❌ ERROR: Base de datos SQLite no encontrada
    echo    Ubicación esperada: prisma\indicaciones.db
    pause
    exit /b 1
)
echo ✅ Base de datos SQLite encontrada

echo.
echo 🚀 Ejecutando exportación...
echo ============================
echo.

node exportar-a-mysql.js

if errorlevel 1 (
    echo.
    echo ❌ ERROR: La exportación falló
    pause
    exit /b 1
)

echo.
echo ✅ ¡EXPORTACIÓN COMPLETADA!
echo ==========================
echo.
echo 📁 El archivo SQL ha sido generado: export-para-mysql.sql
echo.
echo 🔧 Ahora puedes importarlo a MySQL de dos formas:
echo.
echo OPCIÓN 1 - Usando DBeaver (Recomendado):
echo    1. Abre DBeaver
echo    2. Conecta a tu base "Indicaciones_local"
echo    3. Clic derecho ^> SQL Editor ^> Execute SQL Script
echo    4. Selecciona el archivo "export-para-mysql.sql"
echo    5. Ejecuta
echo.
echo OPCIÓN 2 - Línea de comandos:
echo    mysql -u root -p Indicaciones_local ^< export-para-mysql.sql
echo.
echo 💡 Si la conexión en DBeaver falla:
echo    - Verifica que MySQL esté corriendo
echo    - Comprueba usuario y contraseña
echo    - Revisa que el puerto 3306 esté disponible
echo.

pause
