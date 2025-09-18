@echo off
title Diagnostico del Sistema
color 0E

echo =====================================
echo  DIAGNOSTICO DEL SISTEMA
echo =====================================
echo.

echo [1/5] Verificando archivos...
if not exist "package.json" (
    echo ERROR: package.json no encontrado
    pause
    exit /b 1
)
echo ✅ Archivos encontrados

echo [2/5] Verificando base de datos...
if not exist "prisma\indicaciones.db" (
    echo ⚠️  Base de datos no encontrada, recreando...
    call npm run db:migrate
    call npm run db:seed
) else (
    echo ✅ Base de datos existe
)

echo [3/5] Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️  Dependencias no encontradas, instalando...
    call npm install
) else (
    echo ✅ Dependencias instaladas
)

echo [4/5] Verificando cliente Prisma...
if not exist "node_modules\.prisma" (
    echo ⚠️  Cliente Prisma no encontrado, generando...
    call npm run db:generate
) else (
    echo ✅ Cliente Prisma existe
)

echo [5/5] Verificando datos...
echo Contando registros en la base de datos...

echo.
echo =====================================
echo  INICIANDO SERVIDOR DE DIAGNOSTICO
echo =====================================
echo.
echo Si el servidor no inicia, revisa los errores arriba.
echo El navegador debería abrirse automáticamente en:
echo http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

start http://localhost:3000/api/health
timeout /t 2 >nul
start http://localhost:3000/api/debug/count
timeout /t 2 >nul
start http://localhost:3000

call npm run dev
