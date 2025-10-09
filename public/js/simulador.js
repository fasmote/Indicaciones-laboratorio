/**
 * ===================================================================
 * SIMULADOR - Lógica principal de la aplicación
 * ===================================================================
 *
 * Este es el controlador principal de la interfaz del simulador.
 * Maneja toda la lógica de:
 * - Búsqueda de prácticas
 * - Selección múltiple
 * - Generación de indicaciones
 * - Mostrar resultados
 *
 * Nota educativa:
 * - Usamos el patrón Module Pattern para encapsular la lógica
 * - Separamos estado, UI y lógica de negocio
 * - Event listeners centralizados en init()
 *
 * ===================================================================
 */

const Simulador = (() => {
    /**
     * ============================================
     * ESTADO DE LA APLICACIÓN
     * ============================================
     */
    let estado = {
        practicasSeleccionadas: [],  // Array de objetos { id, nombre, area }
        ultimaBusqueda: '',
        totalPracticas: 0,
    };

    /**
     * ============================================
     * REFERENCIAS A ELEMENTOS DEL DOM
     * ============================================
     */
    const elementos = {
        // Búsqueda
        searchInput: null,
        searchButton: null,
        areaFilter: null,
        searchResults: null,
        searchLoading: null,

        // Seleccionadas
        selectedPracticas: null,
        selectedCount: null,
        actionButtons: null,
        clearButton: null,
        generateButton: null,

        // Resultados
        resultSection: null,
        generateLoading: null,
        resultSuccess: null,
        resultError: null,
        errorMessage: null,
        retryButton: null,

        // Resumen
        summaryPracticas: null,
        summaryGrupos: null,
        summaryIndicaciones: null,
        summaryAyuno: null,
        summaryAyunoContainer: null,
        indicacionesText: null,

        // Acciones de resultado
        copyButton: null,
        printButton: null,
        newButton: null,

        // Info
        totalPracticasSpan: null,
        serverStatus: null,
    };

    /**
     * ============================================
     * INICIALIZACIÓN
     * ============================================
     */
    function init() {
        // Obtener referencias a elementos del DOM
        obtenerReferenciasDOM();

        // Configurar event listeners
        configurarEventListeners();

        // Verificar estado del servidor
        verificarServidor();

        // Cargar total de prácticas
        cargarTotalPracticas();

        console.log('✅ Simulador inicializado');
    }

    /**
     * Obtener referencias a todos los elementos del DOM
     */
    function obtenerReferenciasDOM() {
        // Búsqueda
        elementos.searchInput = document.getElementById('searchInput');
        elementos.searchButton = document.getElementById('searchButton');
        elementos.areaFilter = document.getElementById('areaFilter');
        elementos.searchResults = document.getElementById('searchResults');
        elementos.searchLoading = document.getElementById('searchLoading');

        // Seleccionadas
        elementos.selectedPracticas = document.getElementById('selectedPracticas');
        elementos.selectedCount = document.getElementById('selectedCount');
        elementos.actionButtons = document.getElementById('actionButtons');
        elementos.clearButton = document.getElementById('clearButton');
        elementos.generateButton = document.getElementById('generateButton');

        // Resultados
        elementos.resultSection = document.getElementById('resultSection');
        elementos.generateLoading = document.getElementById('generateLoading');
        elementos.resultSuccess = document.getElementById('resultSuccess');
        elementos.resultError = document.getElementById('resultError');
        elementos.errorMessage = document.getElementById('errorMessage');
        elementos.retryButton = document.getElementById('retryButton');

        // Resumen
        elementos.summaryPracticas = document.getElementById('summaryPracticas');
        elementos.summaryGrupos = document.getElementById('summaryGrupos');
        elementos.summaryIndicaciones = document.getElementById('summaryIndicaciones');
        elementos.summaryAyuno = document.getElementById('summaryAyuno');
        elementos.summaryAyunoContainer = document.getElementById('summaryAyunoContainer');
        elementos.indicacionesText = document.getElementById('indicacionesText');

        // Acciones de resultado
        elementos.copyButton = document.getElementById('copyButton');
        elementos.printButton = document.getElementById('printButton');
        elementos.newButton = document.getElementById('newButton');

        // Info
        elementos.totalPracticasSpan = document.getElementById('totalPracticas');
        elementos.serverStatus = document.getElementById('serverStatus');
    }

    /**
     * Configurar todos los event listeners
     */
    function configurarEventListeners() {
        // Búsqueda
        elementos.searchButton.addEventListener('click', buscarPracticas);
        elementos.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarPracticas();
        });

        // Búsqueda en tiempo real con debounce
        const debouncedSearch = Utils.debounce(() => buscarPracticas(), 500);
        elementos.searchInput.addEventListener('input', debouncedSearch);

        elementos.areaFilter.addEventListener('change', buscarPracticas);

        // Acciones de seleccionadas
        elementos.clearButton.addEventListener('click', limpiarSeleccion);
        elementos.generateButton.addEventListener('click', generarIndicaciones);

        // Acciones de resultado
        elementos.copyButton.addEventListener('click', copiarIndicaciones);
        elementos.printButton.addEventListener('click', imprimirIndicaciones);
        elementos.newButton.addEventListener('click', nuevaConsulta);
        elementos.retryButton.addEventListener('click', generarIndicaciones);
    }

    /**
     * ============================================
     * FUNCIONES DE BÚSQUEDA
     * ============================================
     */

    /**
     * Buscar prácticas en el backend
     */
    async function buscarPracticas() {
        const busqueda = elementos.searchInput.value.trim();
        const area = elementos.areaFilter.value;

        // No buscar si está vacío y no hay filtro de área
        if (!busqueda && !area) {
            Utils.clearElement(elementos.searchResults);
            Utils.toggleElement(elementos.searchResults, false);
            return;
        }

        // Mostrar loading
        Utils.toggleElement(elementos.searchLoading, true);
        Utils.toggleElement(elementos.searchResults, false);

        try {
            const response = await API.listarPracticas({
                buscar: busqueda,
                area: area,
                limit: 50,
            });

            estado.ultimaBusqueda = busqueda;

            mostrarResultadosBusqueda(response.data);

        } catch (error) {
            console.error('Error en búsqueda:', error);
            Utils.showToast('Error al buscar prácticas: ' + error.message, 'error');
        } finally {
            Utils.toggleElement(elementos.searchLoading, false);
        }
    }

    /**
     * Mostrar resultados de búsqueda en el DOM
     */
    function mostrarResultadosBusqueda(practicas) {
        Utils.clearElement(elementos.searchResults);

        if (practicas.length === 0) {
            elementos.searchResults.innerHTML = '<p style="text-align: center; color: #64748b; padding: 2rem;">No se encontraron prácticas</p>';
            Utils.toggleElement(elementos.searchResults, true);
            return;
        }

        practicas.forEach(practica => {
            const item = crearItemResultado(practica);
            elementos.searchResults.appendChild(item);
        });

        Utils.toggleElement(elementos.searchResults, true);
    }

    /**
     * Crear elemento HTML para un resultado de búsqueda
     */
    function crearItemResultado(practica) {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.dataset.id = practica.id_practica;

        // Verificar si ya está seleccionada
        const yaSeleccionada = estado.practicasSeleccionadas.some(p => p.id === practica.id_practica);
        if (yaSeleccionada) {
            div.classList.add('selected');
        }

        // ⭐ NUEVO: Agregar clase si NO tiene indicaciones
        const tieneIndicaciones = practica.tiene_indicaciones;
        if (!tieneIndicaciones) {
            div.classList.add('sin-indicaciones');
        }

        // ⭐ NUEVO: Crear badge de indicador
        const badge = tieneIndicaciones
            ? '<span class="badge-indicaciones badge-si" title="Tiene indicaciones configuradas">✓ Con indicaciones</span>'
            : '<span class="badge-indicaciones badge-no" title="Esta práctica no tiene indicaciones configuradas">⚠ Sin indicaciones</span>';

        div.innerHTML = `
            <div class="result-item-content">
                <div class="result-item-name">${practica.nombre}</div>
                <div class="result-item-meta">
                    <span class="result-item-area">${practica.area?.nombre || 'Sin área'}</span>
                    <span>Código: ${practica.codigo_did}</span>
                </div>
            </div>
            ${badge}
        `;

        div.addEventListener('click', () => toggleSeleccion(practica, div));

        return div;
    }

    /**
     * ============================================
     * FUNCIONES DE SELECCIÓN
     * ============================================
     */

    /**
     * Agregar/quitar práctica de la selección
     */
    function toggleSeleccion(practica, elementoDOM) {
        const yaSeleccionada = estado.practicasSeleccionadas.some(p => p.id === practica.id_practica);

        if (yaSeleccionada) {
            // Quitar de selección
            estado.practicasSeleccionadas = estado.practicasSeleccionadas.filter(p => p.id !== practica.id_practica);
            elementoDOM.classList.remove('selected');
        } else {
            // Agregar a selección
            estado.practicasSeleccionadas.push({
                id: practica.id_practica,
                nombre: practica.nombre,
                area: practica.area?.nombre || 'Sin área',
                tiene_indicaciones: practica.tiene_indicaciones || false, // ⭐ NUEVO
            });
            elementoDOM.classList.add('selected');
        }

        actualizarVistaSeleccionadas();
    }

    /**
     * Actualizar la vista de prácticas seleccionadas
     */
    function actualizarVistaSeleccionadas() {
        // Actualizar contador
        elementos.selectedCount.textContent = estado.practicasSeleccionadas.length;

        // Limpiar lista
        Utils.clearElement(elementos.selectedPracticas);

        if (estado.practicasSeleccionadas.length === 0) {
            // Mostrar estado vacío
            elementos.selectedPracticas.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📋</span>
                    <p>No hay prácticas seleccionadas</p>
                    <small>Busca y selecciona prácticas de laboratorio para generar indicaciones</small>
                </div>
            `;
            Utils.toggleElement(elementos.actionButtons, false);
        } else {
            // Mostrar prácticas seleccionadas
            estado.practicasSeleccionadas.forEach(practica => {
                const item = crearItemSeleccionado(practica);
                elementos.selectedPracticas.appendChild(item);
            });
            Utils.toggleElement(elementos.actionButtons, true);
        }
    }

    /**
     * Crear elemento HTML para una práctica seleccionada
     */
    function crearItemSeleccionado(practica) {
        const div = document.createElement('div');
        div.className = 'selected-item';

        div.innerHTML = `
            <div class="selected-item-info">
                <div class="selected-item-name">${practica.nombre}</div>
                <div class="selected-item-meta">Área: ${practica.area}</div>
            </div>
            <button class="remove-button" title="Quitar de la selección">✖</button>
        `;

        div.querySelector('.remove-button').addEventListener('click', () => {
            quitarSeleccion(practica.id);
        });

        return div;
    }

    /**
     * Quitar práctica de la selección por ID
     */
    function quitarSeleccion(id) {
        estado.practicasSeleccionadas = estado.practicasSeleccionadas.filter(p => p.id !== id);
        actualizarVistaSeleccionadas();

        // Actualizar también en resultados de búsqueda si está visible
        const resultItem = elementos.searchResults.querySelector(`[data-id="${id}"]`);
        if (resultItem) {
            resultItem.classList.remove('selected');
        }
    }

    /**
     * Limpiar toda la selección
     */
    function limpiarSeleccion() {
        estado.practicasSeleccionadas = [];
        actualizarVistaSeleccionadas();

        // Quitar clase selected de todos los items de búsqueda
        elementos.searchResults.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('selected');
        });

        Utils.showToast('Selección limpiada', 'info');
    }

    /**
     * ============================================
     * GENERACIÓN DE INDICACIONES
     * ============================================
     */

    /**
     * Generar indicaciones consolidadas
     */
    async function generarIndicaciones() {
        if (estado.practicasSeleccionadas.length === 0) {
            Utils.showToast('Selecciona al menos una práctica', 'warning');
            return;
        }

        // Mostrar sección de resultados y loading
        Utils.toggleElement(elementos.resultSection, true);
        Utils.toggleElement(elementos.generateLoading, true);
        Utils.toggleElement(elementos.resultSuccess, false);
        Utils.toggleElement(elementos.resultError, false);

        // Scroll hacia resultados
        Utils.scrollToElement(elementos.resultSection);

        try {
            const ids = estado.practicasSeleccionadas.map(p => p.id);
            const response = await API.generarIndicaciones(ids);

            // Mostrar resultados exitosos
            mostrarResultadosExitosos(response.data);

            Utils.showToast('Indicaciones generadas exitosamente', 'success');

        } catch (error) {
            console.error('Error al generar indicaciones:', error);
            mostrarResultadosError(error.message);
            Utils.showToast('Error al generar indicaciones', 'error');
        } finally {
            Utils.toggleElement(elementos.generateLoading, false);
        }
    }

    /**
     * Mostrar resultados exitosos
     */
    function mostrarResultadosExitosos(data) {
        // Actualizar resumen
        elementos.summaryPracticas.textContent = data.detalles.cantidad_practicas;
        elementos.summaryGrupos.textContent = data.detalles.cantidad_grupos;
        elementos.summaryIndicaciones.textContent = data.detalles.cantidad_indicaciones;

        // Mostrar/ocultar ayuno
        if (data.ayuno_horas) {
            elementos.summaryAyuno.textContent = `${data.ayuno_horas} horas`;
            Utils.toggleElement(elementos.summaryAyunoContainer, true);
        } else {
            Utils.toggleElement(elementos.summaryAyunoContainer, false);
        }

        // Mostrar texto de indicaciones (formateado)
        elementos.indicacionesText.innerHTML = Utils.formatearIndicaciones(data.indicaciones_consolidadas);

        // Mostrar sección de éxito
        Utils.toggleElement(elementos.resultSuccess, true);
        Utils.toggleElement(elementos.resultError, false);
    }

    /**
     * Mostrar resultados con error
     */
    function mostrarResultadosError(mensaje) {
        elementos.errorMessage.textContent = mensaje;
        Utils.toggleElement(elementos.resultSuccess, false);
        Utils.toggleElement(elementos.resultError, true);
    }

    /**
     * ============================================
     * ACCIONES DE RESULTADO
     * ============================================
     */

    /**
     * Copiar indicaciones al portapapeles
     */
    async function copiarIndicaciones() {
        const texto = elementos.indicacionesText.textContent;

        const exito = await Utils.copyToClipboard(texto);

        if (exito) {
            Utils.showToast('Indicaciones copiadas al portapapeles', 'success');
        } else {
            Utils.showToast('No se pudo copiar al portapapeles', 'error');
        }
    }

    /**
     * Imprimir indicaciones
     */
    function imprimirIndicaciones() {
        window.print();
    }

    /**
     * Nueva consulta (reiniciar)
     */
    function nuevaConsulta() {
        limpiarSeleccion();
        Utils.toggleElement(elementos.resultSection, false);
        Utils.scrollToElement('.search-section');
        Utils.showToast('Puedes realizar una nueva consulta', 'info');
    }

    /**
     * ============================================
     * FUNCIONES AUXILIARES
     * ============================================
     */

    /**
     * Verificar estado del servidor
     */
    async function verificarServidor() {
        try {
            await API.health();
            elementos.serverStatus.textContent = '🟢 En línea';
            elementos.serverStatus.className = 'info-value status-online';
        } catch (error) {
            elementos.serverStatus.textContent = '🔴 Desconectado';
            elementos.serverStatus.className = 'info-value status-offline';
            Utils.showToast('No se puede conectar con el servidor', 'error');
        }
    }

    /**
     * Cargar total de prácticas disponibles
     */
    async function cargarTotalPracticas() {
        try {
            const response = await API.listarPracticas({ limit: 1 });
            estado.totalPracticas = response.pagination.total;
            elementos.totalPracticasSpan.textContent = Utils.formatNumber(estado.totalPracticas);
        } catch (error) {
            elementos.totalPracticasSpan.textContent = 'Error';
        }
    }

    /**
     * ============================================
     * EXPONER API PÚBLICA
     * ============================================
     */
    return {
        init,
        buscarPracticas,
        generarIndicaciones,
        limpiarSeleccion,
        estado,
    };
})();

// ============================================
// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    Simulador.init();
});

// Exponer globalmente para debugging
window.Simulador = Simulador;
