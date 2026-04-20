/* ============================================================
   ui.js  —  Componentes de UI reutilizables
   ============================================================ */

const UI = (() => {

  // ----------------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------------
  function initNavigation() {
    const links    = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.dataset.section;
        links.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
        sections.forEach(s => {
          if (s.id === target) {
            s.classList.add('is-active');
            s.dispatchEvent(new CustomEvent('section:enter'));
          } else {
            s.classList.remove('is-active');
          }
        });
      });
    });
  }

  // ----------------------------------------------------------------
  // MOBILE SIDEBAR
  // ----------------------------------------------------------------
  function initMobileSidebar() {
    const toggleBtn = document.getElementById('mobileToggle');
    const sidebar   = document.querySelector('.sidebar');
    if (!toggleBtn || !sidebar) return;

    function check() {
      if (window.innerWidth <= 992) toggleBtn.style.display = 'flex';
      else { toggleBtn.style.display = 'none'; sidebar.classList.remove('is-open'); }
    }
    check();
    window.addEventListener('resize', check);
    toggleBtn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.toggle('is-open'); });
    document.addEventListener('click', e => {
      if (window.innerWidth <= 992 && sidebar.classList.contains('is-open') &&
          !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('is-open');
      }
    });
    document.querySelectorAll('.nav-link').forEach(l =>
      l.addEventListener('click', () => { if (window.innerWidth <= 992) sidebar.classList.remove('is-open'); })
    );
  }

  // ----------------------------------------------------------------
  // TABLE SCROLL HINTS
  // ----------------------------------------------------------------
  function optimizeTables() {
    document.querySelectorAll('.table-wrapper').forEach(wrap => {
      const table = wrap.querySelector('.data-table');
      const hint  = wrap.querySelector('.table-hint');
      if (table && hint)
        hint.classList.toggle('u-hidden', !(window.innerWidth <= 768 && table.scrollWidth > wrap.clientWidth));
    });
  }

  // ----------------------------------------------------------------
  // MODALS
  // ----------------------------------------------------------------
  let _adminCb  = null;
  let _deleteCb = null;

  function showAdminConfirm(message, callback) {
    _adminCb = callback;
    document.getElementById('adminConfirmMsg').textContent = message;
    document.getElementById('adminConfirmKey').value = '';
    document.getElementById('adminConfirmError').classList.remove('is-visible');
    Utils.showModal('adminConfirmModal');
    setTimeout(() => document.getElementById('adminConfirmKey').focus(), 80);
  }

  function showDeleteConfirm(message, callback) {
    _deleteCb = callback;
    document.getElementById('deleteConfirmMsg').textContent = message;
    Utils.showModal('deleteConfirmModal');
  }

  function initModals() {
    // Admin confirm
    document.getElementById('closeAdminModal')?.addEventListener('click',        () => Utils.hideModal('adminConfirmModal'));
    document.getElementById('adminConfirmCancelBtn')?.addEventListener('click',  () => Utils.hideModal('adminConfirmModal'));
    document.getElementById('adminConfirmOkBtn')?.addEventListener('click', () => {
      const val = document.getElementById('adminConfirmKey').value.trim();
      if (val !== Auth.getPassword('admin')) {
        document.getElementById('adminConfirmError').classList.add('is-visible');
        document.getElementById('adminConfirmKey').value = '';
        return;
      }
      Utils.hideModal('adminConfirmModal');
      if (_adminCb) _adminCb();
    });
    document.getElementById('adminConfirmKey')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('adminConfirmOkBtn').click();
    });

    // Delete confirm
    document.getElementById('closeDeleteModal')?.addEventListener('click',       () => Utils.hideModal('deleteConfirmModal'));
    document.getElementById('deleteConfirmCancelBtn')?.addEventListener('click', () => Utils.hideModal('deleteConfirmModal'));
    document.getElementById('deleteConfirmOkBtn')?.addEventListener('click', () => {
      Utils.hideModal('deleteConfirmModal');
      if (_deleteCb) _deleteCb();
    });

    // Invoice modal
    document.getElementById('closeInvoiceModal')?.addEventListener('click', () => Utils.hideModal('invoiceModal'));
    document.getElementById('closeInvoiceBtn')?.addEventListener('click',   () => Utils.hideModal('invoiceModal'));

    // Invoice actions
    document.getElementById('downloadInvoiceExcelBtn')?.addEventListener('click', downloadCurrentInvoiceExcel);
    document.getElementById('downloadInvoicePDFBtn')?.addEventListener('click',   downloadCurrentInvoicePDF);
    document.getElementById('printInvoiceBtn')?.addEventListener('click',         printCurrentInvoice);
  }

  // ----------------------------------------------------------------
  // INVOICE MODAL  —  Preview con apariencia de la plantilla
  // ----------------------------------------------------------------
  let _lastVentaInv = null;
  let _lastCotInv   = null;

  function showVentaInvoice(inv) {
    _lastVentaInv = inv;
    _lastCotInv   = null;
    document.getElementById('invoiceModalTitle').textContent = 'Factura de Venta';
    document.getElementById('invoicePreview').innerHTML = buildVentaHTML(inv);
    Utils.showModal('invoiceModal');
  }

  function showCotizacionInvoice(header, items) {
    _lastCotInv   = { header, items };
    _lastVentaInv = null;
    document.getElementById('invoiceModalTitle').textContent = `Cotización — ${header.numero}`;
    document.getElementById('invoicePreview').innerHTML = buildCotHTML(header, items);
    Utils.showModal('invoiceModal');
  }

  // ---- Shared logo block HTML ----
  function logoBlock() {
    const E = Utils.EMPRESA;
    return `
      <div class="inv-logo">
        <div class="inv-logo__title">${E.nombre}</div>
        <div class="inv-logo__house">🏠</div>
        <div class="inv-logo__sep"></div>
        <div class="inv-logo__info">
          correo: ${E.correo}<br>
          ${E.direccion}<br>
          telefono: ${E.telefono}<br>
          RNC: ${E.rnc}
        </div>
        <div class="inv-logo__contact">contacto: ${E.contacto}</div>
      </div>`;
  }

  // ---- Venta preview ----
  function buildVentaHTML(inv) {
    const itebis = inv.total * Utils.EMPRESA.itebis;
    const total  = inv.total + itebis;
    return `
      <div class="inv-doc">
        <div class="inv-header">
          ${logoBlock()}
          <div class="inv-meta">
            <div class="inv-meta__title">Factura</div>
            <div class="inv-meta__rows">
              <div>No. ${inv.id}</div>
              <div>Fecha: ${inv.fecha}</div>
              <div>Hora: ${inv.hora}</div>
              <br>
              <div>RNC.</div>
              <div>Cliente: <strong>${inv.cliente}</strong></div>
              <div>Telefono:</div>
              <div>Contacto:</div>
              <div>Direccion:</div>
            </div>
          </div>
        </div>

        <table class="inv-table">
          <thead>
            <tr><th>NO.</th><th>DESCRIPCION</th><th>CANT.</th><th>P. UNITARIO</th><th>SUB-TOTAL</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="tc">A</td>
              <td>${inv.producto} (${inv.codigo})</td>
              <td class="tc">${inv.cantidad}</td>
              <td class="tr">${Utils.fmt(inv.precio)}</td>
              <td class="tr">${Utils.fmt(inv.total)}</td>
            </tr>
            <tr><td colspan="3"></td>
              <td class="tfoot-lbl">SUB-TOTAL</td>
              <td class="tfoot-val">${Utils.fmt(inv.total)}</td>
            </tr>
            <tr><td colspan="3"></td>
              <td class="tfoot-lbl">ITEBIS ${Math.round(Utils.EMPRESA.itebis*100)}%</td>
              <td class="tfoot-val">${Utils.fmt(itebis)}</td>
            </tr>
            <tr><td colspan="3"></td>
              <td class="tfoot-lbl tfoot-hi">TOTAL RDS</td>
              <td class="tfoot-val tfoot-hi">${Utils.fmt(total)}</td>
            </tr>
          </tbody>
        </table>

        <div class="inv-footer">Gracias por su compra.</div>
      </div>`;
  }

  // ---- Cotización preview ----
  function buildCotHTML(h, items) {
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const itebis   = subtotal * Utils.EMPRESA.itebis;
    const total    = subtotal + itebis;

    const itemRows = items.map((it, i) => `
      <tr>
        <td class="tc">${String.fromCharCode(65 + i)}</td>
        <td>${it.nombre}</td>
        <td class="tc">${it.cant}</td>
        <td class="tc">${it.unidad || 'M2'}</td>
        <td class="tr">${Utils.fmt(it.precio)}</td>
        <td class="tr">${Utils.fmt(it.subtotal)}</td>
      </tr>`).join('');

    const emptyRows = Array(Math.max(0, 3 - items.length))
      .fill('<tr><td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>').join('');

    return `
      <div class="inv-doc">
        <div class="inv-header">
          ${logoBlock()}
          <div class="inv-meta">
            <div class="inv-meta__title">Cotizacion</div>
            <div class="inv-meta__rows">
              <div>No. ${h.numero}</div>
              <div>Fecha: ${h.fecha}</div>
              <div>Cotizacion valida por ${h.validez || 15} dias.</div>
              <br>
              <div>RNC.</div>
              <div>Cotizado a: <strong>${h.cliente}</strong></div>
              <div>Telefono: ${h.telefono || ''}</div>
              <div>Contacto:</div>
              <div>Direccion: ${h.direccion || 'Santo Domingo D.N.'}</div>
            </div>
          </div>
        </div>

        <table class="inv-table">
          <thead>
            <tr><th>NO.</th><th>DESCRIPCION</th><th>AREA</th><th>UN</th><th>VALOR</th><th>SUB-TOTAL</th></tr>
          </thead>
          <tbody>
            ${itemRows}
            ${emptyRows}
            <tr>
              <td colspan="4" class="inv-cond">${h.notas ? `condiciones de pago: ${h.notas}` : ''}</td>
              <td class="tfoot-lbl">SUB-TOTAL</td>
              <td class="tfoot-val">${Utils.fmt(subtotal)}</td>
            </tr>
            <tr><td colspan="4"></td>
              <td class="tfoot-lbl">ITEBIS ${Math.round(Utils.EMPRESA.itebis*100)}%</td>
              <td class="tfoot-val">${Utils.fmt(itebis)}</td>
            </tr>
            <tr><td colspan="4"></td>
              <td class="tfoot-lbl tfoot-hi">TOTAL RDS</td>
              <td class="tfoot-val tfoot-hi">${Utils.fmt(total)}</td>
            </tr>
          </tbody>
        </table>

        <div class="inv-footer">Esta cotización es válida por el período indicado.</div>
      </div>`;
  }

  // ---- Download / Print dispatchers ----
  function downloadCurrentInvoiceExcel() {
    if (_lastCotInv)   { Utils.generateCotizacionExcel(_lastCotInv.header, _lastCotInv.items); return; }
    if (_lastVentaInv) { Utils.generateVentaExcel(_lastVentaInv); }
  }

  function downloadCurrentInvoicePDF() {
    if (_lastCotInv)   { Utils.generateCotizacionPDF(_lastCotInv.header, _lastCotInv.items); return; }
    if (_lastVentaInv) { Utils.generateVentaPDF(_lastVentaInv); }
  }

  function printCurrentInvoice() {
    if (_lastCotInv)   { Utils.printCotizacion(_lastCotInv.header, _lastCotInv.items); return; }
    if (_lastVentaInv) { Utils.printVenta(_lastVentaInv); }
  }

  // ----------------------------------------------------------------
  // POPULATE SELECTS
  // ----------------------------------------------------------------
  function populateCategorySelects(cats) {
    ['p_categoria', 'ep_categoria'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = cats.length === 0
        ? '<option value="" disabled selected>Sin categorías</option>'
        : '<option value="" disabled selected>Seleccione...</option>' +
          cats.map(c => `<option value="${c.nombre || c.id}">${c.nombre || c.id}</option>`).join('');
    });
  }

  function buildCategoryList(cats) {
    const ul = document.getElementById('listaCategorias');
    if (!ul) return;
    ul.innerHTML = cats.length === 0
      ? '<li>No hay categorías.</li>'
      : cats.map(c => `<li>ID: ${c.id} &nbsp;|&nbsp; ${c.nombre}</li>`).join('');
  }

  // ----------------------------------------------------------------
  // PRODUCT DETAIL BOX
  // ----------------------------------------------------------------
  function fillProductDetail(product, divId, prefix) {
    const div = document.getElementById(divId);
    if (!div) return;
    const isCompra   = prefix === 'co';
    const price      = isCompra ? product.precio_compra : product.precio_venta;
    const priceLabel = isCompra ? 'Precio Compra' : 'Precio Venta';
    const stockCls   = product.stock < 5 ? 'u-danger' : 'u-success';

    div.classList.remove('u-hidden');
    div.innerHTML = `
      <p><b>ID:</b> ${product.id} &nbsp;|&nbsp; <b>Producto:</b> ${product.nombre} (${product['código']})</p>
      <p><b>Categoría:</b> ${product['categoría']} &nbsp;|&nbsp;
         <b>Stock:</b> <span class="${stockCls}">${product.stock}</span></p>
      <p><b>${priceLabel}:</b> $${parseFloat(price).toFixed(2)}</p>
      ${!isCompra && product.stock < 5
        ? `<p class="alert alert--warning is-visible" style="margin-top:8px;"><i class="fas fa-exclamation-triangle"></i> Stock bajo: solo ${product.stock} unidades.</p>`
        : ''}`;

    const inp = prefix === 'co'  ? document.getElementById('co_precio_compra')
              : prefix === 'v'   ? document.getElementById('v_precio_venta')
              : prefix === 'cot' ? document.getElementById('cot_precio')
              : null;
    if (inp) inp.value = parseFloat(price).toFixed(2);
  }

  // ----------------------------------------------------------------
  // APPLY ROLE UI
  // ----------------------------------------------------------------
  function applyRole() {
    const isAdmin = Auth.isAdmin();
    const badge   = document.getElementById('roleBadgeSidebar');
    if (badge) {
      badge.innerHTML = isAdmin
        ? '<span class="role-pill role-pill--admin"><i class="fas fa-user-shield"></i> Administrador</span>'
        : '<span class="role-pill role-pill--user"><i class="fas fa-user"></i> Usuario</span>';
    }
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin ? (el.tagName === 'A' ? 'flex' : 'block') : 'none';
    });
  }

  return {
    initNavigation, initMobileSidebar, optimizeTables,
    showAdminConfirm, showDeleteConfirm, initModals,
    showVentaInvoice, showCotizacionInvoice,
    downloadCurrentInvoiceExcel, downloadCurrentInvoicePDF, printCurrentInvoice,
    populateCategorySelects, buildCategoryList,
    fillProductDetail, applyRole,
  };
})();


// Función para mostrar las ventas en la tabla
UI.renderHistorialVentas = function(ventas) {
    const contenedor = document.getElementById('listaHistorialVentas');
    if (!contenedor) return;

    // Invertimos el array para ver las más recientes primero
    contenedor.innerHTML = ventas.reverse().map(v => {
        const total = parseFloat(v.precio_venta) * parseInt(v.cantidad);
        return `
        <tr>
            <td>${v.id}</td>
            <td>${new Date(v.fecha).toLocaleDateString()}</td>
            <td>${v.cliente || 'Consumidor Final'}</td>
            <td><b>${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</b></td>
            <td>
                <button class="btn btn--sm btn--secondary" onclick="UI.prepararReimpresion('${v.id}')">
                    <i class="fas fa-print"></i> Reimprimir
                </button>
            </td>
        </tr>`;
    }).join('');
};

// Lógica para recuperar los datos de la venta y generar el PDF
UI.prepararReimpresion = function(id) {
    // Buscamos la venta en los datos globales (asumiendo que están en App.data.ventas)
    const venta = App.data.ventas.find(v => String(v.id) === String(id));
    const producto = App.data.productos.find(p => String(p.id) === String(venta.producto_id));

    if (venta && producto) {
        const header = {
            numero: venta.id,
            fecha: new Date(venta.fecha).toLocaleDateString(),
            cliente: venta.cliente || 'Consumidor Final',
            total: parseFloat(venta.precio_venta) * parseInt(venta.cantidad)
        };

        const item = [{
            nombre: producto.nombre,
            cant: venta.cantidad,
            precio: parseFloat(venta.precio_venta),
            subtotal: parseFloat(venta.precio_venta) * parseInt(venta.cantidad)
        }];

        // Reutiliza la función de PDF existente en utils.js
        Utils.generateCotizacionPDF(header, item, false);
    } else {
        alert("No se encontraron los datos para reimprimir esta factura.");
    }
};