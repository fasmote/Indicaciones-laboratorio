# 🧪 Sistema de Gestión de Indicaciones de Laboratorio

[![Estado](https://img.shields.io/badge/Estado-Funcional-success)](https://github.com)
[![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)](https://github.com)
[![Node](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-3.0-lightgrey)](https://sqlite.org)

**Sistema inteligente para la gestión y generación automática de indicaciones de laboratorio**

![Sistema de Indicaciones](./docs/screenshot-home.png)

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Características Principales](#-características-principales)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Instalación Rápida](#-instalación-rápida)
- [Modelo de Datos](#-modelo-de-datos)
- [API Endpoints](#-api-endpoints)
- [Algoritmo de Generación](#-algoritmo-de-generación-de-indicaciones)
- [Gestión de Base de Datos](#-gestión-de-base-de-datos)
- [Importación de Datos desde Excel](#-importación-de-datos-desde-excel)
- [Comandos Útiles](#-comandos-útiles)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribuir](#-contribuir)

---

## 🎯 Descripción del Proyecto

Sistema prototipo para la gestión inteligente de indicaciones de laboratorio que permite:

- ✅ **Agrupar indicaciones compatibles** para múltiples prácticas de laboratorio
- ✅ **Resolver conflictos automáticamente** (ej: determinar ayuno máximo, tipos de orina)
- ✅ **Aplicar reglas alternativas** para combinaciones específicas de estudios
- ✅ **Generar indicaciones consolidadas** listas para enviar al paciente por email/WhatsApp
- ✅ **Gestionar catálogo completo** de prácticas, grupos e indicaciones individuales

### Problema que Resuelve

Los pacientes frecuentemente deben realizarse múltiples estudios de laboratorio en un mismo turno. Cada práctica puede tener diferentes requisitos de preparación (ayuno, recolección de orina, restricciones alimentarias, etc.). Este sistema:

1. **Consolida automáticamente** las indicaciones de múltiples prácticas
2. **Resuelve conflictos** cuando hay requisitos contradictorios (ej: ayuno de 8h vs 12h → toma el más restrictivo)
3. **Elimina duplicados** de indicaciones repetidas
4. **Ordena lógicamente** las instrucciones por prioridad
5. **Genera un mensaje único** con todas las indicaciones para el paciente

---

## ⭐ Características Principales

### 🔄 Gestión Completa de Entidades

- **Prácticas de Laboratorio**: CRUD completo con códigos únicos y áreas (264+ prácticas disponibles)
- **Grupos de Indicaciones**: Agrupación inteligente por tipo de preparación
- **Indicaciones Individuales**: Biblioteca reutilizable de instrucciones
- **Vinculaciones M:N**: Relaciones flexibles entre prácticas, grupos e indicaciones
- **Reglas Alternativas**: Casos especiales para combinaciones específicas

### 🎯 Algoritmo Inteligente

- Cálculo automático de ayuno máximo requerido
- Detección de tipo de recolección de orina necesaria
- Sistema de prioridades entre indicaciones
- Eliminación de duplicados
- Ordenamiento lógico de instrucciones

### 🖥️ Interfaz Web Funcional

- Simulador de generación de indicaciones
- Panel de gestión de prácticas
- Panel de gestión de grupos
- Panel de gestión de indicaciones individuales
- Cargador masivo de datos desde Excel
- Visualización clara de resultados

---

## 📸 Capturas de Pantalla

### Pantalla Principal - Simulador de Indicaciones
![Simulador](./docs/screenshot-simulador.png)

*Selecciona múltiples prácticas y genera automáticamente las indicaciones consolidadas*

### Gestión de Prácticas
![Prácticas](./docs/screenshot-practicas.png)

*Administra el catálogo completo de prácticas de laboratorio organizadas por código y nombre*

### Cargador de Datos Masivo
![Cargador](./docs/screenshot-cargador.png)

*Importa masivamente prácticas desde archivos Excel con procesamiento inteligente*

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│         Frontend (Vanilla JS)          │
│  HTML5 + CSS3 + JavaScript + Fetch API  │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────────┐
│       Backend (Node.js + Express)       │
│    Controllers + Routes + Middleware    │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────┐
│      Base de Datos (SQLite)             │
│  Prácticas, Grupos, Indicaciones, etc.  │
└─────────────────────────────────────────┘
```

### Componentes Principales

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Backend** | Node.js + Express.js | API REST y lógica de negocio |
| **ORM** | Prisma 5.7+ | Modelado y acceso a datos |
| **Base de Datos** | SQLite 3.0 | Almacenamiento persistente |
| **Frontend** | HTML5 + Vanilla JS | Interfaz de usuario |
| **Estilos** | CSS3 | Diseño visual responsive |
| **Procesamiento** | xlsx | Importación de archivos Excel |

### Estructura de Directorios

```
indicaciones-app/
├── 📁 prisma/
│   ├── schema.prisma          # ✅ Esquema de base de datos
│   ├── migrations/            # ✅ Historial de migraciones
│   └── indicaciones.db        # ✅ Base de datos SQLite
├── 📁 public/
│   ├── index.html            # ✅ Interfaz web principal
│   ├── cargador.html         # ✅ Cargador de datos
│   └── styles.css            # ✅ Estilos CSS
├── 📁 src/
│   ├── 📁 controllers/
│   │   ├── practicasController.js     # Lógica de prácticas
│   │   ├── gruposController.js        # Lógica de grupos
│   │   └── indicacionesController.js  # Lógica de indicaciones
│   ├── 📁 routes/
│   │   ├── practicas.js      # Rutas de prácticas
│   │   ├── grupos.js         # Rutas de grupos
│   │   └── indicaciones.js   # Rutas de indicaciones
│   ├── 📁 database/
│   │   ├── prisma.js         # Cliente Prisma
│   │   └── seed.js           # Datos de prueba
│   └── server.js             # ✅ Servidor Express
├── 📁 docs/
│   ├── screenshot-home.png
│   ├── screenshot-simulador.png
│   └── screenshot-cargador.png
├── 📁 backups/                # Carpeta para backups (crear)
├── 📄 package.json           # Dependencias del proyecto
├── 📄 install.bat            # Script de instalación Windows
├── 📄 diagnostico.bat        # Script de diagnóstico
├── 📄 backup-db.bat          # Script de backup automático
├── 📄 restore-db.bat         # Script de restauración
└── 📄 README.md              # Este archivo
```

---

## 🚀 Instalación Rápida

### Prerequisitos

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

### Opción 1: Instalación Automática (Windows)

```batch
# Ejecutar el script de instalación automática
install.bat
```

El script realizará:
1. ✅ Verificación de Node.js y npm
2. ✅ Instalación de dependencias
3. ✅ Generación del cliente Prisma
4. ✅ Ejecución de migraciones
5. ✅ Carga de datos de prueba
6. ✅ Inicio del servidor

### Opción 2: Instalación Manual

```bash
# 1. Clonar o navegar a la carpeta del proyecto
cd indicaciones-app

# 2. Instalar dependencias
npm install

# 3. Generar cliente Prisma
npm run db:generate

# 4. Ejecutar migraciones de base de datos
npm run db:migrate

# 5. Cargar datos de prueba (opcional)
npm run db:seed

# 6. Iniciar el servidor
npm run dev
```

### Verificación de Instalación

```bash
# Abrir navegador en:
http://localhost:3000

# O verificar el estado del sistema:
http://localhost:3000/api/health
```

---

## 📊 Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  PRACTICA   │────N────│ PRACTICA_   │────N────│    GRUPO    │
│             │         │   GRUPO     │         │             │
│ id_practica │         │             │         │  id_grupo   │
│ nombre      │         │ id_practica │         │  nombre     │
│ codigo      │         │ id_grupo    │         │  ayuno_horas│
│ activo      │         │ activo      │         │  orina_horas│
└─────────────┘         └─────────────┘         │  orina_tipo │
                                                 └──────┬──────┘
                                                        │
                                                    ┌───▼──────┐
                        ┌─────────────┐         ┌──│  GRUPO_  │
                        │ INDICACION  │────N────│  │INDICACION│
                        │             │         └──│          │
                        │id_indicacion│            │ id_grupo │
                        │descripcion  │            │id_indica │
                        │texto_instruc│            │ orden    │
                        │tipo         │            └──────────┘
                        │area         │
                        │id_indica_inf│◄───┐
                        └─────────────┘    │ (prioridad)
                                           └──┘

                        ┌──────────────────┐
                        │ GRUPOS_          │
                        │ ALTERNATIVOS     │
                        │                  │
                        │ id_grupo_cond_1  │──┐
                        │ id_grupo_cond_2  │  ├─► GRUPO
                        │ id_grupo_result  │──┘
                        └──────────────────┘
```

### Entidades Principales

#### 🧪 PRACTICA

```sql
CREATE TABLE Practica (
  id_practica INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 📁 GRUPO

```sql
CREATE TABLE Grupo (
  id_grupo INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  ayuno_horas INTEGER,
  orina_horas INTEGER,
  orina_tipo TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_alta TIMESTAMP,
  fecha_baja TIMESTAMP,
  fecha_ultima_modificacion TIMESTAMP
);
```

#### 📝 INDICACION

```sql
CREATE TABLE Indicacion (
  id_indicacion INTEGER PRIMARY KEY AUTOINCREMENT,
  descripcion TEXT NOT NULL,
  texto_instruccion TEXT NOT NULL,
  tipo_indicacion TEXT,
  area TEXT,
  estado TEXT DEFAULT 'ACTIVO',
  id_indicacion_inferior INTEGER,
  FOREIGN KEY (id_indicacion_inferior) REFERENCES Indicacion(id_indicacion)
);
```

---

## 🌐 API Endpoints

### Base URL: `http://localhost:3000/api`

### 🧪 Prácticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/practicas` | Listar todas |
| `GET` | `/practicas/:id` | Obtener específica |
| `POST` | `/practicas` | Crear nueva |
| `PUT` | `/practicas/:id` | Actualizar |
| `DELETE` | `/practicas/:id` | Eliminar |

### 📁 Grupos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/grupos` | Listar todos |
| `POST` | `/grupos/generar-indicaciones` | **🎯 Generar indicaciones** |

### 🔧 Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Estado del sistema |
| `GET` | `/debug/count` | Conteo de registros |

---

## 💾 Gestión de Base de Datos

### Comandos Básicos

```bash
# Ver datos en interfaz visual
npm run db:studio

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de prueba
npm run db:seed
```

### 📤 Exportar Base de Datos

#### Método 1: Copiar archivo (Recomendado)

```bash
# Windows
copy "prisma\indicaciones.db" "backups\backup_2025-01-15.db"

# Linux/Mac
cp prisma/indicaciones.db backups/backup_$(date +%Y%m%d).db
```

#### Método 2: Exportar a SQL

```bash
# Exportar todo
sqlite3 prisma/indicaciones.db .dump > backups/database.sql

# Exportar tabla específica
sqlite3 prisma/indicaciones.db "SELECT * FROM Practica;" > backups/practicas.csv
```

### 📥 Restaurar Base de Datos

```bash
# Restaurar desde archivo SQLite
copy "backups\backup_2025-01-15.db" "prisma\indicaciones.db"

# Restaurar desde SQL
sqlite3 prisma/indicaciones.db < backups/database.sql
```

### 📤 Subir Base de Datos a Servidor

#### Opción 1: Usar SCP (Servidor Linux)

```bash
# Subir archivo
scp prisma/indicaciones.db usuario@servidor.com:/ruta/destino/

# Descargar archivo
scp usuario@servidor.com:/ruta/indicaciones.db prisma/
```

#### Opción 2: Usar FTP/SFTP

```bash
# Conectar por SFTP
sftp usuario@servidor.com

# Subir archivo
put prisma/indicaciones.db /ruta/destino/

# Descargar archivo
get /ruta/indicaciones.db prisma/
```

#### Opción 3: Usar Cliente FTP (Filezilla, WinSCP)

1. Conectarse al servidor FTP/SFTP
2. Navegar a la carpeta local: `prisma/`
3. Navegar a la carpeta remota: `/var/www/indicaciones/prisma/`
4. Arrastrar el archivo `indicaciones.db` al servidor
5. Verificar permisos: `chmod 644 indicaciones.db`

#### Opción 4: Exportar a SQL y subir por Git (solo backups pequeños)

```bash
# Exportar a SQL
sqlite3 prisma/indicaciones.db .dump > backups/database.sql

# Agregar a Git
git add backups/database.sql
git commit -m "Backup de base de datos"
git push origin main
```

⚠️ **IMPORTANTE:** No subir bases de datos con información sensible de pacientes a repositorios públicos.

#### Opción 5: Usar servicios en la nube

**Google Drive:**
```bash
# Instalar rclone
# Windows: https://rclone.org/downloads/
# Linux: curl https://rclone.org/install.sh | sudo bash

# Configurar Google Drive
rclone config

# Subir archivo
rclone copy prisma/indicaciones.db gdrive:backups/
```

**Dropbox:**
```bash
# Subir con Dropbox Uploader
./dropbox_uploader.sh upload prisma/indicaciones.db /backups/
```

---

## 📥 Importación de Datos desde Excel

### Estructura del Archivo Excel

El archivo Excel debe tener las siguientes columnas:

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `codigo` | Texto | Código único de la práctica | `69586` |
| `nombre` | Texto | Nombre de la práctica | `ACTH` |
| `area` | Texto | Área del laboratorio | `ENDOCRINO` |
| `ayuno` | Texto | Requisitos de ayuno | `8 HORAS` |
| `orina` | Texto | Tipo de recolección | `PRIMERA ORINA` |
| `indicaciones` | Texto | Instrucciones completas | `Ayuno de 8 horas...` |

### Proceso de Importación

1. **Preparar el archivo Excel:**
   - Asegurarse que tenga los encabezados correctos
   - Verificar que no haya celdas vacías en columnas críticas
   - Guardar como `.xlsx`

2. **Acceder al cargador:**
   ```
   http://localhost:3000/cargador.html
   ```

3. **Seleccionar y cargar:**
   - Clic en "Seleccionar archivo Excel"
   - Elegir el archivo
   - Clic en "Cargar Datos"

4. **Verificar resultados:**
   - El sistema mostrará prácticas procesadas
   - Grupos creados automáticamente
   - Indicaciones generadas

### Script de Importación Manual

Si prefieres importar programáticamente:

```javascript
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importarExcel(rutaArchivo) {
  const workbook = XLSX.readFile(rutaArchivo);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  for (const row of data) {
    await prisma.practica.create({
      data: {
        nombre: row.nombre,
        codigo: row.codigo,
        activo: true
      }
    });
  }
  
  console.log(`✅ Importadas ${data.length} prácticas`);
}

importarExcel('datos.xlsx');
```

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor con auto-reload
npm run dev

# Iniciar en modo producción
npm start

# Ver logs del servidor
npm run dev | tee logs/server.log
```

### Base de Datos

```bash
# Ver datos visualmente
npm run db:studio

# Crear nueva migración
npm run db:migrate

# Resetear DB (⚠️ borra todo)
npm run db:reset

# Cargar datos de ejemplo
npm run db:seed
```

### Mantenimiento

```bash
# Verificar estado del sistema
curl http://localhost:3000/api/health

# Contar registros
curl http://localhost:3000/api/debug/count

# Ver logs de errores
tail -f logs/error.log
```

### Scripts Batch (Windows)

```batch
# Instalación completa
install.bat

# Diagnóstico del sistema
diagnostico.bat

# Backup de base de datos
backup-db.bat

# Restaurar desde backup
restore-db.bat backups\backup_20250115.db
```

---

## 🔧 Solución de Problemas

### Problema: "No se pueden cargar las prácticas"

**Causa:** Base de datos vacía

**Solución:**
```bash
npm run db:seed
```

### Problema: "Puerto 3000 ya en uso"

**Causa:** Otra aplicación usa el puerto

**Solución 1 - Cambiar puerto:**
```bash
# Windows
set PORT=3001 && npm start

# Linux/Mac
PORT=3001 npm start
```

**Solución 2 - Liberar puerto:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problema: "Error de Prisma"

**Causa:** Cliente Prisma desactualizado

**Solución:**
```bash
npm run db:generate
npm run db:migrate
```

### Problema: "Cannot find module 'xyz'"

**Causa:** Dependencias no instaladas

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: Base de datos corrupta

**Causa:** Cierre abrupto del servidor

**Solución:**
```bash
# Restaurar desde backup
copy "backups\ultimo_backup.db" "prisma\indicaciones.db"

# O recrear desde cero
npm run db:reset
npm run db:seed
```

---

## 🤝 Contribuir

### Cómo Contribuir

1. **Fork** el proyecto
2. Crear rama: `git checkout -b feature/nueva-caracteristica`
3. Commit cambios: `git commit -m 'Agregar nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abrir **Pull Request**

### Guías de Desarrollo

- Usar nombres descriptivos para variables
- Comentar código complejo
- Seguir convenciones ES6+
- Escribir mensajes de commit claros
- Probar antes de hacer commit

### Reportar Bugs

Crear un issue con:
- 📝 Descripción clara del problema
- 🔄 Pasos para reproducirlo
- 💻 Información del entorno
- 📸 Capturas de pantalla

---

## 📝 Licencia

Este proyecto está bajo la **Licencia MIT**.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🗺️ Roadmap

### v1.0 (Actual) ✅
- Sistema básico de gestión de prácticas
- Generación de indicaciones optimizadas
- Importación desde Excel
- Interfaz web responsive

### v1.1 (Próximo) 🔄
- Sistema de usuarios y permisos
- Historial de indicaciones generadas
- Exportación de indicaciones a PDF
- API REST completa con autenticación

### v2.0 (Futuro) 📅
- Integración con sistemas hospitalarios
- App móvil (iOS/Android)
- Notificaciones automáticas a pacientes
- Dashboard de estadísticas

---

## 📞 Soporte

¿Necesitas ayuda?

- 🐛 **Issues**: Reportar bugs en GitHub
- 📖 **Documentación**: Ver wiki del proyecto
- 💬 **Discusiones**: Participar en foros

---

<div align="center">

### ⭐ Si este proyecto te resulta útil, considera darle una estrella

**Hecho con ❤️ para la comunidad de laboratorios clínicos**

[⬆️ Volver arriba](#-sistema-de-gestión-de-indicaciones-de-laboratorio)

</div>
