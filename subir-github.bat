@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          🚀 SUBIR PROYECTO A GITHUB                         ║
echo ║                                                              ║
echo ║     Sistema de Indicaciones de Laboratorio                  ║
echo ║                 DGSISAN 2025                                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app"

echo 📍 Directorio de trabajo: %CD%
echo.

REM Verificar si Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Git no está instalado
    echo Por favor, instala Git desde: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✅ Git está instalado

echo.
echo 📊 Estado actual de Git:
echo ================================
git status
echo.

echo ⚠️  IMPORTANTE: Asegúrate de NO subir archivos sensibles:
echo    - Archivos .db (bases de datos)
echo    - Archivos .env (variables de entorno)
echo    - node_modules (dependencias)
echo.

set /p confirmar="¿Quieres continuar con el push? (S/N): "
if /i not "%confirmar%"=="S" (
    echo ❌ Push cancelado por el usuario
    pause
    exit /b 0
)

echo.
echo 🔍 Agregando archivos al staging...
git add .

echo.
echo 📝 Estado después de git add:
git status

echo.
set /p mensaje="Escribe el mensaje del commit (o presiona Enter para usar 'Update'): "
if "%mensaje%"=="" set mensaje=Update

echo.
echo 💾 Creando commit...
git commit -m "%mensaje%"

if errorlevel 1 (
    echo.
    echo ⚠️  No hay cambios para commitear o el commit falló
    echo.
    set /p force="¿Quieres hacer push de commits anteriores? (S/N): "
    if /i not "%force%"=="S" (
        pause
        exit /b 0
    )
)

echo.
echo 🌐 Verificando repositorio remoto...
git remote -v

echo.
echo 📤 Haciendo push a GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ⚠️  El push falló. Intentando con 'master' en lugar de 'main'...
    git push origin master
    
    if errorlevel 1 (
        echo.
        echo ❌ ERROR: El push falló
        echo.
        echo Posibles causas:
        echo   1. No hay repositorio remoto configurado
        echo   2. No tienes permisos para hacer push
        echo   3. Necesitas autenticación
        echo.
        echo Para configurar el repositorio remoto:
        echo   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
        echo.
        echo Para autenticarte, puede que necesites un token personal:
        echo   https://github.com/settings/tokens
        pause
        exit /b 1
    )
)

echo.
echo ✅ ¡Push completado exitosamente!
echo ================================
echo.
echo 🎉 Tu código ahora está en GitHub
echo.
echo 🔗 Para ver tu repositorio:
echo    https://github.com/TU_USUARIO/TU_REPO
echo.

pause
