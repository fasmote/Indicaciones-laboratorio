/**
 * ===================================================================
 * TABS.JS - Sistema de pestañas y gestión de ABMs
 * ===================================================================
 *
 * Maneja la lógica de cambio de pestañas y todas las funciones
 * de ABM (Alta, Baja, Modificación) para Prácticas, Grupos e Indicaciones
 */

// Variables globales
let practicasData = [];
let practicasDataFull = [];
let gruposData = [];
let indicacionesData = [];
// ⭐ NUEVO: Guardar estado de selecciones
let practicasSeleccionadasMap = new Map(); // Map<id, {nombre, area}>

// ===================================================================
// INICIALIZACIÓN
// ===================================================================

window.onload = function() {
    console.log('✅ Sistema de pestañas inicializado');
    cargarPracticasParaSimulador();
};

// ===================================================================
// GESTIÓN DE PESTAÑAS
// ===================================================================

function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Cargar datos según el tab
    switch(tabName) {
        case 'simulator':
            cargarPracticasParaSimulador();
            break;
        case 'practicas':
            cargarPracticas();
            break;
        case 'grupos':
            cargarGrupos();
            break;
        case 'indicaciones':
            cargarIndicaciones();
            break;
        case 'relaciones':
            if (typeof inicializarRelaciones === 'function') {
                inicializarRelaciones();
            }
            break;
    }
}

// ===================================================================
// SIMULADOR - FUNCIONES
// ===================================================================

async function cargarPracticasParaSimulador() {
    try {
        const response = await API.listarPracticas({ limit: 5000 });
        practicasDataFull = response.data || [];
        practicasData = [...practicasDataFull];

        const container = document.getElementById('practicas-list');
        container.innerHTML = '';

        if (practicasData.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No hay prácticas disponibles. Ve a la pestaña Prácticas para crear algunas.</p>';
            return;
        }

        mostrarPracticasEnSimulador(practicasData);

    } catch (error) {
        console.error('Error cargando prácticas:', error);
        document.getElementById('practicas-list').innerHTML = '<p style="color:#dc3545;text-align:center;padding:20px;">Error cargando prácticas. Verifica que el servidor esté funcionando.</p>';
    }
}

function mostrarPracticasEnSimulador(practicas) {
    const container = document.getElementById('practicas-list');

    container.innerHTML = '';

    practicas.forEach(practica => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';

        const badge = practica.tiene_indicaciones
            ? '<span class="badge badge-success" title="Tiene indicaciones">✓</span>'
            : '<span class="badge badge-warning" title="Sin indicaciones">⚠</span>';

        // ⭐ FIX: Verificar si esta práctica está en el Map de seleccionadas
        const estabaSeleccionada = practicasSeleccionadasMap.has(practica.id_practica);

        div.innerHTML = `
            <label>
                <input type="checkbox" value="${practica.id_practica}" data-name="${practica.nombre}" data-area="${practica.area?.nombre || 'Sin área'}" ${estabaSeleccionada ? 'checked' : ''} onchange="manejarCambioCheckbox(this)">
                <span>
                    ${practica.nombre} - <strong>${practica.area?.nombre || 'Sin área'}</strong>
                    ${badge}
                </span>
            </label>
        `;
        container.appendChild(div);
    });

    // ⭐ Actualizar la lista de seleccionadas después de renderizar
    actualizarPracticasSeleccionadas();
}

function filtrarPracticas() {
    const searchText = document.getElementById('search-practicas').value.toLowerCase();

    if (searchText === '') {
        mostrarPracticasEnSimulador(practicasDataFull);
        return;
    }

    const filtered = practicasDataFull.filter(p =>
        p.nombre.toLowerCase().includes(searchText) ||
        (p.area && p.area.nombre.toLowerCase().includes(searchText))
    );

    mostrarPracticasEnSimulador(filtered);
}

async function generarIndicaciones() {
    // ⭐ FIX: Usar el Map en lugar de leer checkboxes del DOM
    if (practicasSeleccionadasMap.size === 0) {
        Utils.showToast('Por favor selecciona al menos una práctica', 'error');
        return;
    }

    // Obtener IDs desde el Map
    const practicasIds = Array.from(practicasSeleccionadasMap.keys());

    try {
        Utils.showToast('Generando indicaciones...', 'info');

        const response = await API.generarIndicaciones(practicasIds);

        const resultContainer = document.getElementById('result-container');
        const resultContent = document.getElementById('result-content');

        resultContainer.style.display = 'block';
        resultContent.innerHTML = '';

        // Mostrar prácticas seleccionadas desde el Map
        const practicasSeleccionadas = Array.from(practicasSeleccionadasMap.values()).map(p => p.nombre);
        const practicasDiv = document.createElement('div');
        practicasDiv.innerHTML = `
            <h4 style="margin-bottom:10px;">🔬 Prácticas Seleccionadas (${practicasSeleccionadas.length}):</h4>
            <div style="margin-bottom: 15px;">
                ${practicasSeleccionadas.map(nombre => `<span class="badge">${nombre}</span>`).join('')}
            </div>
        `;
        resultContent.appendChild(practicasDiv);

        // ⭐ NUEVO: Mostrar desglose detallado de indicaciones
        if (response.data.detalles && response.data.detalles.indicaciones && response.data.detalles.indicaciones.length > 0) {
            const detalleDiv = document.createElement('div');
            detalleDiv.style.cssText = 'background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px;';

            let indicacionesHTML = '<h4 style="margin-bottom:15px; color: #856404;">🔍 Desglose Detallado de Indicaciones:</h4>';

            response.data.detalles.indicaciones.forEach((ind, index) => {
                indicacionesHTML += `
                    <div style="background: white; padding: 12px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ffeaa7;">
                        <div style="display: flex; gap: 10px; align-items: start;">
                            <span style="background: #ffc107; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">${index + 1}</span>
                            <div style="flex: 1;">
                                <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">${ind.texto}</p>
                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <span style="background: #e3f2fd; color: #1976d2; padding: 3px 8px; border-radius: 8px; font-size: 11px;">
                                        📂 Tipo: ${ind.tipo}
                                    </span>
                                    <span style="background: #f3e5f5; color: #7b1fa2; padding: 3px 8px; border-radius: 8px; font-size: 11px;">
                                        🔢 Orden: ${ind.orden}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            detalleDiv.innerHTML = indicacionesHTML;
            resultContent.appendChild(detalleDiv);
        }

        // Mostrar resumen
        const resumen = response.data.detalles;

        // ⭐ NUEVO: Detectar si no hay indicaciones ni ayuno
        const sinIndicaciones = resumen.cantidad_indicaciones === 0;
        const sinAyuno = !response.data.ayuno_horas || response.data.ayuno_horas === 0;
        const sinOrina = !response.data.tipo_orina;
        const totalmenteSinDatos = sinIndicaciones && sinAyuno && sinOrina;

        const resumenDiv = document.createElement('div');
        resumenDiv.innerHTML = `
            <h4 style="margin-bottom:10px;">📊 Resumen:</h4>
            <p><strong>Cantidad de prácticas:</strong> ${resumen.cantidad_practicas}</p>
            <p><strong>Cantidad de grupos:</strong> ${resumen.cantidad_grupos}</p>
            <p><strong>Cantidad de indicaciones:</strong> ${resumen.cantidad_indicaciones}</p>
            ${response.data.ayuno_horas > 0 ? `<p><strong>Ayuno requerido:</strong> ${response.data.ayuno_horas} horas</p>` : ''}
            ${response.data.tipo_orina ? `<p><strong>Tipo de orina:</strong> ${response.data.tipo_orina}</p>` : ''}
            ${totalmenteSinDatos ? `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-top: 15px; border-radius: 5px;">
                    <p style="margin: 0; color: #856404; font-weight: 600;">
                        ⚠️ Las prácticas seleccionadas no tienen indicaciones, ayuno ni requisitos de orina configurados.
                    </p>
                </div>
            ` : sinIndicaciones ? `
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin-top: 15px; border-radius: 5px;">
                    <p style="margin: 0; color: #856404; font-weight: 600;">
                        ⚠️ Las prácticas seleccionadas no tienen indicaciones específicas configuradas.
                        ${response.data.ayuno_horas > 0 ? ' Solo se requiere ayuno.' : ''}
                        ${response.data.tipo_orina ? ' Solo se requiere orina.' : ''}
                    </p>
                </div>
            ` : ''}
            <hr style="margin: 15px 0; border-top: 1px solid #ddd;">
        `;
        resultContent.appendChild(resumenDiv);

        // Mostrar texto de indicaciones
        const indicacionesDiv = document.createElement('div');
        indicacionesDiv.innerHTML = `
            <h4 style="margin-bottom:10px;">📋 Indicaciones para el Paciente:</h4>
            <div class="indicator-item">
                <p style="white-space: pre-line; line-height: 1.6;">${response.data.indicaciones_consolidadas || 'Sin indicaciones disponibles'}</p>
            </div>
        `;
        resultContent.appendChild(indicacionesDiv);

        // Botón copiar
        const btnCopiar = document.createElement('button');
        btnCopiar.className = 'btn btn-info';
        btnCopiar.innerHTML = '📋 Copiar al portapapeles';
        btnCopiar.onclick = () => {
            Utils.copyToClipboard(response.data.indicaciones_consolidadas);
            Utils.showToast('Indicaciones copiadas al portapapeles', 'success');
        };
        resultContent.appendChild(btnCopiar);

        Utils.showToast('Indicaciones generadas exitosamente', 'success');

        // Scroll al resultado
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        console.error('Error generando indicaciones:', error);
        Utils.showToast(error.message || 'Error al generar indicaciones', 'error');
    }
}

// ===================================================================
// PRÁCTICAS - FUNCIONES ABM
// ===================================================================

async function cargarPracticas() {
    try {
        const response = await API.listarPracticas({ limit: 5000 });
        const container = document.getElementById('practicas-container');

        container.innerHTML = '';

        if (!response.data || response.data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No hay prácticas registradas</p>';
            return;
        }

        response.data.forEach(practica => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cursor = 'pointer';
            card.dataset.id = practica.id_practica;

            const badge = practica.tiene_indicaciones
                ? '<span class="badge badge-success">✓ Con indicaciones</span>'
                : '<span class="badge badge-warning">⚠ Sin indicaciones</span>';

            card.innerHTML = `
                <h3>
                    <span class="status-indicator status-${practica.activo ? 'active' : 'inactive'}"></span>
                    ${practica.nombre}
                </h3>
                <p><strong>Código DID:</strong> ${practica.codigo_did}</p>
                <p><strong>Área:</strong> ${practica.area?.nombre || 'Sin área'}</p>
                <p>${badge}</p>
                <button class="btn btn-info" style="margin-top: 10px;" onclick="verDetallesPractica(${practica.id_practica})">
                    🔍 Ver Grupos e Indicaciones
                </button>
                <small style="color:#999; display: block; margin-top: 10px;">ID: ${practica.id_practica} | Creado: ${new Date(practica.fechaCreacion).toLocaleDateString()}</small>
                <div id="detalle-${practica.id_practica}" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;"></div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error cargando prácticas:', error);
        document.getElementById('practicas-container').innerHTML = '<p style="color:#dc3545;text-align:center;padding:20px;">Error cargando prácticas</p>';
    }
}

function filtrarListaPracticas() {
    const searchText = document.getElementById('search-practicas-list').value.toLowerCase();
    const cards = document.querySelectorAll('#practicas-container .card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchText) ? 'block' : 'none';
    });
}

// ===================================================================
// ⭐ NUEVA FUNCIÓN: Ver detalles de una práctica
// ===================================================================

async function verDetallesPractica(idPractica) {
    const detalleDiv = document.getElementById(`detalle-${idPractica}`);

    // Si ya está visible, ocultarlo (toggle)
    if (detalleDiv.style.display === 'block') {
        detalleDiv.style.display = 'none';
        return;
    }

    try {
        // Mostrar loading
        detalleDiv.style.display = 'block';
        detalleDiv.innerHTML = '<p style="text-align:center; color:#666;">⏳ Cargando detalles...</p>';

        // Obtener detalles de la práctica
        const response = await fetch(`/api/practicas/${idPractica}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Error al cargar detalles');
        }

        const practica = data.data;

        // Construir HTML con los detalles
        let html = '<div style="padding: 10px;">';

        if (!practica.grupos || practica.grupos.length === 0) {
            html += '<p style="color: #856404; background: #fff3cd; padding: 15px; border-radius: 5px; margin: 0;">⚠️ <strong>Esta práctica no tiene grupos de indicaciones asignados.</strong></p>';
            html += '<p style="margin-top: 10px; font-size: 13px; color: #666;">Para agregar indicaciones, primero debes asignar un grupo a esta práctica.</p>';
        } else {
            html += `<h4 style="margin-bottom: 15px; color: #333;">📁 Grupos Asignados (${practica.grupos.length}):</h4>`;

            practica.grupos.forEach((pg, index) => {
                const grupo = pg.grupo;
                html += `
                    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <h5 style="margin: 0; color: #667eea;">
                                <span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; margin-right: 8px;">${index + 1}</span>
                                ${grupo.nombre}
                            </h5>
                        </div>
                        <p style="font-size: 13px; color: #666; margin: 8px 0;">${grupo.descripcion || 'Sin descripción'}</p>

                        ${grupo.horas_ayuno ? `<span class="badge" style="background: #ff6b6b;">⏰ Ayuno: ${grupo.horas_ayuno}h</span>` : ''}
                        ${grupo.tipo_orina ? `<span class="badge" style="background: #4ecdc4;">💧 Orina: ${grupo.tipo_orina}</span>` : ''}

                        <hr style="margin: 12px 0; border-top: 1px dashed #ddd;">

                        <h6 style="margin: 10px 0 8px 0; color: #555; font-size: 13px;">📝 Indicaciones de este grupo:</h6>
                `;

                if (!grupo.indicaciones || grupo.indicaciones.length === 0) {
                    html += '<p style="font-size: 12px; color: #999; font-style: italic; margin-left: 15px;">Sin indicaciones configuradas</p>';
                } else {
                    html += '<div style="margin-left: 15px;">';
                    grupo.indicaciones.forEach((gi, idx) => {
                        const ind = gi.indicacion;
                        html += `
                            <div style="background: #f8f9fa; padding: 10px; margin-bottom: 8px; border-radius: 5px; border-left: 3px solid #667eea;">
                                <div style="display: flex; gap: 8px; align-items: start;">
                                    <span style="color: #667eea; font-weight: bold; min-width: 20px;">${idx + 1}.</span>
                                    <div style="flex: 1;">
                                        <p style="margin: 0 0 5px 0; color: #333; font-size: 13px;">${ind.texto}</p>
                                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                            <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 10px; font-size: 10px;">
                                                ${ind.tipo}
                                            </span>
                                            <span style="background: #f3e5f5; color: #7b1fa2; padding: 2px 8px; border-radius: 10px; font-size: 10px;">
                                                Orden: ${ind.orden}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    html += '</div>';
                }

                html += '</div>';
            });
        }

        html += '</div>';

        detalleDiv.innerHTML = html;

    } catch (error) {
        console.error('Error cargando detalles:', error);
        detalleDiv.innerHTML = '<p style="color: #dc3545; text-align: center;">❌ Error al cargar detalles</p>';
    }
}

async function crearPractica() {
    const nombre = document.getElementById('practica-nombre').value.trim();
    const codigo = document.getElementById('practica-codigo').value.trim();
    const area = document.getElementById('practica-area').value;

    if (!nombre || !codigo) {
        Utils.showToast('Por favor completa nombre y código', 'error');
        return;
    }

    try {
        await API.crearPractica({
            nombre: nombre,
            codigo_did: codigo,
            id_area: area ? parseInt(area) : null
        });

        Utils.showToast('Práctica creada exitosamente', 'success');

        // Limpiar formulario
        document.getElementById('practica-nombre').value = '';
        document.getElementById('practica-codigo').value = '';
        document.getElementById('practica-area').value = '';

        // Recargar lista
        cargarPracticas();

    } catch (error) {
        console.error('Error creando práctica:', error);
        Utils.showToast(error.message || 'Error al crear práctica', 'error');
    }
}

// ===================================================================
// GRUPOS - FUNCIONES ABM
// ===================================================================

async function cargarGrupos() {
    try {
        const response = await API.listarGrupos({ limit: 1000 });
        const container = document.getElementById('grupos-container');

        container.innerHTML = '';

        if (!response.data || response.data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No hay grupos registrados</p>';
            return;
        }

        response.data.forEach(grupo => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>
                    <span class="status-indicator status-${grupo.activo ? 'active' : 'inactive'}"></span>
                    ${grupo.nombre}
                </h3>
                <p style="color:#666;font-size:13px;line-height:1.5;">${grupo.descripcion || 'Sin descripción'}</p>
                ${grupo.horas_ayuno ? `<p><span class="badge">⏰ Ayuno: ${grupo.horas_ayuno}h</span></p>` : ''}
                ${grupo.tipo_orina ? `<p><span class="badge">💧 Orina: ${grupo.tipo_orina}</span></p>` : ''}
                <small style="color:#999;">ID: ${grupo.id_grupo} | Creado: ${new Date(grupo.fechaCreacion).toLocaleDateString()}</small>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error cargando grupos:', error);
        document.getElementById('grupos-container').innerHTML = '<p style="color:#dc3545;text-align:center;padding:20px;">Error cargando grupos</p>';
    }
}

async function crearGrupo() {
    const nombre = document.getElementById('grupo-nombre').value.trim();
    const descripcion = document.getElementById('grupo-descripcion').value.trim();
    const ayuno = document.getElementById('grupo-ayuno').value;
    const orinaTipo = document.getElementById('grupo-orina-tipo').value;

    if (!nombre) {
        Utils.showToast('Por favor ingresa un nombre para el grupo', 'error');
        return;
    }

    try {
        await API.crearGrupo({
            nombre: nombre,
            descripcion: descripcion || null,
            horas_ayuno: ayuno ? parseInt(ayuno) : null,
            tipo_orina: orinaTipo || null
        });

        Utils.showToast('Grupo creado exitosamente', 'success');

        // Limpiar formulario
        document.getElementById('grupo-nombre').value = '';
        document.getElementById('grupo-descripcion').value = '';
        document.getElementById('grupo-ayuno').value = '';
        document.getElementById('grupo-orina-tipo').value = '';

        // Recargar lista
        cargarGrupos();

    } catch (error) {
        console.error('Error creando grupo:', error);
        Utils.showToast(error.message || 'Error al crear grupo', 'error');
    }
}

// ===================================================================
// INDICACIONES - FUNCIONES ABM
// ===================================================================

async function cargarIndicaciones() {
    try {
        const response = await API.listarIndicaciones();
        const container = document.getElementById('indicaciones-container');

        container.innerHTML = '';

        if (!response.data || response.data.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">No hay indicaciones registradas</p>';
            return;
        }

        response.data.forEach(indicacion => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>
                    <span class="status-indicator status-${indicacion.activo ? 'active' : 'inactive'}"></span>
                    ${indicacion.descripcion_corta}
                </h3>
                <p style="color:#666;font-size:13px;line-height:1.5;">${indicacion.texto_instruccion || 'Sin instrucción'}</p>
                <p>
                    <span class="badge">${indicacion.tipo_indicacion}</span>
                    ${indicacion.orden ? `<span class="badge">Orden: ${indicacion.orden}</span>` : ''}
                </p>
                <small style="color:#999;">ID: ${indicacion.id_indicacion} | Creado: ${new Date(indicacion.fechaCreacion).toLocaleDateString()}</small>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error cargando indicaciones:', error);
        document.getElementById('indicaciones-container').innerHTML = '<p style="color:#dc3545;text-align:center;padding:20px;">Error cargando indicaciones</p>';
    }
}

async function crearIndicacion() {
    const descripcion = document.getElementById('indicacion-descripcion').value.trim();
    const instruccion = document.getElementById('indicacion-instruccion').value.trim();
    const tipo = document.getElementById('indicacion-tipo').value;
    const orden = document.getElementById('indicacion-orden').value;

    if (!descripcion || !instruccion) {
        Utils.showToast('Por favor completa descripción e instrucción', 'error');
        return;
    }

    try {
        await API.crearIndicacion({
            descripcion_corta: descripcion,
            texto_instruccion: instruccion,
            tipo_indicacion: tipo,
            orden: orden ? parseInt(orden) : 1
        });

        Utils.showToast('Indicación creada exitosamente', 'success');

        // Limpiar formulario
        document.getElementById('indicacion-descripcion').value = '';
        document.getElementById('indicacion-instruccion').value = '';
        document.getElementById('indicacion-tipo').value = 'AYUNO';
        document.getElementById('indicacion-orden').value = '1';

        // Recargar lista
        cargarIndicaciones();

    } catch (error) {
        console.error('Error creando indicación:', error);
        Utils.showToast(error.message || 'Error al crear indicación', 'error');
    }
}

// ===================================================================
// ⭐ NUEVA FUNCIÓN: Manejar cambio de checkbox
// ===================================================================

function manejarCambioCheckbox(checkbox) {
    const id = parseInt(checkbox.value);
    const nombre = checkbox.dataset.name;
    const area = checkbox.dataset.area;

    if (checkbox.checked) {
        // Agregar al Map
        practicasSeleccionadasMap.set(id, { nombre, area });
    } else {
        // Quitar del Map
        practicasSeleccionadasMap.delete(id);
    }

    // Actualizar vista
    actualizarPracticasSeleccionadas();
}

// ===================================================================
// ⭐ NUEVA FUNCIÓN: Actualizar lista de prácticas seleccionadas
// ===================================================================

function actualizarPracticasSeleccionadas() {
    const section = document.getElementById('selected-practicas-section');
    const container = document.getElementById('selected-practicas-container');
    const countSpan = document.getElementById('selected-count');

    // Actualizar contador
    countSpan.textContent = practicasSeleccionadasMap.size;

    // Mostrar/ocultar sección
    if (practicasSeleccionadasMap.size === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // Limpiar container
    container.innerHTML = '';

    // Agregar badges de prácticas seleccionadas desde el Map
    practicasSeleccionadasMap.forEach((data, id) => {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.style.cssText = 'margin: 3px; display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: #4caf50; color: white; position: relative;';

        const practicaText = document.createElement('span');
        practicaText.textContent = data.nombre;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✖';
        removeBtn.style.cssText = 'background: transparent; border: none; color: white; cursor: pointer; font-size: 14px; padding: 0; margin-left: 5px;';
        removeBtn.title = 'Quitar de la selección';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            // Quitar del Map
            practicasSeleccionadasMap.delete(id);
            // Desmarcar checkbox si está visible
            const checkbox = document.querySelector(`#practicas-list input[value="${id}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            // Actualizar vista
            actualizarPracticasSeleccionadas();
        };

        badge.appendChild(practicaText);
        badge.appendChild(removeBtn);
        container.appendChild(badge);
    });
}

// Exponer el Map al scope global para que solicitudes.js pueda accederlo
window.practicasSeleccionadasMap = practicasSeleccionadasMap;

console.log('✅ tabs.js cargado correctamente');
