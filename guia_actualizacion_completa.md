# 🔧 Guía de Actualización - Sistema de Vinculaciones

## 📌 Resumen

Esta actualización permite **vincular prácticas a grupos** y **vincular indicaciones a grupos** desde la interfaz web, completando la funcionalidad del sistema.

---

## ✅ Paso 1: Actualizar el Controller de Grupos

### Archivo: `src/controllers/gruposController.js`

**Acción:** Agregar dos nuevas funciones al final del archivo (después de la función `generarIndicaciones`).

```javascript
// AGREGAR AL FINAL DEL ARCHIVO

// Vincular indicación a grupo
export const vincularIndicacion = async (req, res) => {
    try {
        const { grupoId, indicacionId, orden } = req.body;

        if (!grupoId || !indicacionId) {
            return res.status(400).json({
                success: false,
                message: 'ID de grupo e indicación son requeridos'
            });
        }

        // Verificar si ya existe la vinculación
        const existente = await prisma.grupoIndicacion.findFirst({
            where: {
                idGrupo: parseInt(grupoId),
                idIndicacion: parseInt(indicacionId)
            }
        });

        if (existente) {
            return res.status(400).json({
                success: false,
                message: 'La indicación ya está vinculada a este grupo'
            });
        }

        // Crear la vinculación
        const vinculacion = await prisma.grupoIndicacion.create({
            data: {
                idGrupo: parseInt(grupoId),
                idIndicacion: parseInt(indicacionId),
                orden: orden ? parseInt(orden) : 1
            },
            include: {
                indicacion: true,
                grupo: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Indicación vinculada al grupo exitosamente',
            data: vinculacion
        });
    } catch (error) {
        console.error('Error vinculando indicación:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error al vincular la indicación',
            error: error.message
        });
    }
};

// Desvincular indicación de grupo
export const desvincularIndicacion = async (req, res) => {
    try {
        const { grupoId, indicacionId } = req.body;

        if (!grupoId || !indicacionId) {
            return res.status(400).json({
                success: false,
                message: 'ID de grupo e indicación son requeridos'
            });
        }

        await prisma.grupoIndicacion.deleteMany({
            where: {
                idGrupo: parseInt(grupoId),
                idIndicacion: parseInt(indicacionId)
            }
        });

        res.json({
            success: true,
            message: 'Indicación desvinculada del grupo exitosamente'
        });
    } catch (error) {
        console.error('Error desvinculando indicación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al desvincular la indicación',
            error: error.message
        });
    }
};
```

---

## ✅ Paso 2: Actualizar las Rutas de Grupos

### Archivo: `src/routes/grupos.js`

**Acción:** Reemplazar TODO el contenido del archivo con este código:

```javascript
import express from 'express';
import {
    getGrupos,
    getGrupoById,
    createGrupo,
    vincularPractica,
    vincularIndicacion,
    desvincularIndicacion,
    generarIndicaciones
} from '../controllers/gruposController.js';

const router = express.Router();

// GET /api/grupos - Obtener todos los grupos
router.get('/', getGrupos);

// GET /api/grupos/:id - Obtener un grupo por ID
router.get('/:id', getGrupoById);

// POST /api/grupos - Crear nuevo grupo
router.post('/', createGrupo);

// POST /api/grupos/vincular-practica - Vincular práctica a grupo
router.post('/vincular-practica', vincularPractica);

// POST /api/grupos/vincular-indicacion - Vincular indicación a grupo
router.post('/vincular-indicacion', vincularIndicacion);

// DELETE /api/grupos/desvincular-indicacion - Desvincular indicación de grupo
router.delete('/desvincular-indicacion', desvincularIndicacion);

// POST /api/grupos/generar-indicaciones - Generar indicaciones para múltiples prácticas
router.post('/generar-indicaciones', generarIndicaciones);

export default router;
```

---

## ✅ Paso 3: Actualizar la Interfaz Web

### Archivo: `public/index.html`

**Acción:** Reemplazar TODO el contenido del archivo con el código del artefacto **"interfaz_mejorada_vinculos"**.

> ⚠️ **IMPORTANTE**: Copia TODO el contenido del artefacto, desde `<!DOCTYPE html>` hasta `</html>`

---

## ✅ Paso 4: Reiniciar el Servidor

1. Si el servidor está corriendo, detenlo con **Ctrl+C**

2. Inicia el servidor nuevamente:
   ```bash
   npm run dev
   ```

3. Abre tu navegador en: **http://localhost:3000**

---

## 🎯 Funcionalidades Nuevas

Después de actualizar, podrás:

### 1. **Pestaña "Vincular" - Práctica → Grupo**
- Seleccionar una práctica del dropdown
- Seleccionar un grupo del dropdown
- Hacer clic en "Vincular Práctica a Grupo"
- Ver confirmación de vinculación exitosa

### 2. **Pestaña "Vincular" - Indicación → Grupo**
- Seleccionar un grupo del dropdown
- Marcar checkboxes de las indicaciones que deseas vincular
- Hacer clic en "Vincular Indicaciones Seleccionadas"
- Ver la lista de indicaciones vinculadas al grupo seleccionado

---

## 🧪 Ejemplo Práctico: Vincular "Seriado de Materia Fecal"

### Paso 1: Crear el Grupo Específico
1. Ir a pestaña **"Grupos"**
2. Llenar el formulario:
   - **Nombre:** SERIADO_MF_ESPECIFICO
   - **Descripción:** Preparación específica para seriado de materia fecal
   - **Ayuno:** (dejar vacío)
   - **Orina:** Sin orina
3. Clic en **"Crear Grupo"**

### Paso 2: Crear las Indicaciones Específicas
1. Ir a pestaña **"Indicaciones"**
2. Crear primera indicación:
   - **Descripción:** Recolección seriado MF - 3 muestras
   - **Instrucción:** Recolectar 3 muestras de materia fecal en días alternos (día 1, día 3, día 5)...
   - **Tipo:** ESPECIFICA
   - **Área:** BACTERIOLOGIA
3. Repetir para cada indicación necesaria

### Paso 3: Vincular Indicaciones al Grupo
1. Ir a pestaña **"Vincular"**
2. En la sección **"Vincular Indicación → Grupo"**:
   - Seleccionar grupo: **SERIADO_MF_ESPECIFICO**
   - Marcar las 3 indicaciones creadas
   - Clic en **"Vincular Indicaciones Seleccionadas"**

### Paso 4: Vincular la Práctica al Grupo
1. En la sección **"Vincular Práctica → Grupo"**:
   - Seleccionar práctica: **Seriado de Materia Fecal**
   - Seleccionar grupo: **SERIADO_MF_ESPECIFICO**
   - Clic en **"Vincular Práctica a Grupo"**

### Paso 5: Probar en el Simulador
1. Ir a pestaña **"Simulador"**
2. Marcar checkbox de **"Seriado de Materia Fecal"**
3. Clic en **"Generar Indicaciones"**
4. Ver las indicaciones específicas generadas

---

## 🔍 Verificación

Para verificar que todo funciona:

1. **Test de Vinculación Práctica-Grupo:**
   - Crear una práctica de prueba
   - Crear un grupo de prueba
   - Vincular ambos
   - Verificar en el simulador

2. **Test de Vinculación Indicación-Grupo:**
   - Seleccionar un grupo existente
   - Vincular 2-3 indicaciones
   - Verificar que aparecen en "Indicaciones del Grupo"

3. **Test del Simulador Completo:**
   - Seleccionar múltiples prácticas
   - Generar indicaciones
   - Verificar que se eliminan duplicados
   - Verificar que se toma el ayuno máximo

---

## ⚠️ Solución de Problemas

### Error: "Cannot find module vincularIndicacion"
**Solución:** Verifica que agregaste las funciones al controller Y las importaste en las rutas.

### Error: "vincularIndicacion is not a function"
**Solución:** Asegúrate de usar `export const` (no `export default`) en el controller.

### La interfaz no carga
**Solución:** Verifica que copiaste TODO el HTML del artefacto, incluyendo el `<script>`.

### No aparecen las prácticas/grupos en los dropdowns
**Solución:** 
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Verifica que el servidor esté corriendo
4. Prueba acceder a: http://localhost:3000/api/practicas

---

## 📞 Próximos Pasos

Una vez que tengas el sistema funcionando con vinculaciones, podrás:

1. ✅ **Importar datos reales del Excel** usando el script de importación
2. ✅ **Vincular masivamente** prácticas y grupos
3. ✅ **Probar casos complejos** de múltiples prácticas
4. ✅ **Implementar reglas alternativas** con la tabla GRUPOS_ALTERNATIVOS

---

## 💡 Consejo

Si algo no funciona, revisa en orden:
1. ¿El servidor está corriendo? (npm run dev)
2. ¿Hay errores en la terminal donde corre el servidor?
3. ¿Hay errores en la consola del navegador? (F12 → Console)
4. ¿Los archivos fueron actualizados correctamente?

¡Buena suerte! 🚀
