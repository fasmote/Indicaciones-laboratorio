/**
 * ===================================================================
 * SOLICITUDES MÚLTIPLES - Sistema de consolidación de indicaciones
 * ===================================================================
 *
 * Este módulo maneja:
 * - Guardar múltiples solicitudes en localStorage
 * - Mostrar lista de solicitudes guardadas
 * - Eliminar solicitudes individuales
 * - Consolidar TODAS las solicitudes en una única lista de indicaciones
 * - Lógica inteligente de merge (ayuno máximo, indicaciones únicas, etc.)
 *
 * ===================================================================
 */

const SolicitudesMultiples = (() => {
    /**
     * ============================================
     * CONSTANTES
     * ============================================
     */
    const STORAGE_KEY = 'indicaciones_solicitudes';

    /**
     * ============================================
     * ESTADO
     * ============================================
     */
    let solicitudes = [];
    let contadorSolicitudes = 0;

    /**
     * ============================================
     * FUNCIONES DE ALMACENAMIENTO (localStorage)
     * ============================================
     */

    /**
     * Cargar solicitudes desde localStorage
     */
    function cargarDesdeStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                solicitudes = parsed.solicitudes || [];
                contadorSolicitudes = parsed.contador || 0;
                console.log(`✅ Cargadas ${solicitudes.length} solicitudes desde localStorage`);
            }
        } catch (error) {
            console.error('Error al cargar solicitudes desde localStorage:', error);
            solicitudes = [];
            contadorSolicitudes = 0;
        }
    }

    /**
     * Guardar solicitudes en localStorage
     */
    function guardarEnStorage() {
        try {
            const data = {
                solicitudes: solicitudes,
                contador: contadorSolicitudes
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log(`✅ Guardadas ${solicitudes.length} solicitudes en localStorage`);
        } catch (error) {
            console.error('Error al guardar solicitudes en localStorage:', error);
        }
    }

    /**
     * ============================================
     * FUNCIONES PRINCIPALES
     * ============================================
     */

    /**
     * Guardar la selección actual como una nueva solicitud
     */
    function guardarComoSolicitud() {
        // Obtener prácticas seleccionadas desde tabs.js (es un Map)
        const practicasSeleccionadasMap = window.practicasSeleccionadasMap;

        if (!practicasSeleccionadasMap || practicasSeleccionadasMap.size === 0) {
            alert('⚠️ No hay prácticas seleccionadas para guardar');
            return;
        }

        // Convertir Map a array de prácticas
        const practicasArray = Array.from(practicasSeleccionadasMap.entries()).map(([id, data]) => ({
            id: id,
            nombre: data.nombre,
            codigo: data.codigo || 'N/A'
        }));

        // Incrementar contador
        contadorSolicitudes++;

        // Crear nueva solicitud
        const nuevaSolicitud = {
            id: contadorSolicitudes,
            nombre: `Solicitud ${contadorSolicitudes}`,
            practicas: practicasArray,
            fecha: new Date().toISOString(),
            cantidad: practicasArray.length
        };

        // Agregar a la lista
        solicitudes.push(nuevaSolicitud);

        // Guardar en localStorage
        guardarEnStorage();

        // Actualizar UI
        mostrarSolicitudesGuardadas();

        // NO mostrar alert - guardado silencioso
        console.log(`✅ Guardada como "${nuevaSolicitud.nombre}" con ${nuevaSolicitud.cantidad} práctica(s)`);
    }

    /**
     * Mostrar lista de solicitudes guardadas en el DOM
     */
    function mostrarSolicitudesGuardadas() {
        const container = document.getElementById('solicitudes-list');
        const section = document.getElementById('solicitudes-section');
        const countSpan = document.getElementById('solicitudes-count');

        // Actualizar contador
        countSpan.textContent = solicitudes.length;

        // Mostrar u ocultar sección
        if (solicitudes.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        // Limpiar container
        container.innerHTML = '';

        // Crear card para cada solicitud
        solicitudes.forEach(solicitud => {
            const card = document.createElement('div');
            card.className = 'solicitud-card';
            card.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                transition: all 0.2s;
            `;

            // Formatear fecha
            const fecha = new Date(solicitud.fecha);
            const fechaStr = fecha.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            card.innerHTML = `
                <div>
                    <div style="font-weight: 600; color: #333; font-size: 1.05rem; margin-bottom: 5px;">
                        📄 ${solicitud.nombre}
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">
                        <span style="margin-right: 15px;">🧪 ${solicitud.cantidad} práctica(s)</span>
                        <span style="color: #999;">📅 ${fechaStr}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 0.85rem; color: #888;">
                        ${solicitud.practicas.map(p => p.nombre).join(', ')}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="verDetalleSolicitud(${solicitud.id})" class="btn" style="padding: 8px 12px; font-size: 0.9rem; background: #2196F3; color: white;">
                        👁️ Ver
                    </button>
                    <button onclick="eliminarSolicitud(${solicitud.id})" class="btn btn-danger" style="padding: 8px 12px; font-size: 0.9rem;">
                        🗑️ Eliminar
                    </button>
                </div>
            `;

            // Efecto hover
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = '#2196F3';
                card.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.2)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = '#e0e0e0';
                card.style.boxShadow = 'none';
            });

            container.appendChild(card);
        });
    }

    /**
     * Ver detalle de una solicitud (lista de prácticas)
     */
    function verDetalleSolicitud(id) {
        const solicitud = solicitudes.find(s => s.id === id);
        if (!solicitud) {
            alert('❌ Solicitud no encontrada');
            return;
        }

        const listaPracticas = solicitud.practicas
            .map((p, i) => `${i + 1}. ${p.nombre} (${p.codigo})`)
            .join('\n');

        alert(`📄 ${solicitud.nombre}\n\n🧪 Prácticas (${solicitud.cantidad}):\n\n${listaPracticas}`);
    }

    /**
     * Eliminar una solicitud por ID
     */
    function eliminarSolicitud(id) {
        const solicitud = solicitudes.find(s => s.id === id);
        if (!solicitud) {
            return;
        }

        if (!confirm(`¿Eliminar "${solicitud.nombre}" con ${solicitud.cantidad} práctica(s)?`)) {
            return;
        }

        // Filtrar solicitud
        solicitudes = solicitudes.filter(s => s.id !== id);

        // Guardar en localStorage
        guardarEnStorage();

        // Actualizar UI
        mostrarSolicitudesGuardadas();

        alert(`✅ "${solicitud.nombre}" eliminada correctamente`);
    }

    /**
     * Consolidar solicitudes guardadas + selección actual y generar indicaciones
     */
    async function consolidarYGenerar() {
        // Obtener selección actual
        const practicasSeleccionadasMap = window.practicasSeleccionadasMap;
        const haySeleccionActual = practicasSeleccionadasMap && practicasSeleccionadasMap.size > 0;
        const haySolicitudesGuardadas = solicitudes.length > 0;

        if (!haySeleccionActual && !haySolicitudesGuardadas) {
            alert('⚠️ No hay prácticas seleccionadas ni solicitudes guardadas');
            return;
        }

        try {
            // Recopilar TODAS las prácticas: solicitudes + selección actual
            const todasLasPracticas = [];
            const idsUnicos = new Set();

            console.log('📊 Iniciando consolidación...');
            console.log('📋 Solicitudes guardadas:', solicitudes.length);
            console.log('🧪 Selección actual:', practicasSeleccionadasMap ? practicasSeleccionadasMap.size : 0);

            // 1. Agregar prácticas de solicitudes guardadas
            solicitudes.forEach((solicitud, idx) => {
                console.log(`   Solicitud ${idx + 1} (${solicitud.nombre}):`, solicitud.practicas);
                solicitud.practicas.forEach(practica => {
                    console.log(`      - Práctica ID ${practica.id}: ${practica.nombre}`);
                    if (!idsUnicos.has(practica.id)) {
                        idsUnicos.add(practica.id);
                        todasLasPracticas.push(practica);
                    } else {
                        console.log(`      ⚠️ Práctica ${practica.id} duplicada, ignorando`);
                    }
                });
            });

            // 2. Agregar prácticas de selección actual (si las hay)
            if (haySeleccionActual) {
                console.log(`   Selección actual:`, Array.from(practicasSeleccionadasMap.entries()));
                practicasSeleccionadasMap.forEach((data, id) => {
                    console.log(`      - Práctica ID ${id}: ${data.nombre}`);
                    if (!idsUnicos.has(id)) {
                        idsUnicos.add(id);
                        todasLasPracticas.push({
                            id: id,
                            nombre: data.nombre,
                            codigo: data.codigo || 'N/A'
                        });
                    } else {
                        console.log(`      ⚠️ Práctica ${id} duplicada, ignorando`);
                    }
                });
            }

            console.log(`📊 Consolidando ${solicitudes.length} solicitudes...`);
            console.log(`🧪 Total de prácticas únicas: ${todasLasPracticas.length}`);
            console.log('🔢 IDs únicos:', Array.from(idsUnicos));

            // Obtener IDs
            const ids = Array.from(idsUnicos);

            if (ids.length === 0) {
                alert('⚠️ No se encontraron prácticas para consolidar');
                return;
            }

            // Llamar al backend para generar indicaciones consolidadas
            console.log('🌐 Llamando a API.generarIndicaciones con IDs:', ids);
            const response = await API.generarIndicaciones(ids);
            console.log('✅ Respuesta del backend:', response);

            // Mostrar resultados
            mostrarResultadosConsolidados(response.data, todasLasPracticas, solicitudes.length);

            console.log('✅ Consolidación exitosa');

        } catch (error) {
            console.error('❌ Error al consolidar solicitudes:', error);
            alert('❌ Error al consolidar: ' + error.message);
        }
    }

    /**
     * Mostrar resultados de consolidación
     */
    function mostrarResultadosConsolidados(data, practicas, cantidadSolicitudes) {
        const resultContainer = document.getElementById('result-container');
        const resultContent = document.getElementById('result-content');

        // Limpiar contenido previo
        resultContent.innerHTML = '';

        // Crear header especial para consolidación
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        `;
        header.innerHTML = `
            <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 10px;">
                📊 INDICACIONES CONSOLIDADAS
            </div>
            <div style="font-size: 0.95rem; opacity: 0.95;">
                De ${cantidadSolicitudes} solicitud(es) • ${practicas.length} práctica(s) única(s)
            </div>
        `;
        resultContent.appendChild(header);

        // Información de ayuno (destacado si existe)
        if (data.ayuno_horas) {
            const ayunoBox = document.createElement('div');
            ayunoBox.style.cssText = `
                background: #fff3e0;
                border-left: 4px solid #ff9800;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 4px;
            `;
            ayunoBox.innerHTML = `
                <div style="font-weight: 600; color: #e65100; margin-bottom: 5px;">
                    ⏰ Ayuno Requerido
                </div>
                <div style="font-size: 1.2rem; color: #333;">
                    ${data.ayuno_horas} horas
                </div>
                <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">
                    Se tomó el ayuno máximo requerido entre todas las solicitudes
                </div>
            `;
            resultContent.appendChild(ayunoBox);
        }

        // Indicaciones consolidadas
        const indicacionesBox = document.createElement('div');
        indicacionesBox.style.cssText = `
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
            margin-bottom: 20px;
        `;

        // Las indicaciones pueden venir como array de strings o como string con saltos de línea
        let indicacionesArray = [];
        if (Array.isArray(data.indicaciones_consolidadas)) {
            indicacionesArray = data.indicaciones_consolidadas;
        } else if (typeof data.indicaciones_consolidadas === 'string') {
            indicacionesArray = data.indicaciones_consolidadas.split('\n').filter(s => s.trim());
        }

        const indicacionesHTML = indicacionesArray
            .map(texto => `<div style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">✓ ${texto}</div>`)
            .join('');

        indicacionesBox.innerHTML = `
            <div style="font-weight: 600; color: #333; margin-bottom: 15px; font-size: 1.1rem;">
                📋 Indicaciones Unificadas:
            </div>
            ${indicacionesHTML}
        `;
        resultContent.appendChild(indicacionesBox);

        // Detalles
        const detallesBox = document.createElement('div');
        detallesBox.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        `;
        detallesBox.innerHTML = `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <div style="color: #1976d2; font-size: 0.9rem;">Prácticas</div>
                <div style="font-size: 1.5rem; font-weight: 600; color: #0d47a1;">${data.detalles.cantidad_practicas}</div>
            </div>
            <div style="background: #f3e5f5; padding: 15px; border-radius: 8px;">
                <div style="color: #7b1fa2; font-size: 0.9rem;">Grupos</div>
                <div style="font-size: 1.5rem; font-weight: 600; color: #4a148c;">${data.detalles.cantidad_grupos}</div>
            </div>
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                <div style="color: #388e3c; font-size: 0.9rem;">Indicaciones</div>
                <div style="font-size: 1.5rem; font-weight: 600; color: #1b5e20;">${data.detalles.cantidad_indicaciones}</div>
            </div>
        `;
        resultContent.appendChild(detallesBox);

        // Botones de acción
        const botonesBox = document.createElement('div');
        botonesBox.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
        `;
        botonesBox.innerHTML = `
            <button onclick="copiarIndicacionesConsolidadas()" class="btn btn-primary">
                📋 Copiar Indicaciones
            </button>
            <button onclick="imprimirIndicacionesConsolidadas()" class="btn" style="background: #607d8b; color: white;">
                🖨️ Imprimir
            </button>
            <button onclick="cerrarResultados()" class="btn" style="background: #9e9e9e; color: white;">
                ✖️ Cerrar
            </button>
        `;
        resultContent.appendChild(botonesBox);

        // Mostrar contenedor de resultados
        resultContainer.style.display = 'block';

        // Scroll hacia resultados
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Copiar indicaciones consolidadas al portapapeles
     */
    function copiarIndicacionesConsolidadas() {
        const resultContent = document.getElementById('result-content');
        const indicaciones = Array.from(resultContent.querySelectorAll('div[style*="border-bottom"]'))
            .map(div => div.textContent.trim())
            .join('\n');

        navigator.clipboard.writeText(indicaciones).then(() => {
            alert('✅ Indicaciones copiadas al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
            alert('❌ No se pudo copiar al portapapeles');
        });
    }

    /**
     * Imprimir indicaciones consolidadas
     */
    function imprimirIndicacionesConsolidadas() {
        window.print();
    }

    /**
     * Cerrar panel de resultados
     */
    function cerrarResultados() {
        document.getElementById('result-container').style.display = 'none';
    }

    /**
     * Limpiar SOLO la selección actual (sin confirmación)
     */
    function limpiarSeleccion() {
        const practicasSeleccionadasMap = window.practicasSeleccionadasMap;

        if (!practicasSeleccionadasMap || practicasSeleccionadasMap.size === 0) {
            // No hay nada que limpiar, no hacer nada
            return;
        }

        // Limpiar el Map
        practicasSeleccionadasMap.clear();

        // Desmarcar checkboxes
        document.querySelectorAll('#practicas-list input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Actualizar vista de seleccionadas
        if (typeof window.actualizarPracticasSeleccionadas === 'function') {
            window.actualizarPracticasSeleccionadas();
        }

        console.log('✅ Selección limpiada');
    }

    /**
     * Limpiar TODO: selección actual + solicitudes guardadas (con confirmación)
     */
    function limpiarTodo() {
        const confirmMsg = [];

        // Verificar qué hay para limpiar
        const practicasSeleccionadasMap = window.practicasSeleccionadasMap;
        const haySeleccion = practicasSeleccionadasMap && practicasSeleccionadasMap.size > 0;
        const haySolicitudes = solicitudes.length > 0;

        if (!haySeleccion && !haySolicitudes) {
            alert('ℹ️ No hay nada que limpiar');
            return;
        }

        if (haySeleccion) {
            confirmMsg.push(`${practicasSeleccionadasMap.size} práctica(s) seleccionada(s)`);
        }
        if (haySolicitudes) {
            confirmMsg.push(`${solicitudes.length} solicitud(es) guardada(s)`);
        }

        const confirmar = confirm(`¿Limpiar ${confirmMsg.join(' y ')}?`);
        if (!confirmar) return;

        // Limpiar selección actual
        if (haySeleccion) {
            practicasSeleccionadasMap.clear();
            // Desmarcar checkboxes
            document.querySelectorAll('#practicas-list input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            // Actualizar vista de seleccionadas
            if (typeof window.actualizarPracticasSeleccionadas === 'function') {
                window.actualizarPracticasSeleccionadas();
            }
        }

        // Limpiar solicitudes guardadas
        if (haySolicitudes) {
            solicitudes = [];
            contadorSolicitudes = 0;
            guardarEnStorage();
            mostrarSolicitudesGuardadas();
        }

        // Cerrar resultados si están abiertos
        cerrarResultados();

        alert('✅ Todo limpiado correctamente');
    }

    /**
     * ============================================
     * INICIALIZACIÓN
     * ============================================
     */
    function init() {
        // Cargar solicitudes desde localStorage
        cargarDesdeStorage();

        // Mostrar solicitudes si hay
        if (solicitudes.length > 0) {
            mostrarSolicitudesGuardadas();
        }

        console.log('✅ Módulo SolicitudesMultiples inicializado');
    }

    /**
     * ============================================
     * EXPONER API PÚBLICA
     * ============================================
     */
    return {
        init,
        guardarComoSolicitud,
        mostrarSolicitudesGuardadas,
        eliminarSolicitud,
        verDetalleSolicitud,
        consolidarYGenerar,
        copiarIndicacionesConsolidadas,
        imprimirIndicacionesConsolidadas,
        cerrarResultados,
        limpiarSeleccion,
        limpiarTodo,
        getSolicitudes: () => solicitudes
    };
})();

// ============================================
// EXPONER FUNCIONES AL SCOPE GLOBAL
// ============================================
window.guardarComoSolicitud = SolicitudesMultiples.guardarComoSolicitud;
window.eliminarSolicitud = SolicitudesMultiples.eliminarSolicitud;
window.verDetalleSolicitud = SolicitudesMultiples.verDetalleSolicitud;
window.consolidarYGenerar = SolicitudesMultiples.consolidarYGenerar;
window.copiarIndicacionesConsolidadas = SolicitudesMultiples.copiarIndicacionesConsolidadas;
window.imprimirIndicacionesConsolidadas = SolicitudesMultiples.imprimirIndicacionesConsolidadas;
window.cerrarResultados = SolicitudesMultiples.cerrarResultados;
window.limpiarSeleccion = SolicitudesMultiples.limpiarSeleccion;
window.limpiarTodo = SolicitudesMultiples.limpiarTodo;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    SolicitudesMultiples.init();
});
