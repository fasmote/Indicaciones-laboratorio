# 📊 Datos del Sistema

Este proyecto incluye archivos SQL con datos para pruebas y producción.

## 🗂️ Archivos Disponibles

### 1️⃣ `datos_sqlite_ejemplo.sql` - Datos de Prueba

**20 prácticas** de ejemplo para testing rápido.

```bash
# Importar en SQLite
sqlite3 prisma/indicaciones.db < datos_sqlite_ejemplo.sql
```

**Contenido:**
- ✅ 20 prácticas comunes (ACTH, Insulina, TSH, Orina completa, etc.)
- ✅ 20 grupos de compatibilidad
- ✅ 8 indicaciones básicas
- ✅ Todas las relaciones configuradas

**Ideal para:**
- 🚀 Probar el sistema rápidamente
- 🧪 Desarrollo y testing
- 📚 Entender la estructura de datos

---

### 2️⃣ `datos_reales_import.sql` - Datos Completos

**264 prácticas reales** del sistema DGSISAN 2025.

⚠️ **IMPORTANTE**: Este archivo usa nombres de Prisma (`Practica`, `Grupo`) pero las tablas SQLite reales tienen nombres mapeados (`PRACTICA`, `GRUPO`). 

**Cuando migremos a MySQL, este archivo funcionará perfectamente.**

Para SQLite, usa el script de conversión o espera la migración a MySQL.

---

## 🔧 Importación en SQLite

### Opción A: Desde DBeaver (Visual - Recomendado)

1. Abre **DBeaver**
2. Conecta a: `prisma/indicaciones.db`
3. Clic derecho → **SQL Editor** → **Execute SQL Script**
4. Selecciona: `datos_sqlite_ejemplo.sql`
5. Ejecuta ▶️

### Opción B: Desde Terminal (Rápido)

```bash
cd indicaciones-app

# Importar datos de ejemplo
sqlite3 prisma/indicaciones.db < datos_sqlite_ejemplo.sql
```

---

## ✅ Verificar Importación

Después de importar, verifica con este query en DBeaver:

```sql
SELECT 
  'Prácticas' as Tabla, COUNT(*) as Cantidad FROM PRACTICA
UNION ALL
SELECT 'Grupos', COUNT(*) FROM GRUPO
UNION ALL
SELECT 'Indicaciones', COUNT(*) FROM INDICACION
UNION ALL
SELECT 'Relaciones P-G', COUNT(*) FROM PRACTICA_GRUPO
UNION ALL
SELECT 'Relaciones G-I', COUNT(*) FROM GRUPO_INDICACION;
```

**Resultados esperados** (datos de ejemplo):

| Tabla | Cantidad |
|-------|----------|
| Prácticas | 20 |
| Grupos | 20 |
| Indicaciones | 6 |
| Relaciones P-G | 20 |
| Relaciones G-I | 8 |

O desde el navegador:
```
http://localhost:3000/api/debug/count
```

---

## 🔄 Migración a MySQL (Próximamente)

Cuando migremos a MySQL:

1. El archivo `datos_reales_import.sql` funcionará directamente
2. Solo necesitaremos cambiar:
   - `datetime('now')` → `NOW()`
   - Nombres de tablas ya serán correctos

---

## ⚠️ Importante sobre Nombres de Tablas

### En SQLite (Actual)
Las tablas tienen nombres en MAYÚSCULAS debido al mapeo de Prisma:
- `PRACTICA` (no `Practica`)
- `GRUPO` (no `Grupo`) 
- `INDICACION` (no `Indicacion`)
- `PRACTICA_GRUPO` (no `PracticaGrupo`)
- `GRUPO_INDICACION` (no `GrupoIndicacion`)

### En MySQL (Futuro)
Las tablas tendrán los nombres de Prisma directamente:
- `Practica`
- `Grupo`
- `Indicacion`
- `PracticaGrupo`
- `GrupoIndicacion`

---

## 📖 Más Información

Ver archivo completo: [`IMPORTAR-DATOS.md`](./IMPORTAR-DATOS.md)
