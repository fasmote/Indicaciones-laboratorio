/**
 * ===================================================================
 * UTILS - Funciones de utilidad para la interfaz
 * ===================================================================
 *
 * Este módulo contiene funciones auxiliares reutilizables:
 * - Toast notifications (mensajes temporales)
 * - Formateo de texto
 * - Helpers de DOM
 * - Utilidades generales
 *
 * ===================================================================
 */

const Utils = (() => {
    /**
     * ============================================
     * TOAST NOTIFICATIONS
     * ============================================
     */

    /**
     * Mostrar una notificación toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en ms (default: 3000)
     */
    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto-eliminar después de la duración
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * ============================================
     * FORMATEO DE TEXTO
     * ============================================
     */

    /**
     * Formatear texto de indicaciones para HTML
     * Convierte saltos de línea y numera las indicaciones
     * @param {string} texto - Texto a formatear
     * @returns {string} - HTML formateado
     */
    function formatearIndicaciones(texto) {
        if (!texto) return '';

        // Reemplazar saltos de línea por <br>
        let formateado = texto.replace(/\n/g, '<br>');

        // Hacer negrita los números de indicaciones
        formateado = formateado.replace(/(\d+\.)/g, '<strong>$1</strong>');

        // Hacer negrita las palabras clave
        formateado = formateado.replace(/(AYUNO|IMPORTANTE|NOTA|ATENCIÓN|RESUMEN)/gi, '<strong>$1</strong>');

        return formateado;
    }

    /**
     * Capitalizar primera letra
     * @param {string} str - String a capitalizar
     * @returns {string} - String capitalizado
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * ============================================
     * HELPERS DE DOM
     * ============================================
     */

    /**
     * Mostrar/ocultar elemento
     * @param {string|HTMLElement} element - Selector o elemento
     * @param {boolean} show - true para mostrar, false para ocultar
     */
    function toggleElement(element, show) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        if (show) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }

    /**
     * Limpiar contenido de un elemento
     * @param {string|HTMLElement} element - Selector o elemento
     */
    function clearElement(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;
        el.innerHTML = '';
    }

    /**
     * Scroll suave hacia un elemento
     * @param {string|HTMLElement} element - Selector o elemento
     */
    function scrollToElement(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        el.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * ============================================
     * VALIDACIONES
     * ============================================
     */

    /**
     * Validar si un array está vacío
     * @param {any[]} arr - Array a validar
     * @returns {boolean} - true si está vacío
     */
    function isArrayEmpty(arr) {
        return !arr || !Array.isArray(arr) || arr.length === 0;
    }

    /**
     * Validar email (básico)
     * @param {string} email - Email a validar
     * @returns {boolean} - true si es válido
     */
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * ============================================
     * UTILIDADES GENERALES
     * ============================================
     */

    /**
     * Esperar X milisegundos
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise} - Promesa que se resuelve después del tiempo
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Copiar texto al portapapeles
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>} - true si se copió exitosamente
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Error al copiar:', error);
            // Fallback para navegadores antiguos
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            } catch (fallbackError) {
                console.error('Error en fallback:', fallbackError);
                return false;
            }
        }
    }

    /**
     * Imprimir contenido específico
     * @param {string} selector - Selector del elemento a imprimir
     */
    function printElement(selector) {
        window.print();
    }

    /**
     * Debounce - Limitar frecuencia de ejecución de una función
     * Útil para búsquedas en tiempo real
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} - Función debounced
     */
    function debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Formatear número con separadores de miles
     * @param {number} num - Número a formatear
     * @returns {string} - Número formateado
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Obtener fecha actual formateada
     * @returns {string} - Fecha en formato DD/MM/YYYY
     */
    function getCurrentDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Obtener hora actual formateada
     * @returns {string} - Hora en formato HH:MM
     */
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * ============================================
     * EXPONER MÉTODOS PÚBLICOS
     * ============================================
     */
    return {
        // Toast notifications
        showToast,

        // Formateo
        formatearIndicaciones,
        capitalize,
        formatNumber,

        // DOM helpers
        toggleElement,
        clearElement,
        scrollToElement,

        // Validaciones
        isArrayEmpty,
        isValidEmail,

        // Utilidades generales
        sleep,
        copyToClipboard,
        printElement,
        debounce,
        getCurrentDate,
        getCurrentTime,
    };
})();

// Exponer globalmente
window.Utils = Utils;
