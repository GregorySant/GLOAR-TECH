/* ============================================================
   app.js  —  Controlador principal de la aplicación
   Depende de: config.js → auth.js → api.js → utils.js → store.js → ui.js
   ============================================================ */

// ----------------------------------------------------------------
// GUARD: redirigir al login si no hay sesión
// ----------------------------------------------------------------
if (!Auth.isLoggedIn()) {
  window.location.href = 'pages/login.html';
}

// ----------------------------------------------------------------
// ESTADO LOCAL
// ----------------------------------------------------------------
const State = {
  productCache:     {},   // { [id]: productObject }
  resumenType:      '',
  resumenData:      [],
  cotItems:         [],
  cotCounter:       0,
  editingCotNumero: null,
  charts: { financiero: null, tendencias: null },
};

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  UI.applyRole();
  UI.initNavigation();
  UI.initMobileSidebar();
  UI.initModals();
  window.addEventListener('resize', UI.optimizeTables);

  loadInitialData();
  bindForms();
  bindModals();
  bindLogout();
});

// ----------------------------------------------------------------
// INITIAL DATA
// ----------------------------------------------------------------
async function loadInitialData() {
  try {
    const res = await Api.getCategorias();
    if (res.status === 'success') {
      UI.populateCategorySelects(res.data);
      UI.buildCategoryList(res.data);
    } else {
      UI.populateCategorySelects([]);
      UI.buildCategoryList([]);
    }
  } catch {
    UI.populateCategorySelects([]);
    UI.buildCategoryList([]);
  }
}

// ----------------------------------------------------------------
// LOGOUT
// ----------------------------------------------------------------
function bindLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    Auth.clearSession();
    State.cotItems = [];
    window.location.href = 'pages/login.html';
  });
}

// ----------------------------------------------------------------
// BIND FORMS & EVENTS
// ----------------------------------------------------------------
function bindForms() {
  // Dashboard
  document.getElementById('cargarDatosGraficosBtn')?.addEventListener('click', handleLoadDashboard);
  document.getElementById('calcularResumenBtn')?.addEventListener('click', calcularResumen);

  // Inventario
  document.getElementById('cargarInventarioBtn')?.addEventListener('click', loadInventario);

  // Productos
  document.getElementById('productoForm')?.addEventListener('submit', handleAddProducto);

  // Editar producto
  document.getElementById('ep_buscarBtn')?.addEventListener('click', handleBuscarParaEditar);
  document.getElementById('ep_query')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleBuscarParaEditar(); } });
  document.getElementById('editProductoForm')?.addEventListener('submit', handleEditarProducto);
  document.getElementById('ep_eliminarBtn')?.addEventListener('click', handleEliminarProducto);

  // Categorías
  document.getElementById('categoriaForm')?.addEventListener('submit', handleAddCategoria);

  // Compras / Ventas
  document.getElementById('co_query')?.addEventListener('input', e => handleProductSearch(e.target.value, 'co'));
  document.getElementById('v_query')?.addEventListener('input',  e => handleProductSearch(e.target.value, 'v'));
  document.getElementById('compraForm')?.addEventListener('submit', e => handleTransaccion(e, 'compra'));
  document.getElementById('ventaForm')?.addEventListener('submit',  e => handleTransaccion(e, 'venta'));

  // Cotización
  document.getElementById('cot_query')?.addEventListener('input', e => handleProductSearch(e.target.value, 'cot'));
  document.getElementById('cot_nuevaBtn')?.addEventListener('click', () => abrirFormCotizacion(null));
  document.getElementById('cot_agregarBtn')?.addEventListener('click', cotAgregar);
  document.getElementById('cot_guardarBtn')?.addEventListener('click', cotGuardar);
  document.getElementById('cot_generarExcelBtn')?.addEventListener('click', () => cotDescargar('excel'));
  document.getElementById('cot_generarPDFBtn')?.addEventListener('click',   () => cotDescargar('pdf'));
  document.getElementById('cot_limpiarBtn')?.addEventListener('click', cotCancelar);

  // Resúmenes
  document.getElementById('resumenVentasBtn')?.addEventListener('click', () => loadResumen('Ventas'));
  document.getElementById('resumenComprasBtn')?.addEventListener('click', () => loadResumen('Compras'));
  document.getElementById('descargarResumenBtn')?.addEventListener('click', downloadResumen);

  // Configuración
  document.getElementById('iniciarDBBtn')?.addEventListener('click', () =>
    UI.showAdminConfirm('Confirme la clave de administrador para iniciar la base de datos.', () => handleDB('iniciar')));
  document.getElementById('resetDBBtn')?.addEventListener('click', () =>
    UI.showAdminConfirm('¡Ingrese la clave de administrador para RESETEAR todos los datos!', () => {
      if (confirm('¿Seguro? Esta acción es irreversible.')) handleDB('resetear');
    }));
  document.getElementById('cambiarClaveAdminBtn')?.addEventListener('click', handleChangeAdminKey);
  document.getElementById('cambiarClaveUserBtn')?.addEventListener('click', handleChangeUserKey);

  // Sección enter events
  document.getElementById('dashboard')?.addEventListener('section:enter', handleLoadDashboard);
  document.getElementById('inventario')?.addEventListener('section:enter', loadInventario);
  document.getElementById('cotizacion')?.addEventListener('section:enter', renderCotList);
}

function bindModals() {
  document.getElementById('downloadInvoiceExcelBtn')?.addEventListener('click', UI.downloadCurrentInvoiceExcel);
  document.getElementById('downloadInvoicePDFBtn')?.addEventListener('click',   UI.downloadCurrentInvoicePDF);
}

// ----------------------------------------------------------------
// DASHBOARD
// ----------------------------------------------------------------
async function handleLoadDashboard() {
  await calcularResumen();
  await loadCharts();
}

async function calcularResumen() {
  Utils.showAlert('statusDashboard', 'info', 'Calculando resumen financiero...');
  try {
    const [vRes, cRes] = await Promise.all([Api.getData('VENTAS'), Api.getData('COMPRAS')]);
    let tv = 0, tc = 0;
    if (vRes.status === 'success' && vRes.data) tv = vRes.data.reduce((s, v) => s + parseFloat(v.cantidad) * parseFloat(v.precio_venta), 0);
    if (cRes.status === 'success' && cRes.data) tc = cRes.data.reduce((s, c) => s + parseFloat(c.cantidad) * parseFloat(c.precio_compra), 0);
    const g = tv - tc;
    document.getElementById('totalVentas').textContent    = `$${tv.toFixed(2)}`;
    document.getElementById('totalCompras').textContent   = `$${tc.toFixed(2)}`;
    document.getElementById('totalGanancias').textContent = `$${g.toFixed(2)}`;
    document.getElementById('totalGastos').textContent    = `$${tc.toFixed(2)}`;
    document.getElementById('totalGanancias').style.color =
      g > 0 ? 'var(--color-success)' : g < 0 ? 'var(--color-danger)' : 'var(--gray-500)';
    Utils.showAlert('statusDashboard', 'success', `Ventas: $${tv.toFixed(2)} | Compras: $${tc.toFixed(2)} | Ganancia: $${g.toFixed(2)}`);
  } catch (err) { Utils.showAlert('statusDashboard', 'error', err.message); }
}

async function loadCharts() {
  try {
    const r = await Api.getResumenDiario();
    if (r.status === 'success' && r.data?.length) renderCharts(r.data);
    else await loadChartsFromRaw();
  } catch {}
}

async function loadChartsFromRaw() {
  try {
    const [vRes, cRes] = await Promise.all([Api.getData('VENTAS'), Api.getData('COMPRAS')]);
    const vF = {}, cF = {};
    if (vRes.status === 'success') vRes.data.forEach(v => { const f = new Date(v.fecha).toLocaleDateString(); vF[f] = (vF[f] || 0) + parseFloat(v.cantidad) * parseFloat(v.precio_venta); });
    if (cRes.status === 'success') cRes.data.forEach(c => { const f = new Date(c.fecha).toLocaleDateString(); cF[f] = (cF[f] || 0) + parseFloat(c.cantidad) * parseFloat(c.precio_compra); });
    const fechas = [...new Set([...Object.keys(vF), ...Object.keys(cF)])].sort((a, b) => new Date(a) - new Date(b));
    renderCharts(fechas.map(f => ({ fecha: f, total_ventas: vF[f] || 0, total_compras: cF[f] || 0, ganancia: (vF[f] || 0) - (cF[f] || 0) })));
  } catch { Utils.showAlert('statusDashboard', 'warning', 'Sin datos suficientes para gráficos.'); }
}

function renderCharts(data) {
  const labels   = data.map(d => d.fecha);
  const ventas   = data.map(d => parseFloat(d.total_ventas) || 0);
  const compras  = data.map(d => parseFloat(d.total_compras) || 0);
  const ganancias= data.map(d => parseFloat(d.ganancia) || 0);

  if (State.charts.financiero) State.charts.financiero.destroy();
  State.charts.financiero = new Chart(document.getElementById('chartFinanciero').getContext('2d'), {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Ventas',   data: ventas,   backgroundColor: 'rgba(5,93,226,0.7)',   borderColor: 'rgba(5,93,226,1)',   borderWidth: 1 },
      { label: 'Compras',  data: compras,  backgroundColor: 'rgba(23,162,184,0.7)', borderColor: 'rgba(23,162,184,1)', borderWidth: 1 },
      { label: 'Ganancias',data: ganancias,type: 'line', fill: false, borderColor: 'rgba(40,167,69,1)', borderWidth: 2, tension: 0.1 },
    ]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Resumen Financiero' }, tooltip: { mode: 'index', intersect: false } }, scales: { y: { beginAtZero: true } } },
  });

  if (State.charts.tendencias) State.charts.tendencias.destroy();
  State.charts.tendencias = new Chart(document.getElementById('chartTendencias').getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Ventas Acumuladas',  data: ventas.reduce((a,c,i) => [...a,(a[i-1]||0)+c],[]), borderColor: 'rgba(5,93,226,1)', backgroundColor: 'rgba(5,93,226,0.08)', tension: 0.1, fill: true },
      { label: 'Compras Acumuladas', data: compras.reduce((a,c,i) => [...a,(a[i-1]||0)+c],[]), borderColor: 'rgba(23,162,184,1)', backgroundColor: 'rgba(23,162,184,0.08)', tension: 0.1, fill: true },
    ]},
    options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Tendencias Acumuladas' } }, scales: { y: { beginAtZero: true } } },
  });
}

// ----------------------------------------------------------------
// INVENTARIO
// ----------------------------------------------------------------
async function loadInventario() {
  Utils.showAlert('statusInventario', 'info', 'Cargando inventario...');
  const tb = document.getElementById('inventarioTableBody');
  tb.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';
  try {
    const res = await Api.getInventario();
    if (res.status === 'success' && res.data?.length) {
      Utils.showAlert('statusInventario', 'success', `${res.data.length} productos cargados.`);
      tb.innerHTML = res.data.map(p => `
        <tr>
          <td>${p.id}</td><td>${p.nombre}</td><td>${p['código']}</td>
          <td>${p['categoría']}</td>
          <td class="${p.stock < 5 ? 'u-danger' : ''}">${p.stock}</td>
          <td>$${parseFloat(p.precio_compra || 0).toFixed(2)}</td>
          <td>$${parseFloat(p.precio_venta).toFixed(2)}</td>
        </tr>`).join('');
      setTimeout(UI.optimizeTables, 80);
    } else {
      Utils.showAlert('statusInventario', 'warning', res.message || 'Sin productos.');
      tb.innerHTML = '<tr><td colspan="7">No hay productos registrados.</td></tr>';
    }
  } catch (err) {
    Utils.showAlert('statusInventario', 'error', err.message);
    tb.innerHTML = '<tr><td colspan="7">Error al cargar.</td></tr>';
  }
}

// ----------------------------------------------------------------
// CATEGORÍAS
// ----------------------------------------------------------------
async function handleAddCategoria(e) {
  e.preventDefault();
  const btn = e.submitter; btn.disabled = true;
  Utils.showAlert('statusCategoria', 'info', 'Agregando...');
  try {
    const res = await Api.addCategoria(document.getElementById('c_nombre').value);
    if (res.status === 'success') {
      Utils.showAlert('statusCategoria', 'success', res.message);
      e.target.reset();
      loadInitialData();
    } else Utils.showAlert('statusCategoria', 'error', res.message);
  } catch (err) { Utils.showAlert('statusCategoria', 'error', err.message); }
  finally { btn.disabled = false; }
}

// ----------------------------------------------------------------
// AGREGAR PRODUCTO (ID 7 dígitos generado en backend)
// ----------------------------------------------------------------
async function handleAddProducto(e) {
  e.preventDefault();
  const btn = e.submitter; btn.disabled = true;
  Utils.showAlert('statusProducto', 'info', 'Registrando producto...');
  try {
    const data = {
      nombre:         document.getElementById('p_nombre').value,
      codigo:         document.getElementById('p_codigo').value,
      categoria:      document.getElementById('p_categoria').value,
      precio_compra:  document.getElementById('p_precio_compra').value,
      precio_venta:   document.getElementById('p_precio_venta').value,
      stock:          document.getElementById('p_stock').value,
    };
    const res = await Api.addProducto(data);
    if (res.status === 'success') {
      Utils.showAlert('statusProducto', 'success', res.message);
      e.target.reset();
    } else Utils.showAlert('statusProducto', 'error', res.message);
  } catch (err) { Utils.showAlert('statusProducto', 'error', err.message); }
  finally { btn.disabled = false; }
}

// ----------------------------------------------------------------
// EDITAR / ELIMINAR PRODUCTO
// ----------------------------------------------------------------
async function handleBuscarParaEditar() {
  const query = document.getElementById('ep_query').value.trim();
  document.getElementById('editProductContainer').classList.add('u-hidden');
  if (query.length < 2) return Utils.showAlert('statusEditProducto', 'warning', 'Escriba al menos 2 caracteres.');
  Utils.showAlert('statusEditProducto', 'info', 'Buscando...');
  try {
    const res = await Api.searchProducto(query);
    if (res.status === 'success' && res.data?.length) {
      const p = res.data[0];
      document.getElementById('ep_id').value           = p.id;
      document.getElementById('ep_nombre').value       = p.nombre;
      document.getElementById('ep_codigo').value       = p['código'] || p.codigo || '';
      document.getElementById('ep_precio_compra').value= parseFloat(p.precio_compra || 0).toFixed(2);
      document.getElementById('ep_precio_venta').value = parseFloat(p.precio_venta  || 0).toFixed(2);
      document.getElementById('ep_stock').value        = p.stock || 0;
      const sel = document.getElementById('ep_categoria');
      const cat = p['categoría'] || p.categoria || '';
      for (const opt of sel.options) { if (opt.value === cat) { opt.selected = true; break; } }
      document.getElementById('editProductContainer').classList.remove('u-hidden');
      Utils.showAlert('statusEditProducto', 'success', `Producto encontrado: ${p.nombre} (ID: ${p.id})`);
    } else Utils.showAlert('statusEditProducto', 'warning', res.message || 'No encontrado.');
  } catch (err) { Utils.showAlert('statusEditProducto', 'error', err.message); }
}

async function handleEditarProducto(e) {
  e.preventDefault();
  const btn = e.submitter; btn.disabled = true;
  Utils.showAlert('statusEditProducto', 'info', 'Guardando...');
  try {
    const data = {
      id:            document.getElementById('ep_id').value,
      nombre:        document.getElementById('ep_nombre').value,
      codigo:        document.getElementById('ep_codigo').value,
      categoria:     document.getElementById('ep_categoria').value,
      precio_compra: document.getElementById('ep_precio_compra').value,
      precio_venta:  document.getElementById('ep_precio_venta').value,
      stock:         document.getElementById('ep_stock').value,
    };
    const res = await Api.editProducto(data);
    if (res.status === 'success') Utils.showAlert('statusEditProducto', 'success', res.message);
    else Utils.showAlert('statusEditProducto', 'error', res.message);
  } catch (err) { Utils.showAlert('statusEditProducto', 'error', err.message); }
  finally { btn.disabled = false; }
}

function handleEliminarProducto() {
  const id     = document.getElementById('ep_id').value;
  const nombre = document.getElementById('ep_nombre').value;
  if (!id) return;
  UI.showDeleteConfirm(`¿Eliminar el producto "${nombre}" (ID: ${id})?`, async () => {
    Utils.showAlert('statusEditProducto', 'info', 'Eliminando...');
    try {
      const res = await Api.deleteProducto(id);
      if (res.status === 'success') {
        Utils.showAlert('statusEditProducto', 'success', res.message);
        document.getElementById('editProductContainer').classList.add('u-hidden');
        document.getElementById('ep_query').value = '';
      } else Utils.showAlert('statusEditProducto', 'error', res.message);
    } catch (err) { Utils.showAlert('statusEditProducto', 'error', err.message); }
  });
}

// ----------------------------------------------------------------
// BÚSQUEDA DE PRODUCTO (compras / ventas / cotización)
// ----------------------------------------------------------------
async function handleProductSearch(query, prefix) {
  const detailDiv = document.getElementById(`${prefix}_product_details`);
  const idInput   = document.getElementById(`${prefix}_producto_id`);
  const submitBtn = prefix === 'co' ? document.getElementById('co_submit_btn')
                  : prefix === 'v'  ? document.getElementById('v_submit_btn')
                  : null;
  const addBtn    = prefix === 'cot' ? document.getElementById('cot_agregarBtn') : null;

  detailDiv?.classList.add('u-hidden');
  if (detailDiv) detailDiv.innerHTML = '';
  if (idInput)   idInput.value = '';
  if (submitBtn) submitBtn.disabled = true;
  if (addBtn)    addBtn.disabled    = true;

  if (!query || query.length < 2) return;

  try {
    const res = await Api.searchProducto(query);
    if (res.status === 'success' && res.data?.length) {
      const p = res.data[0];
      State.productCache[p.id] = p;
      UI.fillProductDetail(p, `${prefix}_product_details`, prefix);
      if (idInput)   idInput.value    = p.id;
      if (submitBtn) submitBtn.disabled = false;
      if (addBtn)    addBtn.disabled    = false;
    } else if (detailDiv) {
      detailDiv.classList.remove('u-hidden');
      detailDiv.innerHTML = `<p class="u-danger"><i class="fas fa-exclamation-triangle"></i> ${res.message || 'Sin resultados.'}</p>`;
    }
  } catch (err) {
    if (detailDiv) { detailDiv.classList.remove('u-hidden'); detailDiv.innerHTML = `<p class="u-danger">Error: ${err.message}</p>`; }
  }
}

// ----------------------------------------------------------------
// TRANSACCIONES
// ----------------------------------------------------------------
async function handleTransaccion(e, type) {
  e.preventDefault();
  const prefix   = type === 'compra' ? 'co' : 'v';
  const statusId = type === 'compra' ? 'statusCompra' : 'statusVenta';
  const btn      = document.getElementById(`${prefix}_submit_btn`);
  btn.disabled   = true;
  Utils.showAlert(statusId, 'info', `Registrando ${type}...`);

  const productoId = document.getElementById(`${prefix}_producto_id`).value;
  if (!productoId) { Utils.showAlert(statusId, 'error', 'No hay producto seleccionado.'); btn.disabled = false; return; }

  const extraVal = document.getElementById(type === 'compra' ? 'co_proveedor' : 'v_cliente').value.trim();
  if (!extraVal) { Utils.showAlert(statusId, 'error', `"${type === 'compra' ? 'Proveedor' : 'Cliente'}" es obligatorio.`); btn.disabled = false; return; }

  const cantidad = document.getElementById(`${prefix}_cantidad`).value;
  const precio   = document.getElementById(`${prefix}_precio_${type === 'compra' ? 'compra' : 'venta'}`).value;
  const producto = State.productCache[productoId];

  try {
    const res = await Api.registrarTransaccion({ type, producto_id: productoId, cantidad, precio, extra_data: extraVal });
    if (res.status === 'success') {
      Utils.showAlert(statusId, 'success', res.message);
      if (type === 'venta' && producto) {
        UI.showVentaInvoice({
          id: res.id || `V-${Date.now()}`,
          cliente: extraVal, fecha: Utils.today(), hora: Utils.nowTime(),
          producto: producto.nombre, codigo: producto['código'],
          categoria: producto['categoría'],
          cantidad: parseInt(cantidad), precio: parseFloat(precio),
          total: parseInt(cantidad) * parseFloat(precio),
        });
      }
      e.target.reset();
      delete State.productCache[productoId];
      document.getElementById(`${prefix}_product_details`)?.classList.add('u-hidden');
    } else Utils.showAlert(statusId, 'error', res.message);
  } catch (err) { Utils.showAlert(statusId, 'error', err.message); }
  finally { btn.disabled = false; }
}

// ----------------------------------------------------------------
// COTIZACIONES
// ----------------------------------------------------------------
function renderCotList() {
  const container = document.getElementById('cotListContainer');
  const list = Store.getAll();
  if (!list.length) {
    container.innerHTML = '<p style="color:var(--gray-500);font-size:0.875rem;">No hay cotizaciones guardadas.</p>';
    return;
  }
  container.innerHTML = `
    <div class="table-wrapper">
      <table class="data-table">
        <thead><tr><th>N°</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Acciones</th></tr></thead>
        <tbody>${list.map(c => `
          <tr>
            <td><strong>${c.header.numero}</strong></td>
            <td>${c.header.cliente}</td>
            <td>${c.header.fecha}</td>
            <td style="color:var(--color-primary);font-weight:700;">$${c.header.total.toFixed(2)}</td>
            <td>
              <div class="btn-group" style="margin:0;gap:6px;">
                <button onclick="cotFacturar('${c.header.numero}')" class="btn btn--secondary btn--sm"><i class="fas fa-file-invoice"></i> Facturar</button>
                <button onclick="abrirFormCotizacion('${c.header.numero}')" class="btn btn--primary btn--sm"><i class="fas fa-edit"></i> Editar</button>
                <button onclick="cotEliminarGuardada('${c.header.numero}')" class="btn-icon btn-icon--danger"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function abrirFormCotizacion(numero) {
  State.editingCotNumero = numero;
  State.cotItems = [];
  State.cotCounter = 0;
  ['cot_cliente','cot_email','cot_telefono','cot_notas'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const validezEl = document.getElementById('cot_validez');
  if (validezEl) validezEl.value = '15';

  if (numero) {
    const saved = Store.find(numero);
    if (saved) {
      const el = (id) => document.getElementById(id);
      if (el('cot_cliente'))  el('cot_cliente').value  = saved.header.cliente  || '';
      if (el('cot_email'))    el('cot_email').value    = saved.header.email    || '';
      if (el('cot_telefono')) el('cot_telefono').value = saved.header.telefono || '';
      if (el('cot_validez'))  el('cot_validez').value  = saved.header.validez  || '15';
      if (el('cot_notas'))    el('cot_notas').value    = saved.header.notas    || '';
      State.cotItems = saved.items.map(it => ({ ...it, id: ++State.cotCounter }));
    }
  }
  renderCotTable();
  document.getElementById('cotFormWrapper')?.classList.remove('u-hidden');
  document.getElementById('cotFormWrapper')?.scrollIntoView({ behavior: 'smooth' });
}

function cotCancelar() {
  document.getElementById('cotFormWrapper')?.classList.add('u-hidden');
  State.editingCotNumero = null;
  State.cotItems = [];
  State.cotCounter = 0;
}

function cotAgregar() {
  const pid   = document.getElementById('cot_producto_id').value;
  const cant  = parseInt(document.getElementById('cot_cantidad').value) || 1;
  const precio= parseFloat(document.getElementById('cot_precio').value) || 0;
  if (!pid || cant < 1 || precio <= 0) { Utils.showAlert('statusCotizacion', 'warning', 'Seleccione producto, cantidad y precio.'); return; }
  const p = State.productCache[pid];
  if (!p) return;
  State.cotItems.push({ id: ++State.cotCounter, pid, nombre: p.nombre, codigo: p['código'], cant, precio, subtotal: cant * precio });
  renderCotTable();
  document.getElementById('cot_query').value = '';
  document.getElementById('cot_cantidad').value = '1';
  document.getElementById('cot_precio').value = '';
  document.getElementById('cot_producto_id').value = '';
  document.getElementById('cot_product_details')?.classList.add('u-hidden');
  document.getElementById('cot_agregarBtn').disabled = true;
  Utils.showAlert('statusCotizacion', 'success', `"${p.nombre}" agregado.`);
}

function cotQuitarItem(id) { State.cotItems = State.cotItems.filter(i => i.id !== id); renderCotTable(); }

function renderCotTable() {
  const tb      = document.getElementById('cotTableBody');
  const tf      = document.getElementById('cotTableFoot');
  const excelBtn= document.getElementById('cot_generarExcelBtn');
  const pdfBtn  = document.getElementById('cot_generarPDFBtn');
  if (!State.cotItems.length) {
    tb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--gray-500);">Agregue productos.</td></tr>';
    tf.innerHTML = '';
    if (excelBtn) excelBtn.disabled = true;
    if (pdfBtn)   pdfBtn.disabled   = true;
    return;
  }
  if (excelBtn) excelBtn.disabled = false;
  if (pdfBtn)   pdfBtn.disabled   = false;
  tb.innerHTML = State.cotItems.map((it, i) => `
    <tr>
      <td>${i+1}</td><td>${it.nombre}</td><td>${it.codigo}</td>
      <td>${it.cant}</td><td>$${it.precio.toFixed(2)}</td>
      <td><strong>$${it.subtotal.toFixed(2)}</strong></td>
      <td><button class="btn-icon btn-icon--danger" onclick="cotQuitarItem(${it.id})"><i class="fas fa-times"></i></button></td>
    </tr>`).join('');
  const total = State.cotItems.reduce((s, i) => s + i.subtotal, 0);
  tf.innerHTML = `<tr class="tfoot-total"><td colspan="5" style="text-align:right;">TOTAL:</td><td style="color:var(--color-primary);font-size:1rem;">$${total.toFixed(2)}</td><td></td></tr>`;
}

function buildCotHeader(numero) {
  const total = State.cotItems.reduce((s, i) => s + i.subtotal, 0);
  return {
    cliente:  document.getElementById('cot_cliente')?.value.trim() || 'Sin nombre',
    email:    document.getElementById('cot_email')?.value.trim()   || '',
    telefono: document.getElementById('cot_telefono')?.value.trim()|| '',
    validez:  document.getElementById('cot_validez')?.value        || '15',
    notas:    document.getElementById('cot_notas')?.value.trim()   || '',
    fecha:    Utils.today(),
    numero:   numero || State.editingCotNumero || `COT-${Date.now().toString().slice(-6)}`,
    total,
  };
}

function cotGuardar() {
  if (!document.getElementById('cot_cliente')?.value.trim()) { Utils.showAlert('statusCotizacion', 'warning', 'El nombre del cliente es obligatorio.'); return; }
  if (!State.cotItems.length) { Utils.showAlert('statusCotizacion', 'warning', 'Agregue al menos un producto.'); return; }
  const header = buildCotHeader();
  Store.upsert({ header, items: State.cotItems.map(it => ({ ...it })) });
  Utils.showAlert('statusCotizacion', 'success', `Cotización ${header.numero} guardada.`);
  cotCancelar();
  renderCotList();
}

function cotDescargar(format) {
  const header = buildCotHeader();
  if (format === 'pdf')   Utils.generateCotizacionPDF(header, State.cotItems);
  else                    Utils.generateCotizacionExcel(header, State.cotItems);
}

function cotFacturar(numero) {
  const saved = Store.find(numero);
  if (!saved) return;
  UI.showCotizacionInvoice(saved.header, saved.items);
}

function cotEliminarGuardada(numero) {
  UI.showDeleteConfirm(`¿Eliminar la cotización ${numero}?`, () => {
    Store.remove(numero);
    renderCotList();
    Utils.showAlert('statusCotizacion', 'info', `Cotización ${numero} eliminada.`);
  });
}

// ----------------------------------------------------------------
// RESÚMENES
// ----------------------------------------------------------------
async function loadResumen(type) {
  const sheet = type === 'Ventas' ? 'VENTAS' : 'COMPRAS';
  State.resumenType = type;
  State.resumenData = [];
  const table  = document.getElementById('resumenTable');
  const dlBtn  = document.getElementById('descargarResumenBtn');
  if (table) { table.classList.add('u-hidden'); table.querySelector('thead').innerHTML = ''; document.getElementById('resumenTableBody').innerHTML = ''; }
  if (dlBtn)  dlBtn.classList.add('u-hidden');
  Utils.showAlert('statusResumen', 'info', `Cargando ${sheet}...`);
  try {
    const res = await Api.getData(sheet);
    if (res.status === 'success' && res.data.length) {
      State.resumenData = res.data;
      Utils.showAlert('statusResumen', 'success', `${res.data.length} registros.`);
      table.classList.remove('u-hidden');
      dlBtn.classList.remove('u-hidden');
      table.querySelector('thead').innerHTML = `<tr>${Object.keys(res.data[0]).map(h => `<th>${h.toUpperCase().replace('_',' ')}</th>`).join('')}</tr>`;
      document.getElementById('resumenTableBody').innerHTML = res.data.map(row =>
        `<tr>${Object.values(row).map(v => { if (v instanceof Date) v = v.toLocaleDateString(); else if (typeof v === 'number') v = v.toFixed(2); return `<td>${v}</td>`; }).join('')}</tr>`
      ).join('');
    } else Utils.showAlert('statusResumen', 'warning', `Sin datos en ${sheet}.`);
  } catch (err) { Utils.showAlert('statusResumen', 'error', err.message); }
}

function downloadResumen() {
  if (!State.resumenData.length) return;
  Utils.generateResumenExcel(State.resumenType, State.resumenData);
}

// ----------------------------------------------------------------
// CONFIGURACIÓN
// ----------------------------------------------------------------
async function handleDB(action) {
  document.getElementById('iniciarDBBtn').disabled = true;
  document.getElementById('resetDBBtn').disabled   = true;
  Utils.showAlert('statusConfig', 'info', `Procesando ${action}...`);
  try {
    const res = action === 'iniciar' ? await Api.iniciarDB() : await Api.resetearDB();
    if (res.status === 'success') { Utils.showAlert('statusConfig', 'success', res.message); loadInitialData(); }
    else Utils.showAlert('statusConfig', 'error', res.message);
  } catch (err) { Utils.showAlert('statusConfig', 'error', err.message); }
  finally {
    document.getElementById('iniciarDBBtn').disabled = false;
    document.getElementById('resetDBBtn').disabled   = false;
  }
}

function handleChangeAdminKey() {
  const actual = document.getElementById('cfg_admin_actual').value.trim();
  const nueva  = document.getElementById('cfg_admin_nueva').value.trim();
  const conf   = document.getElementById('cfg_admin_confirm').value.trim();
  if (actual !== Auth.getPassword('admin')) return Utils.showAlert('statusClaveAdmin', 'error', 'La clave actual es incorrecta.');
  if (!nueva || nueva.length < 4)           return Utils.showAlert('statusClaveAdmin', 'error', 'Mínimo 4 caracteres.');
  if (nueva !== conf)                        return Utils.showAlert('statusClaveAdmin', 'error', 'Las claves no coinciden.');
  Auth.setPassword('admin', nueva);
  ['cfg_admin_actual','cfg_admin_nueva','cfg_admin_confirm'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  Utils.showAlert('statusClaveAdmin', 'success', 'Clave de administrador actualizada.');
}

function handleChangeUserKey() {
  const adminV = document.getElementById('cfg_user_admin_verify').value.trim();
  const nueva  = document.getElementById('cfg_user_nueva').value.trim();
  const conf   = document.getElementById('cfg_user_confirm').value.trim();
  if (adminV !== Auth.getPassword('admin')) return Utils.showAlert('statusClaveUser', 'error', 'Clave de administrador incorrecta.');
  if (!nueva || nueva.length < 4)           return Utils.showAlert('statusClaveUser', 'error', 'Mínimo 4 caracteres.');
  if (nueva !== conf)                        return Utils.showAlert('statusClaveUser', 'error', 'Las claves no coinciden.');
  Auth.setPassword('usuario', nueva);
  ['cfg_user_admin_verify','cfg_user_nueva','cfg_user_confirm'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  Utils.showAlert('statusClaveUser', 'success', 'Clave de usuario actualizada.');
}
