# 🏥 Sistema de Indicaciones de Laboratorio

Sistema prototipo para la gestión inteligente de indicaciones compatibles en laboratorios clínicos.

## 📋 Descripción

Este proyecto implementa un sistema que permite:
- **Gestión de Prácticas**: ABM de estudios de laboratorio
- **Grupos de Indicaciones**: Agrupación lógica de indicaciones por tipo de preparación
- **Indicaciones Inteligentes**: Generación automática de indicaciones compatibles
- **Reglas de Compatibilidad**: Manejo de casos especiales cuando se combinan múltiples estudios
- **Simulador**: Interfaz web para probar la generación de indicaciones

## 🏗️ Arquitectura

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite con Prisma ORM
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **API**: REST con endpoints para todas las operaciones CRUD

## 📊 Modelo de Datos

El sistema se basa en las siguientes entidades principales:
- **PRACTICA**: Estudios de laboratorio (ej: Glucemia, Hemograma)
- **GRUPO**: Agrupaciones de indicaciones (ej: Ayuno 8h, Primera orina)
- **INDICACION**: Instrucciones individuales para pacientes
- **PRACTICA_GRUPO**: Relación M:N entre prácticas y grupos
- **GRUPO_INDICACION**: Relación M:N entre grupos e indicaciones
- **GRUPOS_ALTERNATIVOS**: Reglas especiales para combinaciones de estudios

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Navegar al directorio del proyecto**
   ```bash
   cd "C:\Users\clau\Documents\DGSISAN_2025bis\Indicaciones\indicaciones-app"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Generar el cliente de Prisma y crear la base de datos**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Cargar datos de prueba**
   ```bash
   npm run db:seed
   ```

5. **Iniciar el servidor**
   ```bash
   npm run dev
   ```

El sistema estará disponible en: http://localhost:3000

## 🎯 Cómo Probar el Sistema

### 1. **Verificar que el servidor funciona**
Visita: http://localhost:3000/api/health
Deberías ver una respuesta JSON confirmando que el sistema está funcionando.

### 2. **Probar el Simulador de Indicaciones**
1. Abre http://localhost:3000 en tu navegador
2. En la pestaña **"🧪 Simulador"**:
   - Selecciona múltiples prácticas (ej: Glucemia + Perfil Lipídico)
   - Haz clic en "🚀 Generar Indicaciones"
   - Observa cómo el sistema genera indicaciones optimizadas

### 3. **Casos de Prueba Recomendados**

**Caso 1: Ayuno Máximo**
- Selecciona: "Glucemia en Ayunas" (8h) + "Perfil Lipídico" (12h)
- Resultado esperado: Ayuno de 12 horas (toma el mayor)

**Caso 2: Sin Preparación**
- Selecciona: "Hemograma Completo" + "Urea y Creatinina"
- Resultado esperado: Sin preparación especial

**Caso 3: Combinación Compleja**
- Selecciona: "Glucemia" + "Perfil Lipídico" + "Orina Completa"
- Resultado esperado: Ayuno de 12h + Recolección de primera orina

### 4. **Gestión de Datos**
- **📋 Prácticas**: Crear nuevos estudios de laboratorio
- **📁 Grupos**: Crear grupos de indicaciones con reglas de ayuno/orina
- **📝 Indicaciones**: Crear instrucciones individuales para pacientes

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor con nodemon (auto-recarga)
npm start           # Inicia servidor en producción

# Base de datos
npm run db:migrate  # Ejecuta migraciones
npm run db:generate # Genera cliente Prisma
npm run db:studio   # Abre Prisma Studio (interfaz web DB)
npm run db:seed     # Carga datos de prueba

# Utilidades
npm test            # Ejecutar tests (pendiente implementar)
```

## 📡 Endpoints de la API

### Prácticas
- `GET /api/practicas` - Listar todas las prácticas
- `GET /api/practicas/:id` - Obtener práctica por ID
- `POST /api/practicas` - Crear nueva práctica
- `PUT /api/practicas/:id` - Actualizar práctica
- `DELETE /api/practicas/:id` - Eliminar práctica (soft delete)

### Grupos
- `GET /api/grupos` - Listar todos los grupos
- `GET /api/grupos/:id` - Obtener grupo por ID
- `POST /api/grupos` - Crear nuevo grupo
- `POST /api/grupos/vincular-practica` - Vincular práctica a grupo
- `POST /api/grupos/generar-indicaciones` - Generar indicaciones para múltiples prácticas

### Indicaciones
- `GET /api/indicaciones` - Listar todas las indicaciones
- `POST /api/indicaciones` - Crear nueva indicación

### Sistema
- `GET /api/health` - Estado del sistema

## 📁 Estructura del Proyecto

```
indicaciones-app/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── indicaciones.db        # Base de datos SQLite (se genera)
├── public/
│   └── index.html            # Interfaz web
├── src/
│   ├── controllers/          # Lógica de negocio
│   │   ├── practicasController.js
│   │   └── gruposController.js
│   ├── database/            # Configuración de DB
│   │   ├── prisma.js
│   │   └── seed.js
│   ├── routes/              # Rutas de la API
│   │   ├── practicas.js
│   │   ├── grupos.js
│   │   └── indicaciones.js
│   └── server.js            # Servidor principal
├── package.json
└── README.md
```

## 🎯 Lógica de Negocio Principal

### Algoritmo de Generación de Indicaciones

1. **Recolección**: Obtiene todas las prácticas seleccionadas con sus grupos
2. **Análisis de Ayuno**: Determina el ayuno máximo requerido entre todos los grupos
3. **Análisis de Orina**: Identifica si se requiere recolección de orina y qué tipo
4. **Consolidación**: Elimina indicaciones duplicadas y las ordena por prioridad
5. **Aplicación de Reglas**: Verifica si hay reglas alternativas para las combinaciones
6. **Generación Final**: Construye la lista final de indicaciones para el paciente

### Sistema de Prioridades

- Las indicaciones tienen un campo `id_indicacion_inferior` que permite crear jerarquías
- Cuando hay conflictos, la indicación con mayor prioridad prevalece
- El ayuno siempre toma el valor máximo requerido entre todas las prácticas

## 🔧 Personalización

### Agregar Nueva Práctica
1. Usar la interfaz web o API para crear la práctica
2. Vincularla a un grupo existente o crear un grupo nuevo
3. El grupo debe tener las indicaciones apropiadas vinculadas

### Crear Reglas Alternativas
1. Identificar la combinación de grupos que requiere tratamiento especial
2. Crear un registro en `GRUPOS_ALTERNATIVOS`
3. Especificar qué grupo resultante aplicar cuando se detecte la combinación

### Modificar Lógica de Generación
- Editar `src/controllers/gruposController.js`
- Función `generarIndicaciones()` contiene toda la lógica

## 🐛 Resolución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npm run db:generate
```

### Base de datos vacía
```bash
npm run db:seed
```

### Puerto 3000 ocupado
- Cambiar `PORT` en `src/server.js` o usar variable de entorno:
```bash
PORT=3001 npm run dev
```

### Error de CORS en navegador
- Verificar que el servidor esté corriendo en el mismo puerto
- Los archivos estáticos se sirven desde `/public`

## 📈 Métricas y Monitoreo

El sistema incluye logging básico que muestra:
- Consultas a la base de datos (Prisma logs)
- Requests HTTP (Morgan middleware)
- Errores de aplicación

Para ver los logs en detalle:
```bash
npm run dev
```

## 🔄 Próximas Mejoras

- [ ] Sistema de autenticación y autorización
- [ ] Interfaz de usuario más avanzada (React/Vue)
- [ ] Reportes y estadísticas
- [ ] Importación/exportación de datos
- [ ] API más robusta con validaciones
- [ ] Tests automatizados
- [ ] Documentación de API con Swagger
- [ ] Contenedorización con Docker

## 🤝 Contribución

Este es un prototipo de demostración. Para modificaciones:
1. Hacer fork del proyecto
2. Crear rama para nuevas funcionalidades
3. Testear cambios localmente
4. Enviar pull request con descripción detallada

## 📞 Soporte

Para problemas o consultas sobre el funcionamiento del sistema, verificar:
1. Logs del servidor (`npm run dev`)
2. Estado de la base de datos (`npm run db:studio`)
3. Endpoints de la API (`/api/health`)

---

**Desarrollado para**: Sistema de Indicaciones de Laboratorio - DGSISAN 2025
**Tecnologías**: Node.js, Express, Prisma, SQLite
**Versión**: 1.0.0 (Prototipo)
