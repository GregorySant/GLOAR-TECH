/* ============================================================
   config.js  —  Configuración global
   ============================================================ */
const APP_CONFIG = Object.freeze({
  SCRIPT_URL: 'http://localhost:3000',
  STORAGE_KEYS: {
    adminKey:     'inv_admin_key',
    userKey:      'inv_user_key',
    cotizaciones: 'inv_cotizaciones',
  },
  DEFAULT_PASSWORDS: {
    admin:   'admin123',
    usuario: 'usuario123',
  },
  SESSION_ROLE_KEY: 'inv_role',
});
