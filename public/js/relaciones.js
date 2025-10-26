/**
 * ===================================================================
 * GESTIÓN DE RELACIONES - Prácticas ↔ Grupos ↔ Indicaciones
 * ===================================================================
 *
 * Este módulo maneja la asignación y gestión de relaciones entre:
 * - Prácticas y Grupos (tabla PRACTICA_GRUPO)
 * - Grupos e Indicaciones (tabla GRUPO_INDICACION)
 *
 * ===================================================================
 */

let grupoSeleccionado = null;
let todosLosGrupos = [];
let todasLasIndicaciones = [];
let todasLasPracticas = [];

/**
 * Inicializar la pestaña de relaciones
 */
async function inicializarRelaciones() {
    try {
        // Cargar grupos en el selector
        const responseGrupos = await API.listarGrupos();
        todosLosGrupos = responseGrupos.data;

        actualizarSelectGrupos();

        // Cargar todas las indicaciones
        const responseIndicaciones = await API.listarIndicaciones();
        todasLasIndicaciones = responseIndicaciones.data;

        // Cargar todas las prácticas (primeras 100 para el selector)
        const responsePracticas = await API.listarPracticas({ limit: 100 });
        todasLasPracticas = responsePracticas.data;

        actualizarSelectIndicaciones();
        actualizarSelectPracticas();

    } catch (error) {
        console.error('Error al inicializar relaciones:', error);
        alert('❌ Error al cargar datos: ' + error.message);
    }
}

/**
 * Actualizar el selector de grupos
 */
function actualizarSelectGrupos(filtrados = null) {
    const select = document.getElementById('rel-grupo-select');
    select.innerHTML = '<option value="">-- Selecciona un grupo --</option>';

    const grupos = filtrados || todosLosGrupos;

    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.id_grupo;
        option.textContent = `${grupo.nombre}${grupo.horas_ayuno ? ` (${grupo.horas_ayuno}h ayuno)` : ''}`;
        select.appendChild(option);
    });
}

/**
 * Buscar grupos por término
 */
function buscarGruposParaRelacion() {
    const termino = document.getElementById('rel-grupo-buscar').value.trim().toLowerCase();

    if (termino.length < 2) {
        actualizarSelectGrupos();
        return;
    }

    const gruposFiltrados = todosLosGrupos.filter(grupo =>
        grupo.nombre.toLowerCase().includes(termino) ||
        (grupo.descripcion && grupo.descripcion.toLowerCase().includes(termino))
    );

    actualizarSelectGrupos(gruposFiltrados);
}

/**
 * Actualizar el selector de indicaciones
 */
function actualizarSelectIndicaciones() {
    const select = document.getElementById('rel-indicacion-select');
    select.innerHTML = '<option value="">-- Selecciona una indicación --</option>';

    todasLasIndicaciones.forEach(ind => {
        const option = document.createElement('option');
        option.value = ind.id_indicacion;
        const textoCorto = ind.texto.substring(0, 80) + (ind.texto.length > 80 ? '...' : '');
        option.textContent = `[${ind.tipo}] ${textoCorto}`;
        select.appendChild(option);
    });
}

/**
 * Actualizar el selector de prácticas
 */
function actualizarSelectPracticas(filtradas = null) {
    const select = document.getElementById('rel-practica-select');
    select.innerHTML = '<option value="">-- Selecciona una práctica --</option>';

    const practicas = filtradas || todasLasPracticas;

    practicas.forEach(prac => {
        const option = document.createElement('option');
        option.value = prac.id_practica;
        option.textContent = `${prac.codigo_did} - ${prac.nombre}`;
        select.appendChild(option);
    });
}

/**
 * Buscar prácticas por término
 */
async function buscarPracticasParaRelacion() {
    const termino = document.getElementById('rel-practica-buscar').value.trim();

    if (termino.length < 2) {
        actualizarSelectPracticas();
        return;
    }

    try {
        const response = await API.listarPracticas({ buscar: termino, limit: 50 });
        actualizarSelectPracticas(response.data);
    } catch (error) {
        console.error('Error al buscar prácticas:', error);
    }
}

/**
 * Cargar las relaciones de un grupo seleccionado
 */
async function cargarRelacionesDelGrupo() {
    const idGrupo = document.getElementById('rel-grupo-select').value;

    if (!idGrupo) {
        document.getElementById('relaciones-content').style.display = 'none';
        grupoSeleccionado = null;
        return;
    }

    grupoSeleccionado = parseInt(idGrupo);
    document.getElementById('relaciones-content').style.display = 'block';

    // Cargar indicaciones y prácticas del grupo
    await Promise.all([
        cargarIndicacionesDelGrupo(),
        cargarPracticasDelGrupo()
    ]);
}

/**
 * Cargar indicaciones asociadas al grupo
 */
async function cargarIndicacionesDelGrupo() {
    const container = document.getElementById('grupo-indicaciones-list');
    container.innerHTML = '<div class="loading">Cargando...</div>';

    try {
        const response = await API.obtenerGrupo(grupoSeleccionado);
        const grupo = response.data;

        if (!grupo.indicaciones || grupo.indicaciones.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">No hay indicaciones asociadas a este grupo.</p>';
            return;
        }

        // Ordenar por orden
        const indicaciones = grupo.indicaciones
            .filter(gi => gi.activo)
            .sort((a, b) => a.orden - b.orden);

        let html = '';
        indicaciones.forEach(gi => {
            const ind = gi.indicacion;
            html += `
                <div class="card" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <span class="badge">${ind.tipo}</span>
                        <span class="badge badge-success">Orden: ${gi.orden}</span>
                        <p style="margin-top: 5px;">${ind.texto}</p>
                    </div>
                    <button class="btn btn-danger" style="margin-left: 10px;"
                            onclick="removerIndicacionDelGrupo(${ind.id_indicacion})">
                        🗑️ Remover
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar indicaciones del grupo:', error);
        container.innerHTML = '<p style="color: red;">❌ Error al cargar indicaciones</p>';
    }
}

/**
 * Cargar prácticas asociadas al grupo
 */
async function cargarPracticasDelGrupo() {
    const container = document.getElementById('grupo-practicas-list');
    container.innerHTML = '<div class="loading">Cargando...</div>';

    try {
        // Buscar todas las prácticas que tienen este grupo
        const response = await API.listarPracticas({ limit: 1000 });
        const todasPracticas = response.data;

        // Filtrar las que tienen relación con este grupo
        const practicasDelGrupo = [];

        for (const practica of todasPracticas) {
            // Obtener detalle de la práctica para ver sus grupos
            const detalle = await API.obtenerPractica(practica.id_practica);
            if (detalle.data.grupos) {
                const tieneGrupo = detalle.data.grupos.some(pg =>
                    pg.id_grupo === grupoSeleccionado && pg.activo
                );
                if (tieneGrupo) {
                    practicasDelGrupo.push(practica);
                }
            }
        }

        if (practicasDelGrupo.length === 0) {
            container.innerHTML = '<p style="color: #999; font-style: italic;">No hay prácticas asociadas a este grupo.</p>';
            return;
        }

        let html = '';
        practicasDelGrupo.forEach(prac => {
            html += `
                <div class="card" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${prac.codigo_did}</strong> - ${prac.nombre}
                        <br>
                        <span class="badge">${prac.area?.nombre || 'Sin área'}</span>
                    </div>
                    <button class="btn btn-danger"
                            onclick="removerPracticaDelGrupo(${prac.id_practica})">
                        🗑️ Remover
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar prácticas del grupo:', error);
        container.innerHTML = '<p style="color: red;">❌ Error al cargar prácticas</p>';
    }
}

/**
 * Agregar una indicación al grupo seleccionado
 */
async function agregarIndicacionAGrupo() {
    if (!grupoSeleccionado) {
        alert('⚠️ Por favor selecciona un grupo primero');
        return;
    }

    const idIndicacion = document.getElementById('rel-indicacion-select').value;
    const orden = document.getElementById('rel-indicacion-orden').value;

    if (!idIndicacion) {
        alert('⚠️ Por favor selecciona una indicación');
        return;
    }

    try {
        await API.agregarIndicacionAGrupo(grupoSeleccionado, parseInt(idIndicacion), parseInt(orden));

        // Limpiar formulario
        document.getElementById('rel-indicacion-select').value = '';
        document.getElementById('rel-indicacion-orden').value = '1';

        // Recargar lista
        await cargarIndicacionesDelGrupo();

        alert('✅ Indicación agregada correctamente');

    } catch (error) {
        console.error('Error al agregar indicación:', error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Remover una indicación del grupo
 */
async function removerIndicacionDelGrupo(idIndicacion) {
    if (!confirm('¿Estás seguro de remover esta indicación del grupo?')) {
        return;
    }

    try {
        await API.removerIndicacionDeGrupo(grupoSeleccionado, idIndicacion);
        await cargarIndicacionesDelGrupo();
        alert('✅ Indicación removida correctamente');
    } catch (error) {
        console.error('Error al remover indicación:', error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Agregar una práctica al grupo seleccionado
 */
async function agregarPracticaAGrupo() {
    if (!grupoSeleccionado) {
        alert('⚠️ Por favor selecciona un grupo primero');
        return;
    }

    const idPractica = document.getElementById('rel-practica-select').value;

    if (!idPractica) {
        alert('⚠️ Por favor selecciona una práctica');
        return;
    }

    try {
        await API.agregarPracticaAGrupo(grupoSeleccionado, parseInt(idPractica));

        // Limpiar formulario
        document.getElementById('rel-practica-select').value = '';
        document.getElementById('rel-practica-buscar').value = '';

        // Recargar lista
        await cargarPracticasDelGrupo();

        alert('✅ Práctica agregada correctamente');

    } catch (error) {
        console.error('Error al agregar práctica:', error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Remover una práctica del grupo
 */
async function removerPracticaDelGrupo(idPractica) {
    if (!confirm('¿Estás seguro de remover esta práctica del grupo?')) {
        return;
    }

    try {
        await API.removerPracticaDeGrupo(grupoSeleccionado, idPractica);
        await cargarPracticasDelGrupo();
        alert('✅ Práctica removida correctamente');
    } catch (error) {
        console.error('Error al remover práctica:', error);
        alert('❌ Error: ' + error.message);
    }
}

// Inicializar cuando se abre la pestaña de relaciones
// (se llamará desde tabs.js cuando se cambia a la pestaña)
window.inicializarRelaciones = inicializarRelaciones;
