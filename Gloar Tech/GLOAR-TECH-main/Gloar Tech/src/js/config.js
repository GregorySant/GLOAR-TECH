/* ============================================================
   config.js  —  Configuración global de la aplicación
   ============================================================ */

const APP_CONFIG = Object.freeze({
  /** URL del Google Apps Script desplegado como Web App */
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwgdJFHshcEWoIKm8bu_nFlnoyP2xvbFDyq95FP2zwwCvq8ZfRSMVyflMtdEg9zw-oXlA/exec',

  /** Claves de localStorage para las contraseñas */
  STORAGE_KEYS: {
    adminKey:  'inv_admin_key',
    userKey:   'inv_user_key',
    cotizaciones: 'inv_cotizaciones',
  },

  /** Contraseñas por defecto (cambiables desde Configuración) */
  DEFAULT_PASSWORDS: {
    admin:   'admin123',
    usuario: 'usuario123',
  },

  /** Nombre del ítem en sessionStorage que almacena el rol activo */
  SESSION_ROLE_KEY: 'inv_role',
});
