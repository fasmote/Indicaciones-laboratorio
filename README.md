# Sistema de Indicaciones de Laboratorio

> Sistema web inteligente para generar indicaciones consolidadas de prácticas de laboratorio, resolviendo conflictos y eliminando duplicados automáticamente.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-orange.svg)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://www.sqlite.org/)
[![Versión](https://img.shields.io/badge/Versión-1.6.0-brightgreen.svg)](CHANGELOG.md)

---

## Tabla de Contenidos

1. [Descripción](#descripción)
2. [Características](#características)
3. [Arquitectura](#arquitectura)
4. [Base de Datos](#base-de-datos)
5. [Instalación](#instalación)
6. [Uso](#uso)
7. [API REST](#api-rest)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Estadísticas](#estadísticas)
10. [Documentación](#documentación)
11. [Roadmap](#roadmap)

---

## Descripción

El **Sistema de Indicaciones de Laboratorio** es una aplicación web que permite a laboratorios clínicos generar automáticamente indicaciones consolidadas para pacientes cuando se solicitan múltiples prácticas de laboratorio simultáneamente.

### Problema que Resuelve

Cuando un paciente debe realizarse varias prácticas de laboratorio, cada una puede tener requisitos diferentes (ayuno, tipo de orina, horarios, etc.). Este sistema:

- ✅ Consolida todas las indicaciones en un solo texto
- ✅ Resuelve conflictos automáticamente (ej: ayuno de 8hs prevalece sobre 4hs)
- ✅ Elimina indicaciones duplicadas
- ✅ Valida compatibilidad de requisitos (ej: tipos de orina incompatibles)
- ✅ Genera un documento listo para entregar al paciente

### Ejemplo de Uso

**Entrada:**
- Práctica 1: GLUCEMIA (requiere 8hs de ayuno)
- Práctica 2: COLESTEROL (requiere 12hs de ayuno)
- Práctica 3: HEMOGRAMA (requiere 8hs de ayuno)

**Salida Consolidada:**
```
Indicaciones para los estudios solicitados:

1. Concurrir al Laboratorio con 12 horas de ayuno
2. Concurrir entre las 7:00 y las 9:00 hs
3. Traer orden médica actualizada
4. Concurrir con documento de identidad

RESUMEN:
⏰ Ayuno requerido: 12 horas
```

---

## Características

### Funcionalidades Principales

- **Simulador Inteligente**: Genera indicaciones consolidadas a partir de múltiples prácticas
- **Resolución de Conflictos**: Maneja automáticamente conflictos de ayuno y tipo de orina
- **Eliminación de Duplicados**: Consolida indicaciones repetidas
- **Búsqueda en Tiempo Real**: Filtrado instantáneo de prácticas
- **Indicadores Visuales**: Badges que muestran si una práctica tiene indicaciones configuradas
- **Interfaz Responsive**: Funciona en desktop, tablet y móvil
- **Importación Masiva**: Carga datos desde archivos Excel

### Características Técnicas

- **Backend**: Node.js + Express.js
- **ORM**: Prisma (type-safe)
- **Base de Datos**: SQLite (portable, migrable a MySQL/PostgreSQL)
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla (sin frameworks)
- **API REST**: 15+ endpoints completamente documentados
- **Arquitectura**: MVC + Service Layer
- **Código Educativo**: Comentarios explicativos en todo el código

---

## Arquitectura

### Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│           FRONTEND (HTML/CSS/JS)            │
│  - Búsqueda en tiempo real                 │
│  - Selección múltiple de prácticas         │
│  - Generación de indicaciones              │
└─────────────────┬───────────────────────────┘
                  │ HTTP/JSON
                  ▼
┌─────────────────────────────────────────────┐
│         BACKEND (Node.js + Express)         │
│  ┌─────────────────────────────────────┐   │
│  │         Controllers (MVC)            │   │
│  └───────────────┬─────────────────────┘   │
│                  │                          │
│  ┌───────────────▼─────────────────────┐   │
│  │      Service Layer (Business)       │   │
│  │  - Consolidación de indicaciones    │   │
│  │  - Resolución de conflictos         │   │
│  │  - Eliminación de duplicados        │   │
│  └───────────────┬─────────────────────┘   │
│                  │                          │
│  ┌───────────────▼─────────────────────┐   │
│  │        Prisma ORM (Data)            │   │
│  └───────────────┬─────────────────────┘   │
└──────────────────┼───────────────────────┬─┘
                   │                       │
                   ▼                       │
┌─────────────────────────────────┐        │
│    SQLite Database (Portable)   │◄───────┘
│  - 7 tablas                     │
│  - 847 prácticas                │
│  - 666 grupos                   │
│  - 140 indicaciones             │
└─────────────────────────────────┘
```

### Patrón de Diseño

- **MVC (Model-View-Controller)**: Separación de responsabilidades
- **Service Layer**: Lógica de negocio separada de controladores
- **Repository Pattern**: Acceso a datos mediante Prisma ORM
- **Singleton**: Cliente de Prisma único en toda la aplicación

---

## Base de Datos

### Modelo Entidad-Relación (MER)

El sistema está diseñado con **7 tablas principales** que manejan relaciones M:N (muchos a muchos):

```
┌─────────┐       ┌──────────────────┐       ┌─────────┐
│  AREA   │       │ PRACTICA_GRUPO   │       │  GRUPO  │
│         │       │ (Relación M:N)   │       │         │
│ id_area │◄──┐   │                  │   ┌──►│id_grupo │
│ nombre  │   │   │ id_practica      │   │   │ nombre  │
└─────────┘   │   │ id_grupo         │   │   │ ayuno   │
              │   │ activo           │   │   │ orina   │
              │   └──────┬───────┬───┘   │   └────┬────┘
┌─────────────┴──┐       │       │       │        │
│   PRACTICA     │◄──────┘       └───────┤        │
│                │                        │        │
│ id_practica    │                        │        │
│ codigo_did     │                        │        │
│ nombre         │                        │        │
│ id_area   ────►│                        │        │
│ activo         │                        │        │
└────────────────┘                        │        │
                                          │        │
                           ┌──────────────┼────────┼─────────────┐
                           │              │        │             │
                           │   GRUPO_INDICACION    │             │
                           │   (Relación M:N)      │             │
                           │                       │             │
                           │   id_grupo       ─────┘             │
                           │   id_indicacion  ───────────────┐   │
                           │   orden                         │   │
                           │   activo                        │   │
                           └─────────────────────────────────┼───┘
                                                             │
                                                ┌────────────▼───────┐
                                                │   INDICACION       │
                                                │                    │
                                                │ id_indicacion      │
                                                │ texto              │
                                                │ tipo               │
                                                │ orden              │
                                                │ activo             │
                                                └────────────────────┘

┌──────────────────────┐
│ REGLA_ALTERNATIVA    │  (Casos especiales)
│                      │
│ id_regla             │
│ id_practica_1        │
│ id_practica_2        │
│ id_grupo_resultado   │
│ descripcion          │
└──────────────────────┘
```

### Descripción de Tablas

#### 1. **AREA** (10 registros)
Áreas del laboratorio

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_area` | INTEGER | PK, autoincremental |
| `nombre` | TEXT | Nombre del área (ej: VIROLOGIA, QUIMICA) |
| `descripcion` | TEXT | Descripción detallada |
| `activo` | BOOLEAN | Eliminación lógica |
| `fechaCreacion` | DATETIME | Timestamp de creación |
| `fechaModificacion` | DATETIME | Timestamp de última modificación |

**Áreas configuradas:**
- VIROLOGIA
- QUIMICA
- BACTERIO
- ENDOCRINO
- PARASITO
- HEMATO/HEMOSTASIA
- INMUNOLOGIA
- URGENCIAS Y LIQUIDOS
- GENETICA
- MICO

#### 2. **PRACTICA** (847 registros)
Catálogo completo de prácticas de laboratorio

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_practica` | INTEGER | PK, autoincremental |
| `codigo_did` | TEXT | Código SNOMED único |
| `nombre` | TEXT | Nombre de la práctica |
| `id_area` | INTEGER | FK a AREA |
| `activo` | BOOLEAN | Eliminación lógica |
| `fechaCreacion` | DATETIME | Timestamp de creación |
| `fechaModificacion` | DATETIME | Timestamp de última modificación |

**Ejemplos:**
- HEMOGRAMA (código: 26774071000999116)
- GLUCEMIA (código: 26759121000999110)
- ESTUDIO PARASITOLÓGICO SERIADO DE MATERIA FECAL (código: 31035171000999117)

#### 3. **GRUPO** (666 registros)
Grupos de indicaciones semánticamente iguales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_grupo` | INTEGER | PK, autoincremental |
| `nombre` | TEXT | Nombre del grupo |
| `descripcion` | TEXT | Descripción o texto completo |
| `horas_ayuno` | INTEGER | Horas de ayuno requeridas (3, 4, 8, 12) |
| `tipo_orina` | TEXT | PRIMERA_ORINA, ORINA_12H, ORINA_24H, ORINA_2H |
| `horas_orina` | INTEGER | Horas de recolección de orina (-1, 2, 12, 24) |
| `activo` | BOOLEAN | Eliminación lógica |
| `fechaCreacion` | DATETIME | Timestamp de creación |
| `fechaModificacion` | DATETIME | Timestamp de última modificación |

**Distribución:**
- 57 grupos desde indicaciones textuales
- 609 grupos desde atributos de ayuno/orina

#### 4. **INDICACION** (140 registros)
Indicaciones atómicas reutilizables

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_indicacion` | INTEGER | PK, autoincremental |
| `texto` | TEXT | Texto de la indicación |
| `tipo` | TEXT | AYUNO, ORINA, GENERAL, HORARIO, MEDICACION |
| `orden` | INTEGER | Orden de presentación |
| `id_indicacion_prioridad` | INTEGER | FK a INDICACION (para resolver conflictos) |
| `activo` | BOOLEAN | Eliminación lógica |
| `fechaCreacion` | DATETIME | Timestamp de creación |
| `fechaModificacion` | DATETIME | Timestamp de última modificación |

**Tipos de indicaciones:**
- **AYUNO** (ej: "Concurrir al Laboratorio con 8 hs de ayuno")
- **ORINA** (ej: "Recolectar orina de 24 horas")
- **GENERAL** (ej: "Traer orden médica actualizada")
- **HORARIO** (ej: "Concurrir entre las 7:00 y las 9:00 hs")
- **MEDICACION** (ej: "No suspender medicación habitual")

#### 5. **PRACTICA_GRUPO** (821 registros)
Relación M:N entre Prácticas y Grupos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_practica` | INTEGER | FK a PRACTICA |
| `id_grupo` | INTEGER | FK a GRUPO |
| `activo` | BOOLEAN | Eliminación lógica |
| `fechaCreacion` | DATETIME | Timestamp de creación |

**Clave primaria compuesta:** (`id_practica`, `id_grupo`)

**Cobertura:** 821 de 847 prácticas tienen grupos asignados (**96.9%**)

#### 6. **GRUPO_INDICACION** (767 registros)
Relación M:N entre Grupos e Indicaciones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_grupo` | INTEGER | FK a GRUPO |
| `id_indicacion` | INTEGER | FK a INDICACION |
| `orden` | INTEGER | Orden de presentación dentro del grupo |
| `activo` | BOOLEAN | Eliminación lógica |
| `fechaCreacion` | DATETIME | Timestamp de creación |

**Clave primaria compuesta:** (`id_grupo`, `id_indicacion`)

#### 7. **REGLA_ALTERNATIVA** (0 registros actualmente)
Reglas especiales para combinaciones de prácticas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_regla` | INTEGER | PK, autoincremental |
| `id_practica_1` | INTEGER | FK a PRACTICA |
| `id_practica_2` | INTEGER | FK a PRACTICA |
| `id_grupo_resultado` | INTEGER | FK a GRUPO |
| `descripcion` | TEXT | Descripción de la regla |
| `activo` | BOOLEAN | Eliminación lógica |

**Ejemplo de uso futuro:**
- Si se solicitan UROCULTIVO + ORINA 24H juntos → aplicar grupo especial

### Diagrama Entidad-Relación (DER)

Ver diagrama detallado en: [`docs/DER_DIAGRAMA.md`](docs/DER_DIAGRAMA.md)

---

## Instalación

### Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** (opcional)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/indicaciones-app2.git
cd indicaciones-app2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Generar cliente de Prisma
npm run db:generate

# 5. Ejecutar migraciones (crea la base de datos)
npm run db:migrate

# 6. (Opcional) Cargar datos de ejemplo
npm run db:seed

# 7. Importar datos reales desde Excel
npm run import
```

### Configuración de Variables de Entorno

Editar `.env`:

```env
# Base de datos
DATABASE_URL="file:./prisma/indicaciones.db"

# Servidor
PORT=3000
NODE_ENV=development

# CORS (opcional)
CORS_ORIGIN="*"
```

---

## Uso

### Iniciar el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

### Interfaz Web

1. Abrir navegador en `http://localhost:3000`
2. Buscar prácticas en el campo de búsqueda
3. Filtrar por área (opcional)
4. Seleccionar las prácticas requeridas
5. Click en "Generar Indicaciones"
6. Copiar o imprimir el resultado

### Prisma Studio (Interfaz Visual de BD)

```bash
npm run db:studio
```

Abre interfaz visual en `http://localhost:5555` para:
- Ver y editar datos
- Ejecutar queries
- Explorar relaciones

---

## API REST

### Endpoints Principales

#### Prácticas

```
GET    /api/practicas              # Listar con filtros y paginación
GET    /api/practicas/:id          # Obtener una práctica con detalles
POST   /api/practicas              # Crear nueva práctica
PUT    /api/practicas/:id          # Actualizar práctica
DELETE /api/practicas/:id          # Eliminar (lógicamente)
```

#### Grupos

```
GET    /api/grupos                 # Listar todos los grupos
GET    /api/grupos/:id             # Obtener grupo con indicaciones
POST   /api/grupos                 # Crear nuevo grupo
PUT    /api/grupos/:id             # Actualizar grupo
DELETE /api/grupos/:id             # Eliminar (lógicamente)
```

#### Indicaciones

```
GET    /api/indicaciones           # Listar todas las indicaciones
GET    /api/indicaciones/:id       # Obtener una indicación
POST   /api/indicaciones           # Crear nueva indicación
PUT    /api/indicaciones/:id       # Actualizar indicación
DELETE /api/indicaciones/:id       # Eliminar (lógicamente)
```

#### Simulador (⭐ Endpoint Principal)

```
POST   /api/simulador/generar      # Generar indicaciones consolidadas
```

**Ejemplo de Request:**
```json
{
  "practicas_ids": [103, 104, 105]
}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "indicaciones_consolidadas": "Indicaciones para los estudios solicitados:\n\n1. Concurrir al Laboratorio con 8 horas de ayuno\n2. Concurrir entre las 7:00 y las 9:00 hs\n\n📋 RESUMEN:\n⏰ Ayuno requerido: 8 horas",
    "ayuno_horas": 8,
    "tipo_orina": null,
    "detalles": {
      "cantidad_practicas": 3,
      "cantidad_grupos": 2,
      "cantidad_indicaciones": 4,
      "indicaciones": [...]
    }
  }
}
```

### Documentación Completa de API

Ver: [`docs/API.md`](docs/API.md) *(pendiente)*

---

## Estructura del Proyecto

```
indicaciones-app2/
├── prisma/
│   ├── migrations/           # Migraciones de base de datos
│   ├── schema.prisma         # Schema de Prisma (modelo de datos)
│   └── indicaciones.db       # Base de datos SQLite
│
├── src/
│   ├── config/               # Configuración
│   │   ├── database.js       # Cliente de Prisma (Singleton)
│   │   └── constants.js      # Constantes del sistema
│   │
│   ├── controllers/          # Controladores (MVC)
│   │   ├── practicasController.js
│   │   ├── gruposController.js
│   │   ├── indicacionesController.js
│   │   └── simuladorController.js
│   │
│   ├── routes/               # Rutas de Express
│   │   ├── practicas.js
│   │   ├── grupos.js
│   │   ├── indicaciones.js
│   │   └── simulador.js
│   │
│   ├── services/             # Lógica de negocio
│   │   └── indicacionesService.js  # ⭐ Algoritmo de consolidación
│   │
│   ├── middleware/           # Middlewares de Express
│   │   ├── logger.js         # Logging de requests
│   │   └── errorHandler.js   # Manejo de errores global
│   │
│   └── server.js             # Servidor Express principal
│
├── public/                   # Frontend (archivos estáticos)
│   ├── index.html            # Página principal
│   ├── css/
│   │   └── styles.css        # Estilos CSS
│   └── js/
│       ├── api.js            # Cliente HTTP (fetch)
│       ├── utils.js          # Utilidades (toast, copy, etc.)
│       └── tabs.js           # Lógica del simulador
│
├── scripts/                  # Scripts auxiliares
│   ├── seed.js               # Datos de ejemplo
│   ├── reimportar-completo.js  # ⭐ Importación desde Excel
│   ├── verificar-hemograma.js
│   └── buscar-todas-parasito.js
│
├── docs/                     # Documentación técnica
│   ├── ANALISIS_MODELO_DATOS.md
│   ├── DER_DIAGRAMA.md
│   ├── MER_MODELO.md
│   ├── ARQUITECTURA_PROPUESTA.md
│   ├── GUIA_USUARIO.md
│   ├── GUIA_DESARROLLO.md
│   └── GUIA_MIGRACION_NUBE.md
│
├── .env                      # Variables de entorno (git ignored)
├── .env.example              # Plantilla de variables
├── .gitignore                # Archivos ignorados por Git
├── package.json              # Dependencias y scripts npm
├── README.md                 # Este archivo
└── CHANGELOG.md              # Historial de cambios
```

---

## Estadísticas

### Base de Datos (v1.6.0)

| Entidad | Cantidad | Descripción |
|---------|----------|-------------|
| **Áreas** | 10 | Áreas del laboratorio |
| **Prácticas** | 847 | Catálogo completo de prácticas |
| **Grupos** | 666 | Grupos de indicaciones |
| **Indicaciones** | 140 | Indicaciones atómicas reutilizables |
| **Relaciones Práctica-Grupo** | 821 | Prácticas con grupos asignados |
| **Relaciones Grupo-Indicación** | 767 | Grupos con indicaciones |
| **Cobertura de Datos** | **96.9%** | Prácticas con indicaciones (821/847) |

### Desglose de Indicaciones por Tipo

| Tipo | Cantidad | Porcentaje |
|------|----------|------------|
| AYUNO | 23 | 16.4% |
| ORINA | 12 | 8.6% |
| GENERAL | 78 | 55.7% |
| HORARIO | 18 | 12.9% |
| MEDICACION | 9 | 6.4% |

### Desglose de Ayunos

| Horas | Cantidad de Grupos | Porcentaje |
|-------|-------------------|------------|
| 3 horas | 45 | 6.8% |
| 4 horas | 78 | 11.7% |
| 8 horas | 412 | 61.9% |
| 12 horas | 89 | 13.4% |
| Sin ayuno | 42 | 6.3% |

### Código Fuente

- **Líneas de código**: ~6,000
- **Archivos TypeScript/JavaScript**: 25+
- **Endpoints de API**: 15+
- **Tiempo de desarrollo**: ~40 horas

---

## Documentación

### Documentos Técnicos Disponibles

- **[ANALISIS_MODELO_DATOS.md](docs/ANALISIS_MODELO_DATOS.md)**: Análisis del Excel original
- **[DER_DIAGRAMA.md](docs/DER_DIAGRAMA.md)**: Diagrama Entidad-Relación detallado
- **[MER_MODELO.md](docs/MER_MODELO.md)**: Modelo Entidad-Relación completo
- **[ARQUITECTURA_PROPUESTA.md](docs/ARQUITECTURA_PROPUESTA.md)**: Arquitectura del sistema
- **[GUIA_USUARIO.md](docs/GUIA_USUARIO.md)**: Manual de usuario
- **[GUIA_DESARROLLO.md](docs/GUIA_DESARROLLO.md)**: Guía para desarrolladores
- **[GUIA_MIGRACION_NUBE.md](docs/GUIA_MIGRACION_NUBE.md)**: Deploy en la nube
- **[CHANGELOG.md](CHANGELOG.md)**: Historial detallado de cambios

---

## Roadmap

### Versión Actual: 1.6.0 ✅

- [x] Análisis del modelo de datos
- [x] Diseño de arquitectura
- [x] Configuración inicial del proyecto
- [x] Implementación de la base de datos
- [x] Desarrollo del backend - API REST
- [x] Importación de datos desde Excel
- [x] Desarrollo del frontend completo
- [x] Reimportación con atributos de ayuno/orina
- [x] Avisos visuales para prácticas sin datos

### Próximas Versiones

#### v1.7.0 - Interfaz de Gestión
- [ ] ABM completo de Prácticas
- [ ] ABM completo de Grupos
- [ ] ABM completo de Indicaciones
- [ ] Edición visual de relaciones

#### v1.8.0 - Testing
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración
- [ ] Tests end-to-end (Playwright)
- [ ] Cobertura de código > 80%

#### v2.0.0 - Features Avanzadas
- [ ] Sistema de autenticación de usuarios
- [ ] Roles y permisos (admin, usuario)
- [ ] Historial de consultas
- [ ] Exportar indicaciones a PDF
- [ ] Envío de indicaciones por email
- [ ] Modo oscuro
- [ ] Multiidioma (inglés, portugués)

---

## Tecnologías Utilizadas

### Backend

- **Node.js** v18+ - Runtime de JavaScript
- **Express.js** v4.18 - Framework web
- **Prisma** v5.7 - ORM type-safe
- **SQLite** - Base de datos embebida
- **XLSX** v0.18 - Lectura de archivos Excel
- **dotenv** - Variables de entorno

### Frontend

- **HTML5** - Estructura
- **CSS3** - Estilos (Variables CSS, Flexbox, Grid)
- **JavaScript ES6+** - Lógica (Vanilla, sin frameworks)
- **Fetch API** - Comunicación con backend

### Herramientas de Desarrollo

- **Nodemon** - Auto-reload en desarrollo
- **Git** - Control de versiones
- **Prisma Studio** - Interfaz visual de BD

---

## Instalación de Dependencias

```bash
npm install
```

### Dependencias de Producción

```json
{
  "express": "^4.18.2",
  "@prisma/client": "^5.7.0",
  "cors": "^2.8.5",
  "xlsx": "^0.18.5",
  "dotenv": "^17.2.3"
}
```

### Dependencias de Desarrollo

```json
{
  "prisma": "^5.7.0",
  "nodemon": "^3.0.2"
}
```

---

## Scripts NPM Disponibles

```bash
# Servidor
npm start                    # Iniciar en producción
npm run dev                  # Iniciar en desarrollo (auto-reload)

# Base de Datos
npm run db:generate          # Generar cliente de Prisma
npm run db:migrate           # Ejecutar migraciones
npm run db:studio            # Abrir interfaz visual
npm run db:seed              # Cargar datos de ejemplo
npm run db:reset             # Resetear BD completa

# Importación
npm run import               # Importar desde Excel
```

---

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

---

## Licencia

Este proyecto está bajo la Licencia **MIT**. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## Contacto

**Proyecto**: Sistema de Indicaciones de Laboratorio
**Versión**: 1.6.0
**Última actualización**: 24/10/2025
**Repositorio**: [https://github.com/tu-usuario/indicaciones-app2](https://github.com/tu-usuario/indicaciones-app2)

---

## Agradecimientos

- **Fuente de datos**: Red de Laboratorios - Tabla de indicaciones actualizada 2024
- **Tecnologías**: Node.js, Express, Prisma, SQLite
- **Desarrollado con**: Claude Code (Anthropic)

---

**Generado con ❤️ para mejorar la atención al paciente en laboratorios clínicos**
