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
git log --oneline -3

# Debería mostrar:
# 2c76d71 Etapa 4 completada - Backend API REST funcional
# dd5c4f2 Etapa 3 completada - Base de datos y modelos
# 7ff4d46 Initial commit - Etapa 2 completada
```

### 3. Iniciar el servidor

```bash
npm run dev
```

**Deberías ver:**
```
✅ Servidor iniciado exitosamente
🌐 URL: http://localhost:3000
```

### 4. Probar que funciona (en otra terminal)

```bash
curl http://localhost:3000/api/health
```

**Si responde con `"success":true"` → ¡Todo está funcionando!** ✅

---

## 🧪 TESTS RÁPIDOS

```bash
# Test 1: Listar prácticas
curl http://localhost:3000/api/practicas

# Test 2: Simulador simple
curl -X POST http://localhost:3000/api/simulador/generar \
  -H "Content-Type: application/json" \
  -d "{\"id_practicas\": [1, 2, 3]}"

# Test 3: Conflicto de orina (debe dar error)
curl -X POST http://localhost:3000/api/simulador/generar \
  -H "Content-Type: application/json" \
  -d "{\"id_practicas\": [10, 11]}"
```

---

## 📊 ESTADO ACTUAL

### ✅ Completado:
- Etapa 1: Análisis y diseño
- Etapa 2: Configuración base
- Etapa 3: Base de datos (SQLite con 10 prácticas de ejemplo)
- **Etapa 4: Backend API REST FUNCIONAL** ⭐

### ⏳ Pendiente:
- Etapa 5: Importación de datos desde Excel (852 prácticas)
- Etapa 6: Frontend (HTML/CSS/JS)

---

## 🎯 OPCIONES PARA CONTINUAR

### Opción A: Importar datos reales del Excel
```bash
# Crear script de importación
# Archivo: scripts/importar-excel.js
# Ejecutar: npm run import
```

### Opción B: Crear frontend
```bash
# Crear archivos:
# - public/index.html
# - public/css/styles.css
# - public/js/simulador.js
```

### Opción C: Más tests
```bash
# Probar más combinaciones de prácticas
curl -X POST http://localhost:3000/api/simulador/generar \
  -H "Content-Type: application/json" \
  -d "{\"id_practicas\": [7, 4, 10]}"
```

---

## 📝 COMANDOS IMPORTANTES

```bash
# Servidor
npm run dev              # Desarrollo (recomendado)
npm start                # Producción

# Base de datos
npm run db:studio        # Abrir interfaz visual (localhost:5555)
npm run db:seed          # Recargar datos de ejemplo

# Git
git status               # Ver cambios
git add .                # Agregar cambios
git commit -m "Mensaje"  # Crear commit

# Ver logs del servidor
# (Si está corriendo con npm run dev, los logs aparecen en la terminal)
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
npm run db:seed
```

### Problema: Git no reconoce cambios
```bash
git status
git add .
git commit -m "Cambios realizados"
```

---

## 📚 DOCUMENTACIÓN COMPLETA

Ver: `docs/TESTING_Y_ESTADO_ACTUAL.md` para información detallada.

---

## 🎓 PARA CLAUDE CODE (si retomas)

**Contexto rápido:**
- Proyecto: Sistema de indicaciones de laboratorio
- Stack: Node.js + Express + Prisma + SQLite
- Estado: Backend API funcional (Etapa 4 completada)
- Siguiente: Etapa 5 (importación Excel) o Etapa 6 (frontend)
- Carpeta: `C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app2`
- Puerto: 3000
- DB: `prisma/indicaciones.db`

**Archivos clave:**
- `src/server.js` - Servidor Express
- `src/services/indicacionesService.js` - Algoritmo principal
- `prisma/schema.prisma` - Modelo de datos
- `docs/TESTING_Y_ESTADO_ACTUAL.md` - Estado completo

**Último commit:**
```
2c76d71 Etapa 4 completada - Backend API REST funcional
```

**Tests realizados:** 10/10 PASS ✅

---

**Última actualización:** 08/10/2025 - 10:55 hs
