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
      if (table && hint) {
        hint.classList.toggle('u-hidden', !(window.innerWidth <= 768 && table.scrollWidth > wrap.clientWidth));
      }
    });
  }

  // ----------------------------------------------------------------
  // MODAL (generic confirm)
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
    document.getElementById('closeAdminModal')?.addEventListener('click', () => Utils.hideModal('adminConfirmModal'));
    document.getElementById('adminConfirmCancelBtn')?.addEventListener('click', () => Utils.hideModal('adminConfirmModal'));
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
    document.getElementById('closeDeleteModal')?.addEventListener('click', () => Utils.hideModal('deleteConfirmModal'));
    document.getElementById('deleteConfirmCancelBtn')?.addEventListener('click', () => Utils.hideModal('deleteConfirmModal'));
    document.getElementById('deleteConfirmOkBtn')?.addEventListener('click', () => {
      Utils.hideModal('deleteConfirmModal');
      if (_deleteCb) _deleteCb();
    });

    // Invoice modal
    document.getElementById('closeInvoiceModal')?.addEventListener('click', () => Utils.hideModal('invoiceModal'));
    document.getElementById('closeInvoiceBtn')?.addEventListener('click',   () => Utils.hideModal('invoiceModal'));
  }

  // ----------------------------------------------------------------
  // INVOICE MODAL
  // ----------------------------------------------------------------
  let _lastVentaInv = null;
  let _lastCotInv   = null;

  function showVentaInvoice(inv) {
    _lastVentaInv = inv;
    _lastCotInv   = null;
    document.getElementById('invoiceModalTitle').textContent = 'Venta Registrada — Factura';
    document.getElementById('invoicePreview').innerHTML = buildInvoiceHTML(inv, false);
    Utils.showModal('invoiceModal');
  }

  function showCotizacionInvoice(header, items) {
    _lastCotInv   = { header, items };
    _lastVentaInv = null;
    document.getElementById('invoiceModalTitle').textContent = `Factura — ${header.numero}`;
    document.getElementById('invoicePreview').innerHTML = buildCotInvoiceHTML(header, items);
    Utils.showModal('invoiceModal');
  }

  function buildInvoiceHTML(inv, isCot) {
    return `
      <div class="invoice">
        <div class="invoice__top">
          <div>
            <div class="invoice__company"><i class="fas fa-warehouse"></i> Sistema de Inventario</div>
            <div class="invoice__meta">Fecha: ${inv.fecha} &nbsp;|&nbsp; Hora: ${inv.hora || ''}</div>
            <div class="invoice__meta">N°: <strong>${inv.id}</strong></div>
          </div>
          <div class="invoice__badge">${isCot ? 'COTIZACIÓN' : 'FACTURA'}</div>
        </div>
        <div class="invoice__divider"></div>
        <div class="invoice__client"><strong>Cliente:</strong> ${inv.cliente}</div>
        <table class="invoice__table">
          <thead><tr><th>Producto</th><th>Código</th><th>Cant.</th><th>P. Unitario</th><th>Total</th></tr></thead>
          <tbody><tr>
            <td>${inv.producto}</td><td>${inv.codigo}</td>
            <td>${inv.cantidad}</td><td>$${inv.precio.toFixed(2)}</td>
            <td><strong>$${inv.total.toFixed(2)}</strong></td>
          </tr></tbody>
        </table>
        <div class="invoice__total"><span>TOTAL A PAGAR:</span><span class="invoice__total-amount">$${inv.total.toFixed(2)}</span></div>
        <div class="invoice__footer">Gracias por su preferencia.</div>
      </div>`;
  }

  function buildCotInvoiceHTML(h, items) {
    const rows = items.map(it =>
      `<tr><td>${it.nombre}</td><td>${it.codigo}</td><td>${it.cant}</td><td>$${it.precio.toFixed(2)}</td><td><strong>$${it.subtotal.toFixed(2)}</strong></td></tr>`
    ).join('');
    return `
      <div class="invoice">
        <div class="invoice__top">
          <div>
            <div class="invoice__company"><i class="fas fa-warehouse"></i> Sistema de Inventario</div>
            <div class="invoice__meta">N°: <strong>${h.numero}</strong> &nbsp;|&nbsp; Fecha: ${h.fecha}</div>
            ${h.validez ? `<div class="invoice__meta">Válida por: ${h.validez} días</div>` : ''}
          </div>
          <div class="invoice__badge">COTIZACIÓN</div>
        </div>
        <div class="invoice__divider"></div>
        <div class="invoice__client"><strong>Cliente:</strong> ${h.cliente}${h.email ? ` &nbsp;|&nbsp; ${h.email}` : ''}</div>
        <table class="invoice__table">
          <thead><tr><th>Producto</th><th>Código</th><th>Cant.</th><th>P. Unitario</th><th>Subtotal</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="invoice__total"><span>TOTAL:</span><span class="invoice__total-amount">$${h.total.toFixed(2)}</span></div>
        ${h.notas ? `<div style="font-size:0.8rem;color:var(--gray-600);margin-top:8px;"><b>Notas:</b> ${h.notas}</div>` : ''}
        <div class="invoice__footer">Gracias por su preferencia.</div>
      </div>`;
  }

  function downloadCurrentInvoiceExcel() {
    if (_lastCotInv)   { Utils.generateCotizacionExcel(_lastCotInv.header, _lastCotInv.items); return; }
    if (_lastVentaInv) { Utils.generateVentaExcel(_lastVentaInv); }
  }

  function downloadCurrentInvoicePDF() {
    if (_lastCotInv)   { Utils.generateCotizacionPDF(_lastCotInv.header, _lastCotInv.items); return; }
    if (_lastVentaInv) { Utils.generateVentaPDF(_lastVentaInv); }
  }

  // ----------------------------------------------------------------
  // POPULATE SELECT helpers
  // ----------------------------------------------------------------
  function populateCategorySelects(cats) {
    const ids = ['p_categoria', 'ep_categoria'];
    ids.forEach(id => {
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
    const isCompra    = prefix === 'co';
    const price       = isCompra ? product.precio_compra : product.precio_venta;
    const priceLabel  = isCompra ? 'Precio Compra' : 'Precio Venta';
    const stockColor  = product.stock < 5 ? 'u-danger' : 'u-success';

    div.classList.remove('u-hidden');
    div.innerHTML = `
      <p><b>ID:</b> ${product.id} &nbsp;|&nbsp; <b>Producto:</b> ${product.nombre} (${product['código']})</p>
      <p><b>Categoría:</b> ${product['categoría']} &nbsp;|&nbsp;
         <b>Stock:</b> <span class="${stockColor}">${product.stock}</span></p>
      <p><b>${priceLabel}:</b> $${parseFloat(price).toFixed(2)}</p>
      ${!isCompra && product.stock < 5
        ? `<p class="alert alert--warning is-visible" style="margin-top:8px;"><i class="fas fa-exclamation-triangle"></i> Stock bajo: solo ${product.stock} unidades.</p>`
        : ''}`;

    const priceInput = prefix === 'co'  ? document.getElementById('co_precio_compra')
                     : prefix === 'v'   ? document.getElementById('v_precio_venta')
                     : prefix === 'cot' ? document.getElementById('cot_precio')
                     : null;
    if (priceInput) priceInput.value = parseFloat(price).toFixed(2);
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
    downloadCurrentInvoiceExcel, downloadCurrentInvoicePDF,
    populateCategorySelects, buildCategoryList,
    fillProductDetail, applyRole,
  };
})();
