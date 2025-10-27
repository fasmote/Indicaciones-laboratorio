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
        // Cargar grupos en la lista
        const responseGrupos = await API.listarGrupos();
        todosLosGrupos = responseGrupos.data;

        mostrarGruposEnLista(todosLosGrupos);

        // Cargar todas las indicaciones
        const responseIndicaciones = await API.listarIndicaciones();
        todasLasIndicaciones = responseIndicaciones.data;

        // Cargar todas las prácticas (primeras 100 para el selector)
        const responsePracticas = await API.listarPracticas({ limit: 100 });
        todasLasPracticas = responsePracticas.data;

        actualizarSelectIndicaciones();
        actualizarSelectPracticas();

        // Configurar event listeners
        configurarEventListeners();

    } catch (error) {
        console.error('Error al inicializar relaciones:', error);
        alert('❌ Error al cargar datos: ' + error.message);
    }
}

/**
 * Configurar event listeners para los campos de búsqueda
 */
function configurarEventListeners() {
    console.log('[DEBUG] Configurando event listeners...');

    // Esperar un momento para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
        // Buscador de grupos
        const inputGrupoBuscar = document.getElementById('rel-grupo-buscar');
        if (inputGrupoBuscar) {
            console.log('[DEBUG] Event listener para rel-grupo-buscar configurado');

            // Remover listeners previos si existen para evitar duplicados
            inputGrupoBuscar.removeEventListener('input', buscarGruposParaRelacion);
            inputGrupoBuscar.removeEventListener('keyup', buscarGruposParaRelacion);

            // Agregar listeners
            inputGrupoBuscar.addEventListener('input', function(e) {
                console.log('[DEBUG] Evento INPUT disparado en rel-grupo-buscar');
                buscarGruposParaRelacion();
            });
            inputGrupoBuscar.addEventListener('keyup', function(e) {
                console.log('[DEBUG] Evento KEYUP disparado en rel-grupo-buscar');
                buscarGruposParaRelacion();
            });

            console.log('[DEBUG] Listeners agregados exitosamente a rel-grupo-buscar');
        } else {
            console.error('[ERROR] No se encontró el campo rel-grupo-buscar');
            console.error('[ERROR] Elementos disponibles con id que contienen "rel":',
                Array.from(document.querySelectorAll('[id*="rel"]')).map(el => el.id));
        }

        // Buscador de prácticas
        const inputPracticaBuscar = document.getElementById('rel-practica-buscar');
        if (inputPracticaBuscar) {
            console.log('[DEBUG] Event listener para rel-practica-buscar configurado');

            // Remover listeners previos
            inputPracticaBuscar.removeEventListener('input', buscarPracticasParaRelacion);
            inputPracticaBuscar.removeEventListener('keyup', buscarPracticasParaRelacion);

            // Agregar listeners
            inputPracticaBuscar.addEventListener('input', buscarPracticasParaRelacion);
            inputPracticaBuscar.addEventListener('keyup', buscarPracticasParaRelacion);
        } else {
            console.error('[ERROR] No se encontró el campo rel-practica-buscar');
        }
    }, 100); // Esperar 100ms para que el DOM se renderice
}

/**
 * Mostrar grupos en la lista filtrable (como el simulador)
 */
function mostrarGruposEnLista(grupos) {
    const container = document.getElementById('rel-grupos-list');

    if (!grupos || grupos.length === 0) {
        container.innerHTML = '<p style="color: #999; font-style: italic;">No se encontraron grupos.</p>';
        return;
    }

    let html = '';
    grupos.forEach(grupo => {
        const textoGrupo = `${grupo.nombre}${grupo.horas_ayuno ? ` (${grupo.horas_ayuno}h ayuno)` : ''}`;
        html += `
            <div class="practica-item" data-grupo-id="${grupo.id_grupo}" style="padding: 8px; margin: 4px 0; background: #f8f9fa; border-radius: 4px; cursor: pointer; border: 2px solid transparent;">
                <label style="cursor: pointer; display: block; user-select: none;" onclick="seleccionarGrupo(${grupo.id_grupo})">
                    <strong>${textoGrupo}</strong>
                    ${grupo.descripcion ? `<br><small style="color: #666;">${grupo.descripcion}</small>` : ''}
                </label>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log('[DEBUG] Lista de grupos actualizada con', grupos.length, 'grupos');
}

/**
 * Buscar grupos por término (como filtrarPracticas en el simulador)
 */
function buscarGruposParaRelacion() {
    const searchText = document.getElementById('rel-grupo-buscar').value.toLowerCase();
    console.log('[DEBUG] Buscando grupos con término:', searchText);

    if (searchText === '') {
        mostrarGruposEnLista(todosLosGrupos);
        return;
    }

    const gruposFiltrados = todosLosGrupos.filter(grupo =>
        grupo.nombre.toLowerCase().includes(searchText) ||
        (grupo.descripcion && grupo.descripcion.toLowerCase().includes(searchText))
    );

    console.log('[DEBUG] Grupos filtrados encontrados:', gruposFiltrados.length);
    mostrarGruposEnLista(gruposFiltrados);
}

/**
 * Seleccionar un grupo de la lista
 */
function seleccionarGrupo(idGrupo) {
    console.log('[DEBUG] Grupo seleccionado:', idGrupo);

    // Remover selección anterior
    document.querySelectorAll('.practica-item').forEach(item => {
        item.style.border = '2px solid transparent';
        item.style.background = '#f8f9fa';
    });

    // Marcar nuevo grupo seleccionado
    const itemSeleccionado = document.querySelector(`[data-grupo-id="${idGrupo}"]`);
    if (itemSeleccionado) {
        itemSeleccionado.style.border = '2px solid #4CAF50';
        itemSeleccionado.style.background = '#e8f5e9';
    }

    // Actualizar variable global y cargar relaciones
    grupoSeleccionado = idGrupo;
    cargarRelacionesDelGrupo();
}

/**
 * Cargar las relaciones del grupo seleccionado
 */
async function cargarRelacionesDelGrupo() {
    if (!grupoSeleccionado) {
        document.getElementById('relaciones-content').style.display = 'none';
        return;
    }

    document.getElementById('relaciones-content').style.display = 'block';

    // Cargar indicaciones y prácticas del grupo
    await Promise.all([
        cargarIndicacionesDelGrupo(),
        cargarPracticasDelGrupo()
    ]);
}

/**
 * Actualizar el selector de indicaciones
 */
function actualizarSelectIndicaciones() {
    const select = document.getElementById('rel-indicacion-select');
    const valorActual = select.value; // Guardar selección actual

    // Limpiar todas las opciones existentes
    select.options.length = 0;

    // Agregar opción por defecto
    const defaultOption = new Option('-- Selecciona una indicación --', '');
    select.add(defaultOption);

    // Agregar cada indicación como nueva opción
    todasLasIndicaciones.forEach(ind => {
        const textoCorto = ind.texto.substring(0, 80) + (ind.texto.length > 80 ? '...' : '');
        const textoOpcion = `[${ind.tipo}] ${textoCorto}`;
        const option = new Option(textoOpcion, ind.id_indicacion);
        select.add(option);
    });

    // Restaurar selección si aún existe
    if (valorActual && todasLasIndicaciones.some(i => i.id_indicacion == valorActual)) {
        select.value = valorActual;
    }

    // Forzar refresco visual
    select.style.display = 'none';
    select.offsetHeight; // Force reflow
    select.style.display = '';
}

/**
 * Actualizar el selector de prácticas
 */
function actualizarSelectPracticas(filtradas = null) {
    const select = document.getElementById('rel-practica-select');
    const valorActual = select.value; // Guardar selección actual

    const practicas = filtradas || todasLasPracticas;

    // Limpiar todas las opciones existentes
    select.options.length = 0;

    // Agregar opción por defecto
    const defaultOption = new Option('-- Selecciona una práctica --', '');
    select.add(defaultOption);

    // Agregar cada práctica como nueva opción
    practicas.forEach(prac => {
        const textoOpcion = `${prac.codigo_did} - ${prac.nombre}`;
        const option = new Option(textoOpcion, prac.id_practica);
        select.add(option);
    });

    console.log('[DEBUG] Select de prácticas actualizado con', select.options.length, 'opciones');

    // Restaurar selección si aún existe
    if (valorActual && practicas.some(p => p.id_practica == valorActual)) {
        select.value = valorActual;
    }

    // Forzar refresco visual
    select.style.display = 'none';
    select.offsetHeight; // Force reflow
    select.style.display = '';
}

/**
 * Buscar prácticas por término
 */
async function buscarPracticasParaRelacion() {
    const termino = document.getElementById('rel-practica-buscar').value.trim();

    if (termino === '') {
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
 * Limpiar el formulario de indicación
 */
function limpiarFormularioIndicacion() {
    document.getElementById('rel-indicacion-select').value = '';
    document.getElementById('rel-indicacion-orden').value = '1';
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
        limpiarFormularioIndicacion();

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
 * Limpiar el formulario de práctica
 */
function limpiarFormularioPractica() {
    document.getElementById('rel-practica-select').value = '';
    document.getElementById('rel-practica-buscar').value = '';
    // Restaurar lista completa de prácticas
    actualizarSelectPracticas();
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
        limpiarFormularioPractica();

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

// ==========================================
// EXPONER FUNCIONES AL SCOPE GLOBAL
// ==========================================
// Estas funciones son llamadas desde HTML (onclick, onchange, onkeyup)
// y necesitan estar disponibles en el scope global window

window.inicializarRelaciones = inicializarRelaciones;
window.buscarGruposParaRelacion = buscarGruposParaRelacion;
window.seleccionarGrupo = seleccionarGrupo;
window.cargarRelacionesDelGrupo = cargarRelacionesDelGrupo;
window.agregarIndicacionAGrupo = agregarIndicacionAGrupo;
window.limpiarFormularioIndicacion = limpiarFormularioIndicacion;
window.removerIndicacionDelGrupo = removerIndicacionDelGrupo;
window.buscarPracticasParaRelacion = buscarPracticasParaRelacion;
window.agregarPracticaAGrupo = agregarPracticaAGrupo;
window.limpiarFormularioPractica = limpiarFormularioPractica;
window.removerPracticaDelGrupo = removerPracticaDelGrupo;
