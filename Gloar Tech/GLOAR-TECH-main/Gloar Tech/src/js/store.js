/* ============================================================
   store.js  —  Persistencia local (localStorage)
   ============================================================ */

const Store = (() => {
  const KEY = APP_CONFIG.STORAGE_KEYS.cotizaciones;

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function upsert(entry) {
    const list = getAll();
    const idx  = list.findIndex(c => c.header.numero === entry.header.numero);
    if (idx >= 0) list[idx] = entry;
    else list.unshift(entry);
    save(list);
  }

  function remove(numero) {
    save(getAll().filter(c => c.header.numero !== numero));
  }

  function find(numero) {
    return getAll().find(c => c.header.numero === numero) || null;
  }

  return { getAll, upsert, remove, find };
})();
