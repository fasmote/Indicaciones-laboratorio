# Lógica de la Base de Datos
## Sistema de Indicaciones de Laboratorio

**Documento educativo sobre el modelo de datos**

---

## 📚 Tabla de Contenidos

1. [Introducción](#introducción)
2. [El Problema Real](#el-problema-real)
3. [Enfoque 1: Relación Directa (Uno a Uno)](#enfoque-1-relación-directa-uno-a-uno)
4. [Enfoque 2: Grupos Intermedios (Implementado)](#enfoque-2-grupos-intermedios-implementado)
5. [Comparación de Enfoques](#comparación-de-enfoques)
6. [Casos de Uso Reales](#casos-de-uso-reales)
7. [Ventajas del Sistema de Grupos](#ventajas-del-sistema-de-grupos)
8. [Desventajas y Limitaciones](#desventajas-y-limitaciones)
9. [Ejemplos Prácticos](#ejemplos-prácticos)
10. [Conclusión](#conclusión)

---

## Introducción

Este documento explica **por qué** el sistema utiliza una arquitectura de **grupos intermedios** en lugar de una relación directa entre prácticas e indicaciones, usando ejemplos del mundo real de un laboratorio clínico.

---

## El Problema Real

### Contexto del Laboratorio

En un laboratorio clínico:

1. **Los médicos pueden:**
   - Solicitar múltiples prácticas para un paciente
   - Agregar más prácticas días después
   - Anular prácticas antes de la extracción
   - Cambiar órdenes constantemente

2. **El paciente:**
   - Recibe UNA sola hoja de indicaciones
   - Necesita instrucciones claras y consolidadas
   - No debe tener indicaciones duplicadas
   - Debe resolver conflictos automáticamente (ej: ayuno máximo)

3. **El laboratorio necesita:**
   - Generar indicaciones rápidamente
   - Manejar cambios sin recalcular todo
   - Mantener consistencia en las indicaciones
   - Escalar a miles de prácticas

---

## Enfoque 1: Relación Directa (Uno a Uno)

### ❌ Modelo Rechazado

```
┌─────────────┐         ┌──────────────┐
│  PRACTICA   │────────>│  INDICACION  │
│             │  1:1    │              │
│ - GLUCEMIA  │────────>│ - Ayuno 8hs  │
└─────────────┘         └──────────────┘
```

### Estructura de Tablas

```sql
-- Tabla PRACTICA
PRACTICA (
    id_practica,
    nombre,
    codigo_did,
    id_indicacion  -- FK directa ❌
)

-- Tabla INDICACION
INDICACION (
    id_indicacion,
    texto
)
```

### Ejemplo de Datos

```sql
-- Prácticas
1, 'GLUCEMIA', 'GLUC001', 101
2, 'COLESTEROL', 'COL001', 101
3, 'TRIGLICERIDOS', 'TRI001', 101

-- Indicaciones
101, 'Concurrir con 8 horas de ayuno'
```

---

### ❌ PROBLEMA 1: Duplicación Masiva

**Escenario:** 300 prácticas requieren "ayuno de 8 horas"

```sql
-- Con relación directa necesitas:
INSERT INTO INDICACION VALUES (101, 'Concurrir con 8 horas de ayuno');
INSERT INTO INDICACION VALUES (102, 'Concurrir con 8 horas de ayuno'); -- DUPLICADO
INSERT INTO INDICACION VALUES (103, 'Concurrir con 8 horas de ayuno'); -- DUPLICADO
-- ... 300 veces ❌
```

**Resultado:**
- ❌ 300 registros idénticos en la tabla INDICACION
- ❌ Desperdicio de espacio en disco
- ❌ Si quieres cambiar el texto, debes actualizar 300 registros
- ❌ Inconsistencias si olvidas actualizar uno

---

### ❌ PROBLEMA 2: No Puedes Compartir Indicaciones

**Escenario:** Médico pide GLUCEMIA + COLESTEROL + TRIGLICÉRIDOS

```
Prácticas del paciente:
├─ GLUCEMIA (ayuno 8h)
├─ COLESTEROL (ayuno 12h)
└─ TRIGLICÉRIDOS (ayuno 12h)
```

**Con relación directa:**

```sql
-- ¿Qué indicación le das al paciente?
SELECT i.texto
FROM PRACTICA p
JOIN INDICACION i ON p.id_indicacion = i.id_indicacion
WHERE p.id_practica IN (1, 2, 3)

-- Resultado:
'Concurrir con 8 horas de ayuno'   -- De GLUCEMIA
'Concurrir con 12 horas de ayuno'  -- De COLESTEROL
'Concurrir con 12 horas de ayuno'  -- De TRIGLICÉRIDOS (duplicado)
```

**¿Qué le dices al paciente?**
- ❌ "Ayuno de 8 horas Y ayuno de 12 horas" → CONFUSO
- ❌ Tienes que escribir lógica compleja para resolver conflictos
- ❌ Cada práctica solo "conoce" su propia indicación

---

### ❌ PROBLEMA 3: Cambios Dinámicos del Médico

**Escenario Real:**

```
Día 1 (Lunes):
  Dr. García solicita: GLUCEMIA

Día 2 (Martes):
  Dr. García agrega: HEMOGRAMA, ORINA COMPLETA

Día 3 (Miércoles):
  Dr. García anula: HEMOGRAMA
  Dr. López agrega: COLESTEROL

Día 4 (Jueves):
  Paciente viene a extraerse
```

**Con relación directa:**

```sql
-- Día 1: Generas indicaciones
Indicación: "Ayuno 8h"

-- Día 2: Agregas prácticas
-- ¿Regeneras TODO? ¿Solo agregas?
Indicación anterior: "Ayuno 8h"
Nueva indicación: "Primera orina de la mañana"
-- ¿Cómo las combinas?

-- Día 3: Anulas HEMOGRAMA
-- ¿Remueves "Primera orina"?
-- ¿Qué pasa si otra práctica también necesita orina?

-- Día 4: Paciente confundido con indicaciones contradictorias
```

**Problemas:**
- ❌ Cada cambio requiere recalcular TODO
- ❌ No sabes qué indicaciones ya fueron dadas al paciente
- ❌ Conflictos de indicaciones no se resuelven
- ❌ Performance horrible (N consultas)

---

### ❌ PROBLEMA 4: Indicaciones Complejas

**Escenario:** Una práctica necesita MÚLTIPLES indicaciones

```
ESTUDIO PARASITOLÓGICO SERIADO necesita:
1. Recolectar materia fecal durante 7 días consecutivos
2. Traer las muestras refrigeradas
3. No consumir antiparasitarios 15 días antes
4. Dieta rica en fibras 3 días antes
```

**Con relación directa 1:1:**
- ❌ Solo puedes asignar UNA indicación por práctica
- ❌ Tendrías que concatenar todo en un solo texto largo
- ❌ No puedes ordenar las indicaciones por prioridad
- ❌ No puedes reutilizar indicaciones individuales

---

## Enfoque 2: Grupos Intermedios (Implementado)

### ✅ Modelo Actual

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│  PRACTICA   │──────>│   GRUPO     │──────>│  INDICACION  │
│             │  M:N  │             │  M:N  │              │
│ - GLUCEMIA  │──────>│ - Ayuno 8h  │──────>│ - Ayuno 8hs  │
│ - COLESTEROL│──────>│ - Ayuno 12h │──────>│ - Horario    │
└─────────────┘       └─────────────┘       └──────────────┘
         ↓                    ↓                      ↓
   PRACTICA_GRUPO      Atributos:           GRUPO_INDICACION
                       - horas_ayuno              ↓
                       - tipo_orina            orden
```

### Estructura de Tablas

```sql
-- Tabla PRACTICA (independiente)
PRACTICA (
    id_practica,
    nombre,
    codigo_did
    -- SIN referencia directa a indicación ✅
)

-- Tabla GRUPO (concepto intermedio)
GRUPO (
    id_grupo,
    nombre,
    horas_ayuno,        -- ✅ Metadatos
    tipo_orina,         -- ✅ Metadatos
    horas_orina         -- ✅ Metadatos
)

-- Tabla INDICACION (reutilizable)
INDICACION (
    id_indicacion,
    texto,
    tipo,
    orden
)

-- Relación M:N Práctica-Grupo
PRACTICA_GRUPO (
    id_practica,
    id_grupo,
    activo              -- ✅ Soft delete
)

-- Relación M:N Grupo-Indicación
GRUPO_INDICACION (
    id_grupo,
    id_indicacion,
    orden,              -- ✅ Prioridad
    activo              -- ✅ Soft delete
)
```

---

## Comparación de Enfoques

### Tabla Comparativa

| Característica | Relación Directa (1:1) | Grupos Intermedios (M:N) |
|----------------|------------------------|--------------------------|
| **Duplicación de datos** | ❌ Alta (mismo texto 300+ veces) | ✅ Mínima (1 indicación, N referencias) |
| **Reutilización** | ❌ Imposible | ✅ Total |
| **Múltiples indicaciones por práctica** | ❌ No soportado | ✅ Ilimitadas |
| **Resolución de conflictos** | ❌ Manual y compleja | ✅ Automática (por metadatos) |
| **Cambios dinámicos** | ❌ Recalcular todo | ✅ Incremental |
| **Performance** | ❌ O(N²) para consolidar | ✅ O(N) con joins |
| **Mantenimiento** | ❌ Actualizar 300 textos | ✅ Actualizar 1 texto |
| **Soft delete** | ❌ Difícil implementar | ✅ Nativo |
| **Historial de cambios** | ❌ Imposible | ✅ Posible |
| **Escalabilidad** | ❌ Pobre (100-500 prácticas) | ✅ Excelente (1000+ prácticas) |

---

## Casos de Uso Reales

### 📋 Caso 1: Cambios de Órdenes Médicas

#### Escenario

```
Paciente: Juan Pérez
Turno: Viernes 8:00 AM

Lunes 10:00 - Dr. García solicita:
  └─ GLUCEMIA
  └─ HEMOGRAMA COMPLETO

Miércoles 15:00 - Dr. García agrega:
  └─ ORINA COMPLETA
  └─ UROCULTIVO

Jueves 11:00 - Dr. García anula:
  └─ HEMOGRAMA COMPLETO (ya no es necesario)

Viernes 8:00 - Paciente llega al laboratorio
```

#### ❌ Con Relación Directa

```sql
-- Lunes: Primer cálculo
SELECT texto FROM INDICACION
WHERE id_indicacion IN (
    SELECT id_indicacion FROM PRACTICA
    WHERE id_practica IN (1, 2)
)
-- Resultado: "Ayuno 8h", "Sin ayuno"
-- Indicación al paciente: "Ayuno 8h" (prevalece)

-- Miércoles: RE-CALCULAR TODO de nuevo ❌
SELECT texto FROM INDICACION
WHERE id_indicacion IN (
    SELECT id_indicacion FROM PRACTICA
    WHERE id_practica IN (1, 2, 3, 4)
)
-- Resultado: "Ayuno 8h", "Sin ayuno", "Primera orina mañana", "Primera orina mañana"
-- ¿Cómo detectas el duplicado?
-- ¿Cómo sabes que ya le dijiste "Ayuno 8h"?

-- Jueves: RE-CALCULAR TODO otra vez ❌
-- Tienes que eliminar HEMOGRAMA y regenerar
-- ¿Qué pasa si el paciente ya imprimió las indicaciones?

-- PROBLEMAS:
-- ❌ 3 cálculos completos para un paciente
-- ❌ No hay historial de cambios
-- ❌ No puedes notificar al paciente de cambios
-- ❌ Performance horrible con 50 pacientes simultáneos
```

#### ✅ Con Grupos Intermedios

```sql
-- Lunes: Asocias prácticas a grupos (1 vez)
INSERT INTO PRACTICA_GRUPO VALUES (1, 101, true);  -- GLUCEMIA → Grupo "Ayuno 8h"
INSERT INTO PRACTICA_GRUPO VALUES (2, 102, true);  -- HEMOGRAMA → Grupo "Sin ayuno"

-- Sistema ya conoce las indicaciones consolidadas ✅
-- No necesitas recalcular

-- Miércoles: Solo AGREGAS relaciones nuevas
INSERT INTO PRACTICA_GRUPO VALUES (3, 103, true);  -- ORINA → Grupo "Primera orina"
INSERT INTO PRACTICA_GRUPO VALUES (4, 103, true);  -- UROCULTIVO → Grupo "Primera orina"
-- ✅ Ambas comparten el MISMO grupo (no duplicas indicaciones)

-- Jueves: SOFT DELETE (no borras, desactivas)
UPDATE PRACTICA_GRUPO
SET activo = false
WHERE id_practica = 2;
-- ✅ Mantienes historial
-- ✅ Puedes reactivar si el médico se equivocó

-- Viernes: Consulta final (RÁPIDA)
SELECT DISTINCT i.texto
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO g ON pg.id_grupo = g.id_grupo
JOIN GRUPO_INDICACION gi ON g.id_grupo = gi.id_grupo
JOIN INDICACION i ON gi.id_indicacion = i.id_indicacion
WHERE p.id_practica IN (1, 3, 4)  -- Solo las activas
  AND pg.activo = true
  AND gi.activo = true
ORDER BY gi.orden;

-- VENTAJAS:
-- ✅ Solo 1 consulta final (no 3)
-- ✅ Historial completo en la BD
-- ✅ Puedes notificar cambios al paciente
-- ✅ Performance excelente con 1000 pacientes
```

---

### 📋 Caso 2: Múltiples Médicos, Mismo Paciente

#### Escenario

```
Paciente: María López
Turno: Jueves 9:00 AM

Lunes:
  Dr. Pérez (Clínico) solicita:
    └─ GLUCEMIA
    └─ HEMOGRAMA

Martes:
  Dra. Fernández (Endocrinóloga) solicita:
    └─ INSULINA
    └─ HEMOGLOBINA GLICOSILADA

Miércoles:
  Dr. Ramírez (Cardiólogo) solicita:
    └─ COLESTEROL
    └─ TRIGLICÉRIDOS
    └─ HDL
```

#### ❌ Con Relación Directa

```sql
-- ¿Cómo consolidas indicaciones de 3 médicos diferentes?
-- ¿Quién es responsable de generar la hoja final?

-- Lunes:
GLUCEMIA → "Ayuno 8h"
HEMOGRAMA → "Sin requisitos especiales"

-- Martes:
INSULINA → "Ayuno 8h"           -- DUPLICADO ❌
HEMOGLOBINA → "Ayuno 8h"        -- DUPLICADO ❌

-- Miércoles:
COLESTEROL → "Ayuno 12h"        -- CONFLICTO ❌
TRIGLICÉRIDOS → "Ayuno 12h"     -- DUPLICADO ❌
HDL → "Ayuno 12h"               -- DUPLICADO ❌

-- RESULTADO:
-- ❌ 3 veces "Ayuno 8h"
-- ❌ 3 veces "Ayuno 12h"
-- ❌ ¿Cuál prevalece? (necesitas lógica manual)
-- ❌ ¿Cómo detectas que GLUCEMIA e INSULINA son del mismo grupo?
```

#### ✅ Con Grupos Intermedios

```sql
-- Lunes:
GLUCEMIA → Grupo "Ayuno 8h" (id: 101)
HEMOGRAMA → Grupo "Sin ayuno" (id: 102)

-- Martes:
INSULINA → Grupo "Ayuno 8h" (id: 101)        -- ✅ REUTILIZA grupo existente
HEMOGLOBINA → Grupo "Ayuno 8h" (id: 101)     -- ✅ REUTILIZA grupo existente

-- Miércoles:
COLESTEROL → Grupo "Ayuno 12h" (id: 103)
TRIGLICÉRIDOS → Grupo "Ayuno 12h" (id: 103)  -- ✅ REUTILIZA
HDL → Grupo "Ayuno 12h" (id: 103)            -- ✅ REUTILIZA

-- Consolidación AUTOMÁTICA:
SELECT g.id_grupo, g.nombre, g.horas_ayuno, COUNT(p.id_practica) as cantidad
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO g ON pg.id_grupo = g.id_grupo
WHERE pg.activo = true
GROUP BY g.id_grupo
ORDER BY g.horas_ayuno DESC;  -- ✅ Ordenadas por ayuno (12h primero)

-- RESULTADO FINAL (AUTOMÁTICO):
-- Grupo "Ayuno 12h" (3 prácticas): COLESTEROL, TRIGLICÉRIDOS, HDL
-- Grupo "Ayuno 8h" (3 prácticas): GLUCEMIA, INSULINA, HEMOGLOBINA
-- Grupo "Sin ayuno" (1 práctica): HEMOGRAMA

-- ✅ El sistema SABE que:
--     - Ayuno 12h PREVALECE sobre 8h (MAX)
--     - No hay duplicados
--     - Todas las prácticas están agrupadas lógicamente
```

---

### 📋 Caso 3: Práctica con Múltiples Indicaciones

#### Escenario

```
ESTUDIO PARASITOLÓGICO SERIADO necesita:
1. Recolectar materia fecal durante 7 días consecutivos
2. Refrigerar las muestras (2-8°C)
3. No consumir antiparasitarios 15 días antes
4. Dieta rica en fibras 3 días antes
5. Traer las muestras en frascos estériles
```

#### ❌ Con Relación Directa (1:1)

```sql
-- OPCIÓN A: Todo en un solo texto largo ❌
INDICACION (
    id: 500,
    texto: "Recolectar materia fecal durante 7 días consecutivos.
            Refrigerar las muestras (2-8°C).
            No consumir antiparasitarios 15 días antes.
            Dieta rica en fibras 3 días antes.
            Traer las muestras en frascos estériles."
)

-- PROBLEMAS:
-- ❌ No puedes ordenar por prioridad
-- ❌ No puedes reutilizar "Refrigerar muestras" para otras prácticas
-- ❌ No puedes filtrar por tipo de indicación
-- ❌ Difícil de leer/mantener

-- OPCIÓN B: Múltiples columnas ❌
PRACTICA (
    id_indicacion_1,
    id_indicacion_2,
    id_indicacion_3,
    id_indicacion_4,
    id_indicacion_5
)

-- PROBLEMAS:
-- ❌ ¿Qué pasa si necesitas 10 indicaciones?
-- ❌ Esquema rígido (no escalable)
-- ❌ Muchos NULLs
```

#### ✅ Con Grupos Intermedios (M:N)

```sql
-- Paso 1: Crear el grupo
INSERT INTO GRUPO (nombre) VALUES ('Parasitológico Seriado');
-- id_grupo: 977

-- Paso 2: Crear indicaciones individuales (REUTILIZABLES)
INSERT INTO INDICACION VALUES (441, 'Recolectar materia fecal durante 7 días consecutivos', 'GENERAL', 1);
INSERT INTO INDICACION VALUES (442, 'Refrigerar las muestras (2-8°C)', 'GENERAL', 2);
INSERT INTO INDICACION VALUES (443, 'No consumir antiparasitarios 15 días antes', 'MEDICACION', 1);
INSERT INTO INDICACION VALUES (444, 'Dieta rica en fibras 3 días antes', 'GENERAL', 3);
INSERT INTO INDICACION VALUES (445, 'Traer las muestras en frascos estériles', 'GENERAL', 4);

-- Paso 3: Asociar indicaciones al grupo (CON ORDEN)
INSERT INTO GRUPO_INDICACION VALUES (977, 441, 1, true);  -- orden 1
INSERT INTO GRUPO_INDICACION VALUES (977, 443, 2, true);  -- orden 2 (más importante)
INSERT INTO GRUPO_INDICACION VALUES (977, 444, 3, true);  -- orden 3
INSERT INTO GRUPO_INDICACION VALUES (977, 442, 4, true);  -- orden 4
INSERT INTO GRUPO_INDICACION VALUES (977, 445, 5, true);  -- orden 5

-- Paso 4: Asociar práctica al grupo
INSERT INTO PRACTICA_GRUPO VALUES (4332, 977, true);
-- PRACTICA "Parasitológico Seriado" → GRUPO 977

-- VENTAJAS:
-- ✅ Cada indicación es independiente y reutilizable
-- ✅ Orden configurable (prioridad)
-- ✅ Puedes agregar/quitar indicaciones dinámicamente
-- ✅ "Refrigerar muestras" puede usarse en otros grupos
-- ✅ Puedes filtrar por tipo (MEDICACION, GENERAL, etc.)
-- ✅ Escalable a N indicaciones
```

**Reutilización en acción:**

```sql
-- Otras prácticas que también necesitan refrigeración
INSERT INTO GRUPO_INDICACION VALUES (980, 442, 2, true);  -- Grupo "Orina 24h"
INSERT INTO GRUPO_INDICACION VALUES (985, 442, 3, true);  -- Grupo "Cultivos"

-- ✅ La indicación 442 ("Refrigerar...") se usa en 3 grupos diferentes
-- ✅ Si cambias el texto, se actualiza en los 3 lugares automáticamente
```

---

## Ventajas del Sistema de Grupos

### 1. 🎯 Desacoplamiento

```
PRÁCTICA ← (independiente) → GRUPO ← (independiente) → INDICACIÓN
```

**Beneficios:**
- Puedes cambiar prácticas sin tocar indicaciones
- Puedes cambiar indicaciones sin tocar prácticas
- Puedes cambiar grupos sin afectar las relaciones existentes

**Ejemplo:**
```sql
-- Cambiar texto de una indicación
UPDATE INDICACION
SET texto = 'Concurrir con 12 horas de ayuno (nuevo texto)'
WHERE id_indicacion = 441;

-- ✅ Automáticamente afecta a TODAS las prácticas que usan esa indicación
-- ✅ No necesitas tocar 300 registros
```

---

### 2. 🔄 Reutilización Extrema

```sql
-- Estadística real del sistema:
-- 847 prácticas
-- 140 indicaciones
-- 666 grupos

-- Ratio: 847 / 140 = ~6 prácticas por indicación
-- ✅ Cada indicación se reutiliza 6 veces en promedio

-- Con relación directa necesitarías:
-- 847 indicaciones (muchas duplicadas)
-- Desperdicio: 847 - 140 = 707 registros innecesarios
```

---

### 3. 📊 Metadatos en Grupos

```sql
GRUPO (
    horas_ayuno,     -- ✅ Ayuda a resolver conflictos
    tipo_orina,      -- ✅ Valida compatibilidad
    horas_orina      -- ✅ Calcula tiempos
)
```

**Ejemplo de resolución automática:**

```sql
-- Paciente con 3 prácticas:
SELECT MAX(g.horas_ayuno) as ayuno_requerido
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO g ON pg.id_grupo = g.id_grupo
WHERE p.id_practica IN (1, 5, 10);

-- Resultado: 12 horas
-- ✅ Automático: el sistema sabe que 12h > 8h
```

---

### 4. 🕒 Soft Delete e Historial

```sql
-- NO borras, DESACTIVAS
UPDATE PRACTICA_GRUPO
SET activo = false
WHERE id_practica = 123;

-- VENTAJAS:
-- ✅ Puedes reactivar si fue un error
-- ✅ Mantienes auditoría
-- ✅ Sabes qué indicaciones tuvo el paciente históricamente
-- ✅ Reportes: "¿Cuántas veces se anuló HEMOGRAMA este mes?"
```

---

### 5. 🚀 Performance

```sql
-- Consulta optimizada con grupos (1 query):
SELECT DISTINCT i.texto
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO g ON pg.id_grupo = g.id_grupo
JOIN GRUPO_INDICACION gi ON g.id_grupo = gi.id_grupo
JOIN INDICACION i ON gi.id_indicacion = i.id_indicacion
WHERE p.id_practica IN (1,2,3,4,5)
  AND pg.activo = true
  AND gi.activo = true;

-- ✅ Complejidad: O(N) con índices
-- ✅ Joins eficientes (foreign keys indexadas)
-- ✅ Escalable a 10,000 prácticas
```

---

## Desventajas y Limitaciones

### 1. ⚠️ Complejidad Inicial

**Desventaja:**
- Requiere entender 5 tablas en lugar de 2
- Joins múltiples (3-4 joins por consulta)
- Curva de aprendizaje más alta

**Mitigación:**
- ✅ Documentación exhaustiva (este documento)
- ✅ ORM (Prisma) simplifica los joins
- ✅ Vistas SQL para consultas comunes

```sql
-- Crear vista para simplificar:
CREATE VIEW practicas_con_indicaciones AS
SELECT
    p.id_practica,
    p.nombre as practica,
    g.nombre as grupo,
    g.horas_ayuno,
    i.texto as indicacion
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO g ON pg.id_grupo = g.id_grupo
JOIN GRUPO_INDICACION gi ON g.id_grupo = gi.id_grupo
JOIN INDICACION i ON gi.id_indicacion = i.id_indicacion
WHERE pg.activo = true AND gi.activo = true;

-- Ahora la consulta es simple:
SELECT * FROM practicas_con_indicaciones
WHERE id_practica IN (1,2,3);
```

---

### 2. ⚠️ Configuración Inicial

**Desventaja:**
- Necesitas configurar grupos antes de asignar prácticas
- No puedes tener práctica sin grupo (o tendrías que permitir NULL)
- Más pasos para crear una práctica nueva

**Mitigación:**
- ✅ Grupo "Sin indicaciones" por defecto
- ✅ Interfaz web que automatiza la creación
- ✅ Importación masiva desde Excel

```sql
-- Grupo por defecto para prácticas sin requisitos
INSERT INTO GRUPO (nombre) VALUES ('Sin requisitos especiales');
-- id: 999

-- Asignar automáticamente si no se especifica grupo
INSERT INTO PRACTICA_GRUPO (id_practica, id_grupo)
VALUES (NEW.id_practica, 999);
```

---

### 3. ⚠️ Posible Sobre-Normalización

**Desventaja:**
- Algunas prácticas realmente son 1:1 con una indicación
- Crear un grupo para una sola práctica puede parecer excesivo

**Ejemplo:**
```
PRUEBA ESPECÍFICA XYZ
└─ Solo la hace este laboratorio
└─ Solo tiene 1 indicación muy particular
└─ Nunca se va a reutilizar

¿Realmente necesita un grupo? 🤔
```

**Mitigación:**
- ✅ El sistema permite grupos de 1 sola práctica
- ✅ Si después aparece otra práctica similar, ya tienes el grupo
- ✅ Mantiene consistencia arquitectónica

---

### 4. ⚠️ Performance en Casos Extremos

**Desventaja:**
- Si un paciente tiene 100 prácticas diferentes
- Con 10 indicaciones promedio cada una
- Estás juntando 1000 indicaciones

**Mitigación:**
- ✅ Índices en foreign keys
- ✅ Paginación en la interfaz
- ✅ Caché de resultados comunes
- ✅ En la práctica: raro que un paciente tenga >20 prácticas

```sql
-- Índices críticos:
CREATE INDEX idx_practica_grupo ON PRACTICA_GRUPO(id_practica, id_grupo);
CREATE INDEX idx_grupo_indicacion ON GRUPO_INDICACION(id_grupo, id_indicacion);
CREATE INDEX idx_activo_pg ON PRACTICA_GRUPO(activo);
CREATE INDEX idx_activo_gi ON GRUPO_INDICACION(activo);
```

---

## Ejemplos Prácticos

### Ejemplo 1: Perfil Bioquímico Completo

```
Médico solicita: PERFIL BIOQUÍMICO
Incluye: GLUCEMIA, UREA, CREATININA, COLESTEROL, TRIGLICÉRIDOS, TGO, TGP
```

#### Con Grupos:

```sql
-- 1. Todas comparten el mismo grupo
INSERT INTO PRACTICA_GRUPO VALUES
    (100, 101, true),  -- GLUCEMIA → Ayuno 12h
    (101, 101, true),  -- UREA → Ayuno 12h
    (102, 101, true),  -- CREATININA → Ayuno 12h
    (103, 101, true),  -- COLESTEROL → Ayuno 12h
    (104, 101, true),  -- TRIGLICÉRIDOS → Ayuno 12h
    (105, 101, true),  -- TGO → Ayuno 12h
    (106, 101, true);  -- TGP → Ayuno 12h

-- 2. El grupo 101 tiene 2 indicaciones
INSERT INTO GRUPO_INDICACION VALUES
    (101, 201, 1, true),  -- "Concurrir con 12 horas de ayuno"
    (101, 202, 2, true);  -- "Puede tomar agua"

-- 3. Consulta consolidada (SIMPLE):
SELECT DISTINCT i.texto
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO_INDICACION gi ON pg.id_grupo = gi.id_grupo
JOIN INDICACION i ON gi.id_indicacion = i.id_indicacion
WHERE p.id_practica IN (100,101,102,103,104,105,106)
ORDER BY gi.orden;

-- RESULTADO:
-- 1. Concurrir con 12 horas de ayuno
-- 2. Puede tomar agua

-- ✅ 7 prácticas → 1 grupo → 2 indicaciones
-- ✅ Sin duplicados
-- ✅ Fácil de modificar
```

---

### Ejemplo 2: Estudios de Orina

```
Médico solicita: ORINA COMPLETA + UROCULTIVO + CLEARANCE DE CREATININA
```

#### Con Grupos:

```sql
-- Prácticas con diferentes requisitos de orina:
-- ORINA COMPLETA → Primera orina de la mañana
-- UROCULTIVO → Primera orina de la mañana
-- CLEARANCE → Orina de 24 horas

-- Grupos:
-- Grupo 200: "Primera orina mañana"
-- Grupo 201: "Orina 24 horas"

INSERT INTO PRACTICA_GRUPO VALUES
    (200, 200, true),  -- ORINA COMPLETA → Grupo 200
    (201, 200, true),  -- UROCULTIVO → Grupo 200
    (202, 201, true);  -- CLEARANCE → Grupo 201

-- Indicaciones del Grupo 200:
INSERT INTO GRUPO_INDICACION VALUES
    (200, 301, 1, true);  -- "Recolectar primera orina de la mañana"

-- Indicaciones del Grupo 201:
INSERT INTO GRUPO_INDICACION VALUES
    (201, 302, 1, true),  -- "Recolectar orina durante 24 horas"
    (201, 303, 2, true);  -- "Refrigerar las muestras"

-- Consulta:
SELECT g.nombre, i.texto
FROM PRACTICA p
JOIN PRACTICA_GRUPO pg ON p.id_practica = pg.id_practica
JOIN GRUPO g ON pg.id_grupo = g.id_grupo
JOIN GRUPO_INDICACION gi ON g.id_grupo = gi.id_grupo
JOIN INDICACION i ON gi.id_indicacion = i.id_indicacion
WHERE p.id_practica IN (200, 201, 202);

-- RESULTADO CONSOLIDADO:
-- Grupo "Primera orina mañana" (2 prácticas):
--   1. Recolectar primera orina de la mañana
--
-- Grupo "Orina 24 horas" (1 práctica):
--   1. Recolectar orina durante 24 horas
--   2. Refrigerar las muestras

-- ✅ Sistema detecta que hay 2 tipos de orina diferentes
-- ✅ Agrupa automáticamente
-- ✅ Paciente recibe instrucciones claras para cada tipo
```

---

### Ejemplo 3: Cambio de Requisitos

```
Escenario: El laboratorio decide cambiar el texto de ayuno
```

#### ❌ Con Relación Directa:

```sql
-- Tienes que actualizar 300 registros:
UPDATE INDICACION
SET texto = 'Concurrir con 12 horas de ayuno (actualizado)'
WHERE texto = 'Concurrir con 12 horas de ayuno';

-- RIESGOS:
-- ❌ ¿Y si hay variaciones del texto?
--    - "Concurrir con 12 horas de ayuno."
--    - "Concurrir con 12 horas de ayuno "  (espacio extra)
--    - "concurrir con 12 horas de ayuno"   (minúscula)
-- ❌ Podrías actualizar solo 280 de 300
-- ❌ Inconsistencias en el sistema
```

#### ✅ Con Grupos:

```sql
-- Actualizas 1 SOLO registro:
UPDATE INDICACION
SET texto = 'Concurrir con 12 horas de ayuno (actualizado)'
WHERE id_indicacion = 201;

-- ✅ Todas las 300 prácticas ven el cambio INSTANTÁNEAMENTE
-- ✅ Cero riesgo de inconsistencias
-- ✅ Auditable (sabes cuándo cambió)
```

---

## Conclusión

### ¿Por Qué Grupos Intermedios?

El sistema de **grupos intermedios** fue diseñado específicamente para el contexto de un **laboratorio clínico real** donde:

1. **Hay cambios constantes**
   - Médicos agregan/quitan prácticas diariamente
   - Necesitas historial de cambios
   - Performance es crítica (100+ pacientes/día)

2. **La reutilización es clave**
   - 847 prácticas comparten 140 indicaciones
   - Cambiar un texto afecta a cientos de prácticas
   - Mantenimiento centralizado

3. **Las relaciones son M:N**
   - Una práctica puede tener múltiples indicaciones
   - Una indicación se usa en múltiples prácticas
   - Los grupos son el pegamento lógico

4. **Necesitas metadatos**
   - Ayuno máximo, tipo de orina, horarios
   - Resolución automática de conflictos
   - Validaciones de compatibilidad

### ¿Cuándo Usar Relación Directa?

La relación directa (1:1) solo tiene sentido si:

- ❌ Tienes < 50 prácticas (escala pequeña)
- ❌ Las indicaciones NUNCA se reutilizan
- ❌ No hay cambios dinámicos
- ❌ No necesitas múltiples indicaciones por práctica
- ❌ No te importa la duplicación de datos

**En la práctica, estos escenarios son muy raros en un laboratorio real.**

---

### Resultado Final

```
Sistema Actual (v1.7.0):
├─ 847 prácticas
├─ 666 grupos
├─ 140 indicaciones
├─ 96.9% de cobertura
└─ ✅ Funcionando en producción

Métricas de eficiencia:
├─ Reutilización: 6.05 prácticas/indicación
├─ Ahorro de espacio: 707 indicaciones no duplicadas
├─ Performance: < 100ms para consultas complejas
└─ Mantenimiento: 1 update afecta 300+ prácticas
```

**El modelo de grupos intermedios es la elección correcta para este sistema.** ✅

---

*Documento creado para explicar la arquitectura de la base de datos*
*Sistema de Indicaciones de Laboratorio v1.7.0*
*26 de Octubre 2025*
