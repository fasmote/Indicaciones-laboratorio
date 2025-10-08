/**
 * ===================================================================
 * API CLIENT - Cliente para comunicación con el backend
 * ===================================================================
 *
 * Este módulo maneja todas las llamadas HTTP al backend REST API.
 * Proporciona una interfaz simple para interactuar con los endpoints.
 *
 * Nota educativa:
 * - Usamos fetch() nativo del navegador (no requiere librerías externas)
 * - Manejamos errores de red y del servidor de forma centralizada
 * - Retornamos promesas para facilitar async/await en el código cliente
 *
 * ===================================================================
 */

const API = (() => {
    // Configuración base
    const BASE_URL = '/api';  // Ruta relativa (mismo servidor)

    /**
     * Función auxiliar para hacer requests HTTP
     * @param {string} endpoint - Endpoint de la API (ej: '/practicas')
     * @param {object} options - Opciones de fetch (method, body, etc.)
     * @returns {Promise} - Promesa con la respuesta JSON
     */
    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);

            // Parsear respuesta JSON
            const data = await response.json();

            // Si la respuesta no es OK, lanzar error
            if (!response.ok) {
                throw new Error(data.error || `HTTP Error ${response.status}`);
            }

            return data;

        } catch (error) {
            // Manejar errores de red o parsing
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión. Verifica que el servidor esté activo.');
            }
            throw error;
        }
    }

    /**
     * ============================================
     * ENDPOINTS PÚBLICOS
     * ============================================
     */

    return {
        /**
         * Verificar estado del servidor
         * GET /api/health
         */
        health: async () => {
            return request('/health');
        },

        /**
         * Listar prácticas con filtros y paginación
         * GET /api/practicas?area=QUIMICA&buscar=GLUCOSA&limit=20&offset=0
         *
         * @param {object} params - Parámetros de búsqueda
         * @param {string} params.area - Filtrar por área
         * @param {string} params.buscar - Buscar por nombre
         * @param {number} params.limit - Cantidad de resultados (default: 20)
         * @param {number} params.offset - Desde qué registro (default: 0)
         * @returns {Promise<object>} - { success, data, pagination }
         */
        listarPracticas: async (params = {}) => {
            const queryParams = new URLSearchParams();

            if (params.area) queryParams.append('area', params.area);
            if (params.buscar) queryParams.append('buscar', params.buscar);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.offset) queryParams.append('offset', params.offset);

            const query = queryParams.toString();
            const endpoint = query ? `/practicas?${query}` : '/practicas';

            return request(endpoint);
        },

        /**
         * Obtener una práctica por ID
         * GET /api/practicas/:id
         *
         * @param {number} id - ID de la práctica
         * @returns {Promise<object>} - { success, data }
         */
        obtenerPractica: async (id) => {
            return request(`/practicas/${id}`);
        },

        /**
         * Listar grupos de indicaciones
         * GET /api/grupos?limit=10&offset=0
         *
         * @param {object} params - Parámetros de búsqueda
         * @returns {Promise<object>} - { success, data }
         */
        listarGrupos: async (params = {}) => {
            const queryParams = new URLSearchParams();

            if (params.limit) queryParams.append('limit', params.limit);
            if (params.offset) queryParams.append('offset', params.offset);

            const query = queryParams.toString();
            const endpoint = query ? `/grupos?${query}` : '/grupos';

            return request(endpoint);
        },

        /**
         * Obtener un grupo por ID
         * GET /api/grupos/:id
         *
         * @param {number} id - ID del grupo
         * @returns {Promise<object>} - { success, data }
         */
        obtenerGrupo: async (id) => {
            return request(`/grupos/${id}`);
        },

        /**
         * Listar indicaciones
         * GET /api/indicaciones
         *
         * @returns {Promise<object>} - { success, data }
         */
        listarIndicaciones: async () => {
            return request('/indicaciones');
        },

        /**
         * ⭐ GENERAR INDICACIONES CONSOLIDADAS
         * POST /api/simulador/generar
         *
         * Este es el endpoint principal del sistema.
         * Recibe un array de IDs de prácticas y retorna las indicaciones consolidadas.
         *
         * @param {number[]} idsPracticas - Array de IDs de prácticas
         * @returns {Promise<object>} - { success, data: { indicaciones_consolidadas, ayuno_horas, detalles } }
         *
         * @example
         * const resultado = await API.generarIndicaciones([1, 2, 3]);
         * console.log(resultado.data.indicaciones_consolidadas);
         */
        generarIndicaciones: async (idsPracticas) => {
            return request('/simulador/generar', {
                method: 'POST',
                body: JSON.stringify({ id_practicas: idsPracticas }),
            });
        },

        /**
         * Crear una nueva práctica
         * POST /api/practicas
         *
         * @param {object} practica - Datos de la práctica
         * @param {string} practica.codigo_did - Código DID
         * @param {string} practica.nombre - Nombre de la práctica
         * @param {number} practica.id_area - ID del área
         * @returns {Promise<object>} - { success, data }
         */
        crearPractica: async (practica) => {
            return request('/practicas', {
                method: 'POST',
                body: JSON.stringify(practica),
            });
        },

        /**
         * Actualizar una práctica
         * PUT /api/practicas/:id
         *
         * @param {number} id - ID de la práctica
         * @param {object} practica - Datos a actualizar
         * @returns {Promise<object>} - { success, data }
         */
        actualizarPractica: async (id, practica) => {
            return request(`/practicas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(practica),
            });
        },

        /**
         * Eliminar una práctica (eliminación lógica)
         * DELETE /api/practicas/:id
         *
         * @param {number} id - ID de la práctica
         * @returns {Promise<object>} - { success, message }
         */
        eliminarPractica: async (id) => {
            return request(`/practicas/${id}`, {
                method: 'DELETE',
            });
        },
    };
})();

// Exponer globalmente para uso en otros scripts
window.API = API;
