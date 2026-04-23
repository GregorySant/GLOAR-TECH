/* ============================================================
   api.js  —  Comunicación con el backend (Google Apps Script)
   Todos los métodos devuelven Promises con { status, data?, message, id? }
   ============================================================ */

const Api = (() => {
  const url = APP_CONFIG.SCRIPT_URL;

  async function get(params) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${url}?${qs}`);
    return res.json();
  }

  async function post(body) {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    return res.json();
  }

  // ---- Categorías ----
  const getCategorias   = () => get({ action: 'getCategorias' });
  const addCategoria    = (nombre) => post({ action: 'agregarCategoria', nombre });

  // ---- Productos ----
  const getInventario   = () => get({ action: 'getInventario' });
  const searchProducto  = (query) => get({ action: 'buscarProducto', query });
  const addProducto     = (data)  => post({ action: 'agregarProducto', ...data });
  const editProducto    = (data)  => post({ action: 'editarProducto',  ...data });
  const deleteProducto  = (id)    => post({ action: 'eliminarProducto', id });

  // ---- Transacciones ----
  const registrarTransaccion = (data) => post({ action: 'registrarTransaccion', ...data });

  // ---- Resúmenes ----
  const getResumenDiario = () => get({ action: 'getResumenDiario' });
  const getData = (sheetName) => get({ action: 'getData', sheetName });

  // ---- DB ----
  const iniciarDB   = () => get({ action: 'iniciar' });
  const resetearDB  = () => get({ action: 'resetear' });

  return {
    getCategorias, addCategoria,
    getInventario, searchProducto, addProducto, editProducto, deleteProducto,
    registrarTransaccion,
    getResumenDiario, getData,
    iniciarDB, resetearDB,
  };
})();
