# 🚀 CÓMO CONTINUAR - Guía Rápida

**Si se cortó la luz o reiniciaste la PC, sigue estos pasos:**

---

## ⚡ INICIO RÁPIDO (5 minutos)

### 1. Abrir terminal y navegar al proyecto

```bash
cd C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app2
```

### 2. Verificar que todo está bien

```bash
# Ver últimos commits
git log --oneline -5

# Debería mostrar:
# 7dd6a68 Documentación completa de Etapa 6
# 5fc0829 Etapa 6 completada - Frontend
# 0395b32 Etapa 5 completada - Importación de datos reales desde Excel
# 5a1e058 Resumen completo de la sesión de desarrollo
# 8bc8fc0 Documentación completa de tests y estado actual
# 2c76d71 Etapa 4 completada - Backend API REST funcional
# dd5c4f2 Etapa 3 completada - Base de datos y modelos
```

### 3. Iniciar el servidor

```bash
npm run dev
```

**Deberías ver:**
```
✅ Servidor iniciado exitosamente
🌐 URL: http://localhost:3000
📊 Base de datos: 846 prácticas reales
```

### 4. Probar que funciona (en otra terminal)

```bash
curl http://localhost:3000/api/health
```

**Si responde con `"success":true"` → ¡Todo está funcionando!** ✅

---

## 🧪 TESTS RÁPIDOS

```bash
# Test 1: Listar prácticas REALES (ahora son 846)
curl http://localhost:3000/api/practicas?limit=5

# Test 2: Simulador con prácticas reales
curl -X POST http://localhost:3000/api/simulador/generar \
  -H "Content-Type: application/json" \
  -d "{\"id_practicas\": [103, 104, 105]}"

# Test 3: Ver estadísticas
curl http://localhost:3000/api/practicas | grep -o "\"total\":[0-9]*"
# Debería mostrar: "total":846
```

---

## 📊 ESTADO ACTUAL

### ✅ Completado:
- Etapa 1: Análisis y diseño
- Etapa 2: Configuración base
- Etapa 3: Base de datos (SQLite)
- Etapa 4: Backend API REST FUNCIONAL ⭐
- **Etapa 5: Importación de datos reales ✅
- **Etapa 6: Frontend web completo ✅ COMPLETADA****
  - 846 prácticas reales importadas
  - 61 grupos de indicaciones
  - 138 indicaciones atómicas
  - 10 áreas de laboratorio

### ⏳ Pendiente:
- **Etapa 6: Frontend (HTML/CSS/JS)** ← SIGUIENTE

---

## 🎯 OPCIONES PARA CONTINUAR

### Opción A: Ver datos importados con Prisma Studio
```bash
npm run db:studio
# Abre http://localhost:5555 para ver la BD visualmente
```

### Opción B: Re-importar datos (si es necesario)
```bash
npm run import
# Ejecuta: node scripts/importar-simplificado.js
```

### Opción C: Crear frontend (Etapa 6)
```bash
# Crear archivos:
# - public/index.html
# - public/css/styles.css
# - public/js/simulador.js
# - public/js/api.js
```

### Opción D: Más tests con datos reales
```bash
# Buscar prácticas por área
curl "http://localhost:3000/api/practicas?area=QUIMICA&limit=5"

# Buscar por nombre
curl "http://localhost:3000/api/practicas?buscar=GLUCOSA&limit=5"

# Ver grupos
curl http://localhost:3000/api/grupos?limit=5
```

---

## 📝 COMANDOS IMPORTANTES

```bash
# Servidor
npm run dev              # Desarrollo (recomendado)
npm start                # Producción

# Base de datos
npm run db:studio        # Abrir interfaz visual (localhost:5555)
npm run db:seed          # Recargar datos de ejemplo (10 prácticas)
npm run import           # Importar datos reales del Excel (846 prácticas)

# Git
git status               # Ver cambios
git log --oneline -5     # Ver últimos 5 commits
git add .                # Agregar cambios
git commit -m "Mensaje"  # Crear commit
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "Cannot find module"
```bash
npm install
```

### Problema: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <numero> /F

# O cambiar puerto en .env
PORT=3001
```

### Problema: "Database not found"
```bash
npm run db:migrate
npm run import  # Importar datos reales
```

### Problema: "Prácticas vacías"
```bash
# Re-importar datos
npm run import
```

---

## 📚 ARCHIVOS CLAVE

```
indicaciones-app2/
├── src/
│   ├── server.js                    # Servidor Express
│   ├── services/
│   │   └── indicacionesService.js   # ⭐ Algoritmo principal
│   ├── controllers/                 # Controladores de rutas
│   └── routes/                      # Definición de endpoints
├── prisma/
│   ├── schema.prisma                # Modelo de datos
│   └── indicaciones.db              # Base de datos SQLite (846 prácticas)
├── scripts/
│   ├── importar-simplificado.js     # ⭐ Script de importación
│   ├── listar-hojas.js              # Utilidad para ver hojas del Excel
│   └── seed.js                      # Datos de ejemplo
└── docs/
    ├── TESTING_Y_ESTADO_ACTUAL.md   # Tests y estado completo
    └── COMO_CONTINUAR.md            # Esta guía
```

---

## 🎓 PARA CLAUDE CODE (si retomas)

**Contexto rápido:**
- Proyecto: Sistema de indicaciones de laboratorio
- Stack: Node.js + Express + Prisma + SQLite
- Estado: Sistema COMPLETO funcional - Backend + Frontend (Etapa 6 completada)
- Siguiente: Etapa 6 (Frontend HTML/CSS/JS)
- Carpeta: `C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app2`
- Puerto: 3000
- DB: `prisma/indicaciones.db` (846 prácticas reales)

**Archivos clave:**
- `src/server.js` - Servidor Express
- `src/services/indicacionesService.js` - Algoritmo principal
- `scripts/importar-simplificado.js` - Importación desde Excel
- `prisma/schema.prisma` - Modelo de datos

**Último commit:**
```
7dd6a68 Documentación completa de Etapa 6
# 5fc0829 Etapa 6 completada - Frontend
# 0395b32 Etapa 5 completada - Importación de datos reales desde Excel
```

**Base de datos:**
- 846 prácticas reales
- 61 grupos de indicaciones
- 138 indicaciones atómicas
- 10 áreas de laboratorio

**API Endpoints funcionando:**
- GET  /api/health
- GET  /api/practicas (filtros: area, buscar, limit, offset)
- GET  /api/grupos
- GET  /api/indicaciones
- POST /api/simulador/generar ⭐

---

---

## 📅 ACTUALIZACIÓN 09/10/2025 - v1.5.0

### ✨ Nueva Funcionalidad: Indicadores Visuales

**Implementado hoy:**
- Badge verde `✓ Con indicaciones` para prácticas con indicaciones configuradas
- Badge amarillo `⚠ Sin indicaciones` para prácticas sin indicaciones
- Borde amarillo y fondo claro para prácticas sin indicaciones

**Problema resuelto:**
- El 75% de las prácticas (635 de 846) no tienen indicaciones en el Excel original
- Ahora el usuario ve claramente cuáles tienen indicaciones ANTES de seleccionar

**Probar:**
1. Buscar "HEMOGRAMA" → verás badge amarillo
2. Buscar "PARASITO" → verás badge verde
3. Seleccionar ambas → solo generará indicaciones del parasitológico (esperado)

**Documentación:**
- Ver `docs/MEJORA_INDICADORES_VISUALES.md` para detalles técnicos
- Ver `docs/ESTADO_ACTUAL_2025-10-09.md` para estado completo

---

**Última actualización:** 09/10/2025 - 16:45 hs
