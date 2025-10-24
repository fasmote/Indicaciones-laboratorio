// ====================================
// CONSTANTES DEL SISTEMA
// ====================================
//
// Este archivo centraliza todas las constantes utilizadas en el sistema.
// Facilita el mantenimiento y evita "magic numbers" en el código.
//
// ⭐ EXPLICACIÓN EDUCATIVA:
// En vez de usar valores "hardcodeados" como:
//   if (indicacion.tipo === 'AYUNO') { ... }
//
// Usamos constantes:
//   if (indicacion.tipo === TIPOS_INDICACION.AYUNO) { ... }
//
// Ventajas:
// - Autocomplete del editor
// - Errores de typo detectados antes
// - Cambios centralizados
// - Código más legible
//
// ====================================

// ====================================
// TIPOS DE INDICACIONES
// ====================================
const TIPOS_INDICACION = {
  AYUNO: 'AYUNO',
  ORINA: 'ORINA',
  MATERIA_FECAL: 'MATERIA_FECAL',
  GENERAL: 'GENERAL',
  MEDICACION: 'MEDICACION',
  HORARIO: 'HORARIO',
  FUM: 'FUM', // Fecha Última Menstruación
  RESTRICCION: 'RESTRICCION'
};

// ====================================
// TIPOS DE ORINA
// ====================================
const TIPOS_ORINA = {
  PRIMERA_ORINA: 'PRIMERA_ORINA',
  ORINA_12H: 'ORINA_12H',
  ORINA_24H: 'ORINA_24H',
  ORINA_2H: 'ORINA_2H'
};

// Mapeo de horas a tipos
const HORAS_ORINA_MAP = {
  '-1': TIPOS_ORINA.PRIMERA_ORINA,
  '2': TIPOS_ORINA.ORINA_2H,
  '12': TIPOS_ORINA.ORINA_12H,
  '24': TIPOS_ORINA.ORINA_24H
};

// ====================================
// VALORES DE AYUNO (en horas)
// ====================================
const HORAS_AYUNO = {
  AYUNO_3H: 3,
  AYUNO_4H: 4,
  AYUNO_8H: 8
};

// ====================================
// ÁREAS DE LABORATORIO
// ====================================
const AREAS_LABORATORIO = {
  VIROLOGIA: 'VIROLOGIA',
  QUIMICA: 'QUIMICA',
  BACTERIO: 'BACTERIO',
  ENDOCRINO: 'ENDOCRINO',
  PARASITO: 'PARASITO',
  HEMATO_HEMOSTASIA: 'HEMATO/HEMOSTASIA',
  INMUNOLOGIA: 'INMUNOLOGIA',
  URGENCIAS_LIQUIDOS: 'URGENCIAS Y LIQUIDOS',
  GENETICA: 'GENETICA',
  MICO: 'MICO'
};

// ====================================
// ORDEN DE PRESENTACIÓN DE INDICACIONES
// ====================================
//
// Define el orden en que se presentan las indicaciones al paciente
// Menor número = Mayor prioridad (se muestra primero)
//
const ORDEN_PRESENTACION = {
  [TIPOS_INDICACION.AYUNO]: 1,
  [TIPOS_INDICACION.HORARIO]: 2,
  [TIPOS_INDICACION.FUM]: 3,
  [TIPOS_INDICACION.MEDICACION]: 4,
  [TIPOS_INDICACION.ORINA]: 5,
  [TIPOS_INDICACION.MATERIA_FECAL]: 6,
  [TIPOS_INDICACION.GENERAL]: 7,
  [TIPOS_INDICACION.RESTRICCION]: 8
};

// ====================================
// MENSAJES DEL SISTEMA
// ====================================
const MENSAJES = {
  ERROR: {
    PRACTICA_NO_ENCONTRADA: 'Práctica no encontrada',
    GRUPO_NO_ENCONTRADO: 'Grupo no encontrado',
    INDICACION_NO_ENCONTRADA: 'Indicación no encontrada',
    CAMPO_REQUERIDO: 'Este campo es requerido',
    CODIGO_DID_DUPLICADO: 'Ya existe una práctica con ese código DID',
    CONFLICTO_ORINA: 'Las prácticas seleccionadas requieren tipos de orina incompatibles',
    SIN_INDICACIONES: 'Las prácticas seleccionadas no tienen indicaciones configuradas',
    PRACTICA_INACTIVA: 'La práctica está inactiva',
    ERROR_BD: 'Error de base de datos',
    ERROR_INTERNO: 'Error interno del servidor'
  },
  EXITO: {
    PRACTICA_CREADA: 'Práctica creada exitosamente',
    PRACTICA_ACTUALIZADA: 'Práctica actualizada exitosamente',
    PRACTICA_ELIMINADA: 'Práctica eliminada exitosamente',
    GRUPO_CREADO: 'Grupo creado exitosamente',
    GRUPO_ACTUALIZADO: 'Grupo actualizado exitosamente',
    GRUPO_ELIMINADO: 'Grupo eliminado exitosamente',
    INDICACION_CREADA: 'Indicación creada exitosamente',
    INDICACION_ACTUALIZADA: 'Indicación actualizada exitosamente',
    INDICACION_ELIMINADA: 'Indicación eliminada exitosamente',
    IMPORTACION_EXITOSA: 'Datos importados exitosamente'
  }
};

// ====================================
// LÍMITES Y CONFIGURACIÓN
// ====================================
const LIMITES = {
  MAX_PRACTICAS_SELECCION: 50, // Máximo de prácticas en una selección
  MAX_LONGITUD_NOMBRE: 500,
  MAX_LONGITUD_DESCRIPCION: 5000,
  PAGINACION_DEFAULT: 20, // Resultados por página por defecto
  PAGINACION_MAX: 10000 // Máximo de resultados por página
};

// ====================================
// CÓDIGOS HTTP
// ====================================
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// ====================================
// CONFIGURACIÓN DE IMPORTACIÓN
// ====================================
const CONFIG_IMPORTACION = {
  HOJA_PRACTICAS: 'PRACTICAS',
  HOJA_GRUPOS: 'GruposOriginales',
  HOJA_CASOS_USO: 'CASOS DE USO',

  // Columnas del Excel
  COLUMNAS: {
    ID_PRACTICA: 'ID_PRACTICA',
    DESCRIPCION: 'DESCRIPCION CONSENSUADA',
    DID: 'DID',
    AREA: 'AREA',
    INDICACIONES: 'INDICACIONES PARA EL PACIENTE',
    GRUPO_ID: 'GRUPO',
    GRUPO_NOMBRE: 'CONJUNTO DE INDICACIONES [62]',
    ID_PRACTICAS_GRUPO: 'ID_Practicas'
  }
};

// ====================================
// EXPRESIONES REGULARES
// ====================================
const REGEX = {
  CODIGO_DID: /^\d{10,20}$/, // Código DID: 10-20 dígitos
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validar email (futuro)
  SOLO_NUMEROS: /^\d+$/,
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
};

// ====================================
// EXPORTAR TODAS LAS CONSTANTES
// ====================================
module.exports = {
  TIPOS_INDICACION,
  TIPOS_ORINA,
  HORAS_ORINA_MAP,
  HORAS_AYUNO,
  AREAS_LABORATORIO,
  ORDEN_PRESENTACION,
  MENSAJES,
  LIMITES,
  HTTP_STATUS,
  CONFIG_IMPORTACION,
  REGEX
};

// ====================================
// EJEMPLO DE USO
// ====================================
//
// const { TIPOS_INDICACION, MENSAJES, HTTP_STATUS } = require('./config/constants');
//
// // Validar tipo
// if (indicacion.tipo === TIPOS_INDICACION.AYUNO) {
//   console.log('Es una indicación de ayuno');
// }
//
// // Responder con mensaje
// res.status(HTTP_STATUS.NOT_FOUND).json({
//   success: false,
//   error: MENSAJES.ERROR.PRACTICA_NO_ENCONTRADA
// });
//
// ====================================
