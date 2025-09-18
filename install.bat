@echo off
title Instalacion Sistema de Indicaciones de Laboratorio
color 0A

echo =====================================
echo  SISTEMA DE INDICACIONES DE LABORATORIO
echo  Instalacion Automatica
echo =====================================
echo.

REM Verificar si Node.js esta instalado
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js detectado

REM Verificar si npm esta disponible
echo [2/6] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no esta disponible.
    pause
    exit /b 1
)
echo ✅ npm disponible

REM Instalar dependencias
echo [3/6] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

REM Generar cliente Prisma
echo [4/6] Generando cliente Prisma...
call npm run db:generate
if errorlevel 1 (
    echo ERROR: Fallo la generacion del cliente Prisma
    pause
    exit /b 1
)
echo ✅ Cliente Prisma generado

REM Ejecutar migraciones
echo [5/6] Creando base de datos...
call npm run db:migrate
if errorlevel 1 (
    echo ERROR: Fallo la creacion de la base de datos
    pause
    exit /b 1
)
echo ✅ Base de datos creada

REM Cargar datos de prueba
echo [6/6] Cargando datos de prueba...
call npm run db:seed
if errorlevel 1 (
    echo ERROR: Fallo la carga de datos de prueba
    pause
    exit /b 1
)
echo ✅ Datos de prueba cargados

echo.
echo =====================================
echo  INSTALACION COMPLETADA EXITOSAMENTE
echo =====================================
echo.
echo Para iniciar el sistema:
echo   npm run dev
echo.
echo Luego visita: http://localhost:3000
echo.
echo Presiona cualquier tecla para iniciar el servidor...
pause >nul

echo Iniciando servidor...
call npm run dev
