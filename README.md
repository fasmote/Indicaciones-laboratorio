# 🧪 Sistema de Indicaciones de Laboratorio

> **Simulador web inteligente** que genera automáticamente indicaciones consolidadas para pacientes cuando se solicitan múltiples prácticas de laboratorio, resolviendo conflictos y eliminando duplicados.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API](#-api)
- [Base de Datos](#-base-de-datos)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Contribución](#-contribución)
- [Documentación](#-documentación)
- [Licencia](#-licencia)

---

## ✨ Características

### Funcionalidades Principales

- ✅ **Simulador Inteligente**: Genera indicaciones consolidadas a partir de múltiples prácticas seleccionadas
- ✅ **Resolución de Conflictos**: Maneja automáticamente conflictos de ayuno, tipo de orina y preparaciones
- ✅ **Eliminación de Duplicados**: Consolida indicaciones repetidas
- ✅ **Indicadores Visuales**: Badge verde/amarillo muestra qué prácticas tienen indicaciones configuradas (v1.5.0)
- ✅ **ABM Completo**: Alta, Baja, Modificación de Prácticas, Grupos e Indicaciones
- ✅ **Importación desde Excel**: Carga masiva de datos desde archivo XLSX
- ✅ **Interfaz Web Responsiva**: HTML/CSS/JavaScript vanilla, sin frameworks
- ✅ **API REST**: Backend completo con Express.js
- ✅ **Base de Datos Portable**: SQLite (migrable a MySQL/PostgreSQL)

### Características Técnicas

- 🔧 **Node.js + Express**: Backend robusto y escalable
- 🗄️ **Prisma ORM**: Abstracción de base de datos type-safe
- 💾 **SQLite**: Base de datos embebida sin configuración
- 📊 **XLSX**: Importación de datos desde Excel
- 🎨 **Frontend Vanilla**: Sin dependencias de frameworks
- 📝 **Código Educativo**: Comentarios explicativos en todo el código
- 🚀 **Migración Sencilla**: Preparado para migrar a la nube

---

## 🎥 Demo - Backend Funcional ✅

**El backend está completamente funcional y probado!**

### Ejemplo Real de Uso:

```bash
# Iniciar el servidor
npm run dev

# Generar indicaciones para 3 prácticas
curl -X POST http://localhost:3000/api/simulador/generar \
  -H "Content-Type: application/json" \
  -d '{"id_practicas": [1, 2, 3]}'
```

**Resultado real del sistema:**

```json
{
  "success": true,
  "data": {
    "indicaciones_consolidadas": "Indicaciones para los estudios solicitados:\n\n1. Concurrir al Laboratorio con 8 horas de ayuno\n\n2. Concurrir entre las 7:00 y las 9:00 hs\n\n3. Traer orden médica actualizada\n\n4. Concurrir con documento de identidad\n\n📋 RESUMEN:\n⏰ Ayuno requerido: 8 horas\n",
    "ayuno_horas": 8,
    "detalles": {
      "cantidad_practicas": 3,
      "cantidad_indicaciones": 4
    }
  }
}
```

**Tests realizados:** 10/10 ✅ (ver `docs/TESTING_Y_ESTADO_ACTUAL.md`)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Simulador    │  │ ABM Prácticas│  │ ABM Grupos   │      │
│  │ (index.html) │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │ Fetch API / REST                │
└───────────────────────────┼─────────────────────────────────┘
                            │
════════════════════════════▼═════════════════════════════════
                            │
┌───────────────────────────┼─────────────────────────────────┐
│              SERVIDOR (Node.js + Express)                   │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────┐     │
│  │         Rutas (routes/)                           │     │
│  │  /api/practicas  /api/grupos  /api/simulador      │     │
│  └─────┬──────────────────┬──────────────────┬───────┘     │
│        │                  │                  │             │
│  ┌─────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐       │
│  │Controllers │   │ Controllers │   │ Controllers │       │
│  └─────┬──────┘   └──────┬──────┘   └──────┬──────┘       │
│        │                  │                  │             │
│  ┌─────▼──────────────────▼──────────────────▼───────┐     │
│  │        Services (Lógica de Negocio)              │     │
│  │  - indicacionesService.js (Algoritmo)             │     │
│  │  - importService.js                               │     │
│  └────────────────────────┬──────────────────────────┘     │
│                           │                                │
│  ┌────────────────────────▼──────────────────────────┐     │
│  │           Prisma ORM (Acceso a Datos)            │     │
│  └────────────────────────┬──────────────────────────┘     │
└───────────────────────────┼─────────────────────────────────┘
                            │
════════════════════════════▼═════════════════════════════════
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                  BASE DE DATOS (SQLite)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   AREA   │  │ PRACTICA │  │  GRUPO   │  │INDICACION│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       │      ┌──────▼──────┐  ┌───▼─────┐  ┌───▼──────┐   │
│       │      │PRACTICA_    │  │ GRUPO_  │  │  REGLA_  │   │
│       │      │  GRUPO      │  │INDICACION│  │ALTERNATIVA│  │
│       │      └─────────────┘  └─────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Requisitos Previos

- **Node.js**: v18.0.0 o superior ([Descargar](https://nodejs.org/))
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **Git**: Para control de versiones ([Descargar](https://git-scm.com/))

Verificar instalación:

```bash
node --version    # Debe ser >= v18.0.0
npm --version     # Debe ser >= v9.0.0
git --version     # Cualquier versión reciente
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/indicaciones-app2.git
cd indicaciones-app2
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- **express**: Framework web
- **@prisma/client**: Cliente de base de datos
- **cors**: Cross-Origin Resource Sharing
- **xlsx**: Lectura de archivos Excel
- **nodemon**: Auto-reload en desarrollo (dev)
- **prisma**: CLI de Prisma (dev)

### 3. Configurar Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones (crear tablas)
npm run db:migrate

# (Opcional) Cargar datos de ejemplo
npm run db:seed
```

### 4. Configurar Variables de Entorno

Copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

Editar `.env` si es necesario (por defecto funciona sin cambios).

### 5. Iniciar el Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## ⚙️ Configuración

### Variables de Entorno

Archivo `.env`:

```env
# Puerto del servidor
PORT=3000

# Base de datos (SQLite)
DATABASE_URL="file:./prisma/indicaciones.db"

# Entorno
NODE_ENV=development

# CORS (separados por comas)
CORS_ORIGIN=http://localhost:3000
```

### Scripts NPM

| Comando | Descripción |
|---------|-------------|
| `npm start` | Iniciar servidor en producción |
| `npm run dev` | Iniciar servidor en desarrollo (auto-reload) |
| `npm run db:generate` | Generar cliente de Prisma |
| `npm run db:migrate` | Ejecutar migraciones de BD |
| `npm run db:studio` | Abrir interfaz visual de Prisma Studio |
| `npm run db:seed` | Cargar datos de ejemplo |
| `npm run db:reset` | Resetear base de datos (¡CUIDADO!) |
| `npm run import` | Importar datos desde Excel |
| `npm test` | Ejecutar tests (pendiente) |

---

## 💻 Uso

### Simulador Web

1. Abrir navegador en: **http://localhost:3000**
2. Seleccionar prácticas de laboratorio del desplegable
3. Las prácticas seleccionadas aparecerán en la lista
4. Hacer clic en **"Generar Indicaciones"**
5. Ver resultados consolidados
6. Copiar al portapapeles o imprimir

### ABM de Prácticas

- URL: **http://localhost:3000/practicas.html**
- Permite agregar, editar y eliminar prácticas de laboratorio

### ABM de Grupos

- URL: **http://localhost:3000/grupos.html**
- Gestiona grupos de indicaciones

### ABM de Indicaciones

- URL: **http://localhost:3000/indicaciones.html**
- Administra indicaciones individuales

### Importar Datos desde Excel

```bash
# Colocar el archivo Excel en la raíz del proyecto
# Ejecutar script de importación
npm run import
```

---

## 📁 Estructura del Proyecto

```
indicaciones-app2/
│
├── prisma/                     # Configuración de Prisma
│   ├── schema.prisma           # ⭐ Definición del modelo de datos
│   ├── indicaciones.db         # Base de datos SQLite
│   └── migrations/             # Historial de migraciones
│
├── src/                        # Código fuente del backend
│   ├── config/                 # Configuración
│   │   ├── database.js         # Cliente de Prisma
│   │   └── constants.js        # Constantes del sistema
│   │
│   ├── controllers/            # Controladores (lógica de endpoints)
│   │   ├── practicasController.js
│   │   ├── gruposController.js
│   │   ├── indicacionesController.js
│   │   └── simuladorController.js
│   │
│   ├── routes/                 # Definición de rutas
│   │   ├── practicas.js
│   │   ├── grupos.js
│   │   ├── indicaciones.js
│   │   └── simulador.js
│   │
│   ├── services/               # Lógica de negocio
│   │   ├── indicacionesService.js  # ⭐ Algoritmo principal
│   │   ├── importService.js        # Importación desde Excel
│   │   └── validationService.js    # Validaciones
│   │
│   ├── middleware/             # Middlewares
│   │   ├── errorHandler.js     # Manejo de errores
│   │   └── logger.js           # Logging
│   │
│   ├── utils/                  # Utilidades
│   │   └── helpers.js
│   │
│   └── server.js               # ⭐ Punto de entrada del servidor
│
├── public/                     # Archivos estáticos (Frontend)
│   ├── index.html              # ⭐ Simulador principal
│   ├── practicas.html          # ABM de prácticas
│   ├── grupos.html             # ABM de grupos
│   ├── indicaciones.html       # ABM de indicaciones
│   │
│   ├── css/                    # Estilos
│   │   ├── styles.css
│   │   ├── simulador.css
│   │   └── abm.css
│   │
│   ├── js/                     # JavaScript del frontend
│   │   ├── simulador.js        # ⭐ Lógica del simulador
│   │   ├── practicas.js
│   │   ├── grupos.js
│   │   ├── indicaciones.js
│   │   ├── api.js              # Cliente HTTP (Fetch)
│   │   └── utils.js
│   │
│   └── assets/                 # Recursos (imágenes, iconos)
│       ├── logo.png
│       └── favicon.ico
│
├── scripts/                    # Scripts auxiliares
│   ├── importar-excel.js       # ⭐ Importar desde Excel
│   ├── seed.js                 # Datos de ejemplo
│   └── backup.js               # Backup de BD
│
├── docs/                       # Documentación
│   ├── ANALISIS_MODELO_DATOS.md
│   ├── DER_DIAGRAMA.md
│   ├── MER_MODELO.md
│   ├── ARQUITECTURA_PROPUESTA.md
│   ├── GUIA_USUARIO.md
│   ├── GUIA_DESARROLLO.md
│   └── GUIA_MIGRACION_NUBE.md
│
├── tests/                      # Tests (pendiente)
│   └── api.test.js
│
├── .gitignore                  # Archivos ignorados por Git
├── .env.example                # Variables de entorno (ejemplo)
├── package.json                # Dependencias del proyecto
├── README.md                   # ⭐ Este archivo
├── CHANGELOG.md                # Historial de cambios
└── LICENSE                     # Licencia MIT
```

---

## 🌐 API

### Base URL

```
http://localhost:3000/api
```

### Endpoints Principales

#### **Prácticas**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/practicas` | Listar todas las prácticas |
| `GET` | `/practicas/:id` | Obtener una práctica específica |
| `GET` | `/practicas?area=VIROLOGIA` | Filtrar por área |
| `POST` | `/practicas` | Crear nueva práctica |
| `PUT` | `/practicas/:id` | Actualizar práctica |
| `DELETE` | `/practicas/:id` | Eliminar práctica (lógicamente) |

**Ejemplo de uso:**

```javascript
// GET /api/practicas
fetch('http://localhost:3000/api/practicas')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### **Simulador** (Endpoint Principal)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/simulador/generar` | Generar indicaciones consolidadas |

**Request Body:**

```json
{
  "id_practicas": [69758, 69455, 70220]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "indicaciones_consolidadas": "Indicaciones para los estudios...",
    "ayuno_horas": 8,
    "tipo_orina": "PRIMERA_ORINA",
    "detalles": {
      "grupos_aplicados": [...],
      "indicaciones": [...]
    }
  }
}
```

---

## 🗄️ Base de Datos

### Modelo de Datos

El sistema utiliza **7 tablas principales**:

1. **AREA**: Áreas del laboratorio (Virología, Química, etc.)
2. **PRACTICA**: Catálogo de prácticas de laboratorio (852 prácticas)
3. **GRUPO**: Grupos de indicaciones semánticamente iguales (62 grupos)
4. **INDICACION**: Indicaciones atómicas reutilizables
5. **PRACTICA_GRUPO**: Relación M:N entre Prácticas y Grupos
6. **GRUPO_INDICACION**: Relación M:N entre Grupos e Indicaciones
7. **REGLA_ALTERNATIVA**: Reglas especiales cuando se combinan prácticas

### Diagrama ER

Ver: [docs/DER_DIAGRAMA.md](docs/DER_DIAGRAMA.md)

### Migración a Otros Motores

El proyecto usa **Prisma ORM**, lo que permite migrar fácilmente a:

- **MySQL** (para Hostinger o cualquier hosting)
- **PostgreSQL** (más robusto)
- **Firebase Firestore** (NoSQL en la nube)

Ver: [docs/GUIA_MIGRACION_NUBE.md](docs/GUIA_MIGRACION_NUBE.md)

---

## 👨‍💻 Desarrollo

### Agregar un Nuevo Endpoint

Ver la guía completa en: [docs/GUIA_DESARROLLO.md](docs/GUIA_DESARROLLO.md)

**Resumen:**

1. Crear ruta en `src/routes/`
2. Crear controlador en `src/controllers/`
3. (Opcional) Crear servicio en `src/services/`
4. Registrar ruta en `src/server.js`

### Modificar el Schema de la Base de Datos

```bash
# 1. Editar prisma/schema.prisma
# 2. Generar migración
npx prisma migrate dev --name nombre_descriptivo

# 3. Regenerar cliente
npm run db:generate
```

### Prisma Studio (Interfaz Visual)

```bash
npm run db:studio
```

Abre en **http://localhost:5555** una interfaz visual para ver/editar datos.

---

## 🧪 Testing

**Pendiente de implementación**

Se planea usar:
- **Jest**: Framework de testing
- **Supertest**: Para testear API REST

```bash
npm test
```

---

## 🚀 Despliegue

### Opción 1: Hostinger (Hosting Compartido)

1. Cambiar `schema.prisma` a MySQL
2. Subir código por FTP
3. Configurar variables de entorno
4. Importar base de datos

**Costo:** $2-5/mes

### Opción 2: Vercel + PlanetScale (Gratis)

1. Conectar repositorio de GitHub a Vercel
2. Crear base de datos en PlanetScale
3. Configurar variables de entorno en Vercel
4. Deploy automático

**Costo:** Gratis para prototipos

### Opción 3: Railway / Render

1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático

**Costo:** $5-10/mes

Ver guía completa: [docs/GUIA_MIGRACION_NUBE.md](docs/GUIA_MIGRACION_NUBE.md)

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir un Pull Request

### Guía de Estilo

- Usar **comentarios educativos** en el código
- Seguir la convención de nombres existente
- Escribir código limpio y legible
- Documentar nuevas funcionalidades

---

## 📚 Documentación

La documentación completa del proyecto se encuentra en la carpeta `docs/`:

- **[ANALISIS_MODELO_DATOS.md](docs/ANALISIS_MODELO_DATOS.md)**: Análisis del Excel original
- **[DER_DIAGRAMA.md](docs/DER_DIAGRAMA.md)**: Diagrama Entidad-Relación
- **[MER_MODELO.md](docs/MER_MODELO.md)**: Modelo Entidad-Relación detallado
- **[ARQUITECTURA_PROPUESTA.md](docs/ARQUITECTURA_PROPUESTA.md)**: Arquitectura del sistema
- **[GUIA_USUARIO.md](docs/GUIA_USUARIO.md)**: Cómo usar el sistema
- **[GUIA_DESARROLLO.md](docs/GUIA_DESARROLLO.md)**: Cómo desarrollar/extender el código
- **[GUIA_MIGRACION_NUBE.md](docs/GUIA_MIGRACION_NUBE.md)**: Migración a la nube

---

## 📊 Estadísticas del Proyecto

- **Prácticas de laboratorio**: 852
- **Grupos de indicaciones**: 62
- **Áreas de laboratorio**: 10
- **Líneas de código**: ~5000 (backend + frontend)
- **Endpoints de API**: 15+

---

## 🔮 Roadmap

- [x] Análisis del modelo de datos
- [x] Diseño de arquitectura
- [x] Configuración inicial del proyecto
- [ ] Implementación de la base de datos (Etapa 3)
- [ ] Desarrollo del backend - API REST (Etapa 4)
- [ ] Importación de datos desde Excel (Etapa 5)
- [ ] Desarrollo del frontend (Etapa 6)
- [ ] Testing e integración (Etapa 7)
- [ ] Documentación completa (Etapa 8)
- [ ] Despliegue en producción (Etapa 9)

---

## 🙏 Agradecimientos

- **Fuente de datos**: Red de Laboratorios - Tabla de indicaciones actualizada 2024
- **Desarrollado con**: Node.js, Express, Prisma, SQLite
- **Asistencia**: Claude Code (Anthropic)

---

## 📝 Licencia

Este proyecto está bajo la Licencia **MIT**.

Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📧 Contacto

**Proyecto**: Sistema de Indicaciones de Laboratorio
**Repositorio**: [https://github.com/tu-usuario/indicaciones-app2](https://github.com/tu-usuario/indicaciones-app2)
**Versión**: 1.0.0
**Fecha**: Octubre 2025

---

## 🌟 ¿Te gustó el proyecto?

Si este proyecto te resultó útil, considera darle una ⭐ en GitHub!

---

**Generado con ❤️ por Claude Code**
**Fecha de creación**: 07/10/2025
