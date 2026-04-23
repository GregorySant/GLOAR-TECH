/* ============================================================
   auth.js  —  Autenticación y gestión de sesión
   ============================================================ */

const Auth = (() => {
  const { STORAGE_KEYS, DEFAULT_PASSWORDS, SESSION_ROLE_KEY } = APP_CONFIG;

  // ---- Claves de acceso ----
  function getPassword(role) {
    return localStorage.getItem(STORAGE_KEYS[role + 'Key']) || DEFAULT_PASSWORDS[role];
  }

  function setPassword(role, value) {
    localStorage.setItem(STORAGE_KEYS[role + 'Key'], value);
  }

  // ---- Sesión ----
  function getRole() {
    return sessionStorage.getItem(SESSION_ROLE_KEY);
  }

  function setRole(role) {
    sessionStorage.setItem(SESSION_ROLE_KEY, role);
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_ROLE_KEY);
  }

  function isLoggedIn() {
    return !!getRole();
  }

  // ---- Validación ----
  function login(role, password) {
    return password === getPassword(role);
  }

  // ---- Permisos ----
  function isAdmin() {
    return getRole() === 'admin';
  }

  return { getPassword, setPassword, getRole, setRole, clearSession, isLoggedIn, login, isAdmin };
})();
