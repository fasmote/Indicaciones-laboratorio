# 📊 IMPORTAR DATOS REALES

Este archivo contiene las 264 prácticas reales, 20 grupos, y todas las relaciones necesarias para el sistema.

## 🚀 Cómo Importar los Datos

### Método 1: Desde DBeaver (Recomendado)

1. Abre **DBeaver**
2. Conecta a la base de datos: `prisma/indicaciones.db`
3. Haz clic derecho en la base de datos → **SQL Editor** → **Execute SQL Script**
4. Selecciona el archivo: `datos_reales_import.sql`
5. Ejecuta el script
6. ¡Listo! Deberías tener:
   - ✅ 264 prácticas
   - ✅ 20 grupos
   - ✅ 180 indicaciones
   - ✅ Todas las relaciones

### Método 2: Desde SQLite Command Line

```bash
# Navega a la carpeta del proyecto
cd prisma

# Ejecuta el script
sqlite3 indicaciones.db < ../datos_reales_import.sql
```

### Método 3: Desde Node.js

```bash
# Ejecuta el script de importación
node import_script.js
```

## 🔍 Verificar que se Importó Correctamente

Después de importar, verifica con:

```sql
-- Contar prácticas
SELECT COUNT(*) FROM Practica;
-- Resultado esperado: 264

-- Contar grupos
SELECT COUNT(*) FROM Grupo;
-- Resultado esperado: 20

-- Contar indicaciones
SELECT COUNT(*) FROM Indicacion;
-- Resultado esperado: 180

-- Contar relaciones
SELECT COUNT(*) FROM PracticaGrupo;
-- Resultado esperado: ~200+

SELECT COUNT(*) FROM GrupoIndicacion;
-- Resultado esperado: ~23
```

O desde la aplicación web:
```
http://localhost:3000/api/debug/count
```

## 📋 Contenido del Archivo

Este archivo SQL contiene:

### 1. Prácticas de Laboratorio (264)
- Código único de práctica
- Nombre descriptivo
- Código de área (VIRO, QUIM, BACT, ENDO, HEMA, INMU)
- Estado activo

**Ejemplos:**
- 69586 - ACTH
- 69613 - INSULINA
- 69424 - ORINA COMPLETA
- 70274 - CORTISOL EN SUERO BASAL

### 2. Grupos de Compatibilidad (20)

Organizados por requisitos:

| Grupo | Descripción | Ayuno | Orina |
|-------|-------------|-------|-------|
| 1 | VIROLOGIA_SIN_PREPARACION | - | - |
| 2 | QUIMICA_SIN_PREPARACION | - | - |
| 3 | BACTERIO_SIN_PREPARACION | - | - |
| 4 | QUIMICA_ORINA_12H | - | 12h |
| 5 | QUIMICA_AYUNO8H_ORINA_12H | 8h | 12h |
| 6 | QUIMICA_AYUNO8H_ORINA_2H | 8h | 2h |
| 7 | ENDOCRINO_AYUNO8H | 8h | - |
| 8 | ENDOCRINO_SIN_PREPARACION | - | - |
| 9 | QUIMICA_AYUNO8H | 8h | - |
| 10 | HEMATO_AYUNO4H | 4h | - |
| 11 | QUIMICA_PRIMERA_ORINA | - | Primera |
| 12 | BACTERIO_PRIMERA_ORINA | - | Primera |
| 13 | HEMATO_AYUNO8H | 8h | - |
| 14 | ENDOCRINO_ORINA_24H | - | 24h |
| 15 | INMUNOLOGIA_ORINA_24H | - | 24h |
| 16 | QUIMICA_AYUNO8H_ORINA_24H | 8h | 24h |
| 17 | QUIMICA_ORINA_24H | - | 24h |
| 18 | QUIMICA_AYUNO3H | 3h | - |
| 19 | BACTERIO_AYUNO8H | 8h | - |
| 20 | ENDOCRINO_PRIMERA_ORINA | - | Primera |

### 3. Indicaciones (180)

Instrucciones detalladas para pacientes según cada grupo:
- Preparación necesaria
- Tiempo de ayuno
- Recolección de muestras
- Restricciones especiales

### 4. Relaciones

- **PracticaGrupo**: Vincula cada práctica con su(s) grupo(s) compatible(s)
- **GrupoIndicacion**: Vincula cada grupo con sus indicaciones específicas
- **GruposAlternativos**: Reglas especiales de compatibilidad

## ⚠️ IMPORTANTE

- El script **BORRA** todos los datos existentes antes de importar
- Si tienes datos que quieres conservar, **haz un backup primero**
- El script usa `DELETE FROM` en lugar de `DROP TABLE`, por lo que las tablas se mantienen

## 🔄 Si Necesitas Volver a Importar

Simplemente ejecuta el script de nuevo. El proceso es:

1. Limpia todas las tablas
2. Inserta las 264 prácticas
3. Inserta los 20 grupos
4. Inserta las 180 indicaciones
5. Crea las relaciones entre prácticas y grupos
6. Crea las relaciones entre grupos e indicaciones

## 📞 Soporte

Si tienes problemas con la importación:
1. Verifica que la base de datos existe
2. Verifica que las tablas están creadas (ejecuta `npm run db:migrate`)
3. Revisa los logs de error
4. Consulta el archivo `ESTADO_PROYECTO.md`
