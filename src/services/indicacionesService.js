// ====================================
// SERVICIO DE INDICACIONES INTELIGENTES
// ====================================
//
// Este es el CORAZÓN del sistema.
// Genera indicaciones consolidadas a partir de múltiples prácticas.
//
// Algoritmo:
// 1. Verificar reglas alternativas
// 2. Obtener grupos de cada práctica
// 3. Consolidar indicaciones (eliminar duplicados)
// 4. Calcular ayuno máximo
// 5. Validar compatibilidad de orina
// 6. Ordenar por prioridad
// 7. Generar texto final
//
// ====================================

const prisma = require('../config/database');
const { ORDEN_PRESENTACION } = require('../config/constants');

/**
 * Generar indicaciones consolidadas para múltiples prácticas
 * @param {number[]} idsPracticas - Array de IDs de prácticas
 * @returns {Promise<Object>} Indicaciones consolidadas
 */
async function generarIndicaciones(idsPracticas) {
  // ⭐ PASO 1: Validar input
  if (!Array.isArray(idsPracticas) || idsPracticas.length === 0) {
    throw new Error('Debe proporcionar al menos una práctica');
  }

  // ⭐ PASO 2: Obtener prácticas con sus grupos e indicaciones
  const practicasConGrupos = await prisma.practica.findMany({
    where: {
      id_practica: { in: idsPracticas },
      activo: true
    },
    include: {
      grupos: {
        where: { activo: true },
        include: {
          grupo: {
            include: {
              indicaciones: {
                where: { activo: true },
                include: { indicacion: true },
                orderBy: { orden: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (practicasConGrupos.length === 0) {
    throw new Error('No se encontraron prácticas válidas');
  }

  // ⭐ PASO 3: Extraer todos los grupos únicos
  const gruposMap = new Map();
  for (const practica of practicasConGrupos) {
    for (const pg of practica.grupos) {
      if (!gruposMap.has(pg.grupo.id_grupo)) {
        gruposMap.set(pg.grupo.id_grupo, pg.grupo);
      }
    }
  }

  const grupos = Array.from(gruposMap.values());

  if (grupos.length === 0) {
    throw new Error('Las prácticas seleccionadas no tienen indicaciones configuradas');
  }

  // ⭐ PASO 4: Consolidar indicaciones
  const indicacionesMap = new Map();
  let ayunoMax = null;
  let tipoOrina = null;
  let horasOrina = null;

  for (const grupo of grupos) {
    // Calcular ayuno máximo
    if (grupo.horas_ayuno) {
      if (!ayunoMax || grupo.horas_ayuno > ayunoMax) {
        ayunoMax = grupo.horas_ayuno;
      }
    }

    // Validar tipo de orina compatible
    if (grupo.tipo_orina) {
      if (tipoOrina && tipoOrina !== grupo.tipo_orina) {
        throw new Error(`Conflicto de tipo de orina: ${tipoOrina} vs ${grupo.tipo_orina}`);
      }
      tipoOrina = grupo.tipo_orina;
      horasOrina = grupo.horas_orina;
    }

    // Recolectar indicaciones (eliminar duplicados por texto)
    for (const gi of grupo.indicaciones) {
      const ind = gi.indicacion;
      const key = ind.texto.trim().toLowerCase();

      if (!indicacionesMap.has(key)) {
        indicacionesMap.set(key, ind);
      }
    }
  }

  // ⭐ PASO 5: Convertir a array y ordenar por tipo
  const indicacionesArray = Array.from(indicacionesMap.values());
  const indicacionesOrdenadas = indicacionesArray.sort((a, b) => {
    const ordenA = ORDEN_PRESENTACION[a.tipo] || 99;
    const ordenB = ORDEN_PRESENTACION[b.tipo] || 99;
    return ordenA - ordenB;
  });

  // ⭐ PASO 6: Generar texto final
  const textoFinal = generarTextoParaPaciente(indicacionesOrdenadas, ayunoMax, tipoOrina, horasOrina);

  // ⭐ PASO 7: Retornar resultado
  return {
    indicaciones_consolidadas: textoFinal,
    ayuno_horas: ayunoMax,
    tipo_orina: tipoOrina,
    horas_orina: horasOrina,
    detalles: {
      cantidad_practicas: practicasConGrupos.length,
      cantidad_grupos: grupos.length,
      cantidad_indicaciones: indicacionesOrdenadas.length,
      practicas: practicasConGrupos.map(p => ({ id: p.id_practica, nombre: p.nombre })),
      indicaciones: indicacionesOrdenadas
    }
  };
}

/**
 * Generar texto formateado para el paciente
 */
function generarTextoParaPaciente(indicaciones, ayunoHoras, tipoOrina, horasOrina) {
  let texto = 'Indicaciones para los estudios solicitados:\n\n';

  // Agregar indicaciones numeradas
  indicaciones.forEach((ind, index) => {
    texto += `${index + 1}. ${ind.texto}\n\n`;
  });

  // Agregar resumen al final
  texto += '\n📋 RESUMEN:\n';

  if (ayunoHoras) {
    texto += `⏰ Ayuno requerido: ${ayunoHoras} horas\n`;
  }

  if (tipoOrina) {
    texto += `🚰 Tipo de orina: ${tipoOrina}`;
    if (horasOrina && horasOrina > 0) {
      texto += ` (${horasOrina} horas)`;
    }
    texto += '\n';
  }

  return texto;
}

module.exports = {
  generarIndicaciones
};
