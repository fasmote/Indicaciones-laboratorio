/**
 * ===================================================================
 * CRUD MANAGEMENT - Gestión completa de ABM (Alta, Baja, Modificación)
 * ===================================================================
 *
 * Este módulo maneja la interfaz de gestión (editar/eliminar) para:
 * - Prácticas
 * - Grupos
 * - Indicaciones
 *
 * ===================================================================
 */

// ===================================================================
// GESTIÓN DE PRÁCTICAS
// ===================================================================

let practicaEnEdicion = null;

async function cargarPracticas() {
    try {
        const response = await API.listarPracticas({ limit: 1000 });

        const container = document.getElementById('practicas-container');

        if (response.data.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay prácticas registradas</div>';
            return;
        }

        let html = '<div style="margin-top: 15px;">';

        response.data.forEach(practica => {
            html += `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h3>${practica.nombre}</h3>
                            <p><strong>Código DID:</strong> ${practica.codigo_did}</p>
                            <p><strong>Área:</strong> ${practica.area ? practica.area.nombre : 'Sin área'}</p>
                        </div>
                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                            <button class="btn btn-info" style="padding: 8px 12px; margin: 0;" onclick="editarPractica(${practica.id_practica})">
                                ✏️ Editar
                            </button>
                            <button class="btn" style="padding: 8px 12px; margin: 0; background: #dc3545; color: white;" onclick="eliminarPractica(${practica.id_practica}, '${practica.nombre.replace(/'/g, "\\'")}')">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar prácticas:', error);
        document.getElementById('practicas-container').innerHTML =
            '<div class="alert alert-error">Error al cargar prácticas: ' + error.message + '</div>';
    }
}

async function crearPractica() {
    try {
        const nombre = document.getElementById('practica-nombre').value.trim();
        const codigo = document.getElementById('practica-codigo').value.trim();
        const idArea = document.getElementById('practica-area').value;

        if (!nombre || !codigo || !idArea) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        if (practicaEnEdicion) {
            // Modo edición
            await API.actualizarPractica(practicaEnEdicion, {
                nombre,
                codigo_did: codigo,
                id_area: parseInt(idArea)
            });

            alert('✅ Práctica actualizada correctamente');
            cancelarEdicionPractica();
        } else {
            // Modo creación
            await API.crearPractica({
                nombre,
                codigo_did: codigo,
                id_area: parseInt(idArea)
            });

            alert('✅ Práctica creada correctamente');
        }

        // Limpiar formulario
        document.getElementById('practica-nombre').value = '';
        document.getElementById('practica-codigo').value = '';
        document.getElementById('practica-area').value = '';

        // Recargar lista
        cargarPracticas();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

async function editarPractica(id) {
    try {
        const response = await API.obtenerPractica(id);
        const practica = response.data;

        // Llenar formulario
        document.getElementById('practica-nombre').value = practica.nombre;
        document.getElementById('practica-codigo').value = practica.codigo_did;
        document.getElementById('practica-area').value = practica.id_area;

        // Cambiar modo edición
        practicaEnEdicion = id;

        // Cambiar texto del botón
        const btn = document.querySelector('#practicas button.btn-primary');
        btn.textContent = '💾 Guardar Cambios';
        btn.style.background = '#28a745';

        // Agregar botón cancelar si no existe
        let btnCancelar = document.querySelector('#practicas .btn-cancelar');
        if (!btnCancelar) {
            btnCancelar = document.createElement('button');
            btnCancelar.className = 'btn btn-cancelar';
            btnCancelar.textContent = '❌ Cancelar';
            btnCancelar.style.background = '#6c757d';
            btnCancelar.style.color = 'white';
            btnCancelar.onclick = cancelarEdicionPractica;
            btn.parentNode.insertBefore(btnCancelar, btn.nextSibling);
        }

        // Scroll al formulario
        document.getElementById('practica-nombre').scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar práctica: ' + error.message);
    }
}

function cancelarEdicionPractica() {
    practicaEnEdicion = null;

    // Limpiar formulario
    document.getElementById('practica-nombre').value = '';
    document.getElementById('practica-codigo').value = '';
    document.getElementById('practica-area').value = '';

    // Restaurar botón
    const btn = document.querySelector('#practicas button.btn-primary');
    btn.textContent = '➕ Crear Práctica';
    btn.style.background = '#667eea';

    // Eliminar botón cancelar
    const btnCancelar = document.querySelector('#practicas .btn-cancelar');
    if (btnCancelar) {
        btnCancelar.remove();
    }
}

async function eliminarPractica(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar la práctica "${nombre}"?\n\nEsta acción es reversible (eliminación lógica).`)) {
        return;
    }

    try {
        await API.eliminarPractica(id);
        alert('✅ Práctica eliminada correctamente');
        cargarPracticas();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
}

function filtrarListaPracticas() {
    const buscar = document.getElementById('search-practicas-list').value.toLowerCase();
    const cards = document.querySelectorAll('#practicas-container .card');

    cards.forEach(card => {
        const texto = card.textContent.toLowerCase();
        card.style.display = texto.includes(buscar) ? 'block' : 'none';
    });
}

// ===================================================================
// GESTIÓN DE GRUPOS
// ===================================================================

let grupoEnEdicion = null;

async function cargarGrupos() {
    try {
        const response = await API.listarGrupos({ limit: 1000 });

        const container = document.getElementById('grupos-container');

        if (response.data.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay grupos registrados</div>';
            return;
        }

        let html = '<div style="margin-top: 15px;">';

        response.data.forEach(grupo => {
            const detalles = [];
            if (grupo.horas_ayuno) detalles.push(`Ayuno: ${grupo.horas_ayuno}h`);
            if (grupo.tipo_orina) detalles.push(`Orina: ${grupo.tipo_orina}`);
            if (grupo.descripcion) detalles.push(grupo.descripcion);

            html += `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h3>${grupo.nombre}</h3>
                            ${detalles.length > 0 ? `<p>${detalles.join(' • ')}</p>` : ''}
                        </div>
                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                            <button class="btn btn-info" style="padding: 8px 12px; margin: 0;" onclick="editarGrupo(${grupo.id_grupo})">
                                ✏️ Editar
                            </button>
                            <button class="btn" style="padding: 8px 12px; margin: 0; background: #dc3545; color: white;" onclick="eliminarGrupo(${grupo.id_grupo}, '${grupo.nombre.replace(/'/g, "\\'")}')">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar grupos:', error);
        document.getElementById('grupos-container').innerHTML =
            '<div class="alert alert-error">Error al cargar grupos: ' + error.message + '</div>';
    }
}

async function crearGrupo() {
    try {
        const nombre = document.getElementById('grupo-nombre').value.trim();
        const descripcion = document.getElementById('grupo-descripcion').value.trim();
        const horasAyuno = document.getElementById('grupo-ayuno').value;
        const tipoOrina = document.getElementById('grupo-orina-tipo').value;

        if (!nombre) {
            alert('Por favor ingresa el nombre del grupo');
            return;
        }

        const datos = {
            nombre,
            descripcion: descripcion || null,
            horas_ayuno: horasAyuno ? parseInt(horasAyuno) : null,
            tipo_orina: tipoOrina || null
        };

        if (grupoEnEdicion) {
            // Modo edición
            await API.actualizarGrupo(grupoEnEdicion, datos);
            alert('✅ Grupo actualizado correctamente');
            cancelarEdicionGrupo();
        } else {
            // Modo creación
            await API.crearGrupo(datos);
            alert('✅ Grupo creado correctamente');
        }

        // Limpiar formulario
        document.getElementById('grupo-nombre').value = '';
        document.getElementById('grupo-descripcion').value = '';
        document.getElementById('grupo-ayuno').value = '';
        document.getElementById('grupo-orina-tipo').value = '';

        // Recargar lista
        cargarGrupos();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

async function editarGrupo(id) {
    try {
        const response = await API.obtenerGrupo(id);
        const grupo = response.data;

        // Llenar formulario
        document.getElementById('grupo-nombre').value = grupo.nombre;
        document.getElementById('grupo-descripcion').value = grupo.descripcion || '';
        document.getElementById('grupo-ayuno').value = grupo.horas_ayuno || '';
        document.getElementById('grupo-orina-tipo').value = grupo.tipo_orina || '';

        // Cambiar modo edición
        grupoEnEdicion = id;

        // Cambiar texto del botón
        const btn = document.querySelector('#grupos button.btn-primary');
        btn.textContent = '💾 Guardar Cambios';
        btn.style.background = '#28a745';

        // Agregar botón cancelar si no existe
        let btnCancelar = document.querySelector('#grupos .btn-cancelar');
        if (!btnCancelar) {
            btnCancelar = document.createElement('button');
            btnCancelar.className = 'btn btn-cancelar';
            btnCancelar.textContent = '❌ Cancelar';
            btnCancelar.style.background = '#6c757d';
            btnCancelar.style.color = 'white';
            btnCancelar.onclick = cancelarEdicionGrupo;
            btn.parentNode.insertBefore(btnCancelar, btn.nextSibling);
        }

        // Scroll al formulario
        document.getElementById('grupo-nombre').scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar grupo: ' + error.message);
    }
}

function cancelarEdicionGrupo() {
    grupoEnEdicion = null;

    // Limpiar formulario
    document.getElementById('grupo-nombre').value = '';
    document.getElementById('grupo-descripcion').value = '';
    document.getElementById('grupo-ayuno').value = '';
    document.getElementById('grupo-orina-tipo').value = '';

    // Restaurar botón
    const btn = document.querySelector('#grupos button.btn-primary');
    btn.textContent = '➕ Crear Grupo';
    btn.style.background = '#667eea';

    // Eliminar botón cancelar
    const btnCancelar = document.querySelector('#grupos .btn-cancelar');
    if (btnCancelar) {
        btnCancelar.remove();
    }
}

async function eliminarGrupo(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el grupo "${nombre}"?\n\nEsta acción es reversible (eliminación lógica).`)) {
        return;
    }

    try {
        await API.eliminarGrupo(id);
        alert('✅ Grupo eliminado correctamente');
        cargarGrupos();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
}

// ===================================================================
// GESTIÓN DE INDICACIONES
// ===================================================================

let indicacionEnEdicion = null;

async function cargarIndicaciones() {
    try {
        const response = await API.listarIndicaciones();

        const container = document.getElementById('indicaciones-container');

        if (response.data.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay indicaciones registradas</div>';
            return;
        }

        let html = '<div style="margin-top: 15px;">';

        response.data.forEach(indicacion => {
            const badgeColors = {
                'AYUNO': '#ff9800',
                'HORARIO': '#2196f3',
                'MEDICACION': '#f44336',
                'ORINA': '#4caf50',
                'GENERAL': '#9e9e9e'
            };
            const color = badgeColors[indicacion.tipo] || '#9e9e9e';

            // Crear preview del texto (primeros 80 caracteres)
            const textoPreview = indicacion.texto.length > 80
                ? indicacion.texto.substring(0, 80) + '...'
                : indicacion.texto;

            html += `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span style="background: ${color}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
                                    ${indicacion.tipo}
                                </span>
                                <span style="color: #999; font-size: 12px;">Orden: ${indicacion.orden}</span>
                            </div>
                            <p style="margin: 0;">${indicacion.texto}</p>
                        </div>
                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                            <button class="btn btn-info" style="padding: 8px 12px; margin: 0;" onclick="editarIndicacion(${indicacion.id_indicacion})">
                                ✏️ Editar
                            </button>
                            <button class="btn" style="padding: 8px 12px; margin: 0; background: #dc3545; color: white;" onclick="eliminarIndicacion(${indicacion.id_indicacion}, '${textoPreview.replace(/'/g, "\\'")}')">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar indicaciones:', error);
        document.getElementById('indicaciones-container').innerHTML =
            '<div class="alert alert-error">Error al cargar indicaciones: ' + error.message + '</div>';
    }
}

async function crearIndicacion() {
    try {
        const texto = document.getElementById('indicacion-texto').value.trim();
        const tipo = document.getElementById('indicacion-tipo').value;
        const orden = document.getElementById('indicacion-orden').value;

        if (!texto) {
            alert('Por favor ingresa el texto de la indicación');
            return;
        }

        const datos = {
            texto,
            tipo,
            orden: parseInt(orden) || 1
        };

        if (indicacionEnEdicion) {
            // Modo edición
            await API.actualizarIndicacion(indicacionEnEdicion, datos);
            alert('✅ Indicación actualizada correctamente');
            cancelarEdicionIndicacion();
        } else {
            // Modo creación
            await API.crearIndicacion(datos);
            alert('✅ Indicación creada correctamente');
        }

        // Limpiar formulario
        document.getElementById('indicacion-texto').value = '';
        document.getElementById('indicacion-tipo').value = 'AYUNO';
        document.getElementById('indicacion-orden').value = '1';

        // Recargar lista
        cargarIndicaciones();

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: ' + error.message);
    }
}

async function editarIndicacion(id) {
    try {
        const response = await API.obtenerIndicacion(id);
        const indicacion = response.data;

        // Llenar formulario
        document.getElementById('indicacion-texto').value = indicacion.texto;
        document.getElementById('indicacion-tipo').value = indicacion.tipo;
        document.getElementById('indicacion-orden').value = indicacion.orden;

        // Cambiar modo edición
        indicacionEnEdicion = id;

        // Cambiar texto del botón
        const btn = document.querySelector('#indicaciones button.btn-primary');
        btn.textContent = '💾 Guardar Cambios';
        btn.style.background = '#28a745';

        // Agregar botón cancelar si no existe
        let btnCancelar = document.querySelector('#indicaciones .btn-cancelar');
        if (!btnCancelar) {
            btnCancelar = document.createElement('button');
            btnCancelar.className = 'btn btn-cancelar';
            btnCancelar.textContent = '❌ Cancelar';
            btnCancelar.style.background = '#6c757d';
            btnCancelar.style.color = 'white';
            btnCancelar.onclick = cancelarEdicionIndicacion;
            btn.parentNode.insertBefore(btnCancelar, btn.nextSibling);
        }

        // Scroll al formulario
        document.getElementById('indicacion-texto').scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al cargar indicación: ' + error.message);
    }
}

function cancelarEdicionIndicacion() {
    indicacionEnEdicion = null;

    // Limpiar formulario
    document.getElementById('indicacion-texto').value = '';
    document.getElementById('indicacion-tipo').value = 'AYUNO';
    document.getElementById('indicacion-orden').value = '1';

    // Restaurar botón
    const btn = document.querySelector('#indicaciones button.btn-primary');
    btn.textContent = '➕ Crear Indicación';
    btn.style.background = '#667eea';

    // Eliminar botón cancelar
    const btnCancelar = document.querySelector('#indicaciones .btn-cancelar');
    if (btnCancelar) {
        btnCancelar.remove();
    }
}

async function eliminarIndicacion(id, textoPreview) {
    if (!confirm(`¿Estás seguro de eliminar esta indicación?\n\n"${textoPreview}"\n\nEsta acción es reversible (eliminación lógica).`)) {
        return;
    }

    try {
        await API.eliminarIndicacion(id);
        alert('✅ Indicación eliminada correctamente');
        cargarIndicaciones();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
}

// ===================================================================
// INICIALIZACIÓN
// ===================================================================

// Cargar datos cuando se cambia de tab
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.textContent.includes('Prácticas') ? 'practicas' :
                           tab.textContent.includes('Grupos') ? 'grupos' :
                           tab.textContent.includes('Indicaciones') ? 'indicaciones' : null;

            if (tabName === 'practicas') {
                setTimeout(cargarPracticas, 100);
            } else if (tabName === 'grupos') {
                setTimeout(cargarGrupos, 100);
            } else if (tabName === 'indicaciones') {
                setTimeout(cargarIndicaciones, 100);
            }
        });
    });
});
