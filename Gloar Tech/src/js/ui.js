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
          } else s.classList.remove('is-active');
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
    const check = () => {
      if (window.innerWidth <= 992) toggleBtn.style.display = 'flex';
      else { toggleBtn.style.display = 'none'; sidebar.classList.remove('is-open'); }
    };
    check();
    window.addEventListener('resize', check);
    toggleBtn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.toggle('is-open'); });
    document.addEventListener('click', e => {
      if (window.innerWidth <= 992 && sidebar.classList.contains('is-open') &&
          !sidebar.contains(e.target) && !toggleBtn.contains(e.target))
        sidebar.classList.remove('is-open');
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

    document.getElementById('closeDeleteModal')?.addEventListener('click',       () => Utils.hideModal('deleteConfirmModal'));
    document.getElementById('deleteConfirmCancelBtn')?.addEventListener('click', () => Utils.hideModal('deleteConfirmModal'));
    document.getElementById('deleteConfirmOkBtn')?.addEventListener('click', () => {
      Utils.hideModal('deleteConfirmModal');
      if (_deleteCb) _deleteCb();
    });

    document.getElementById('closeInvoiceModal')?.addEventListener('click', () => Utils.hideModal('invoiceModal'));
    document.getElementById('closeInvoiceBtn')?.addEventListener('click',   () => Utils.hideModal('invoiceModal'));
    document.getElementById('downloadInvoiceExcelBtn')?.addEventListener('click', downloadCurrentInvoiceExcel);
    document.getElementById('downloadInvoicePDFBtn')?.addEventListener('click',   downloadCurrentInvoicePDF);
    document.getElementById('printInvoiceBtn')?.addEventListener('click',         printCurrentInvoice);
  }

  // ----------------------------------------------------------------
  // INVOICE MODAL — Elegant preview
  // ----------------------------------------------------------------
  let _lastVentaInv = null;
  let _lastCotInv   = null;

  function showVentaInvoice(inv) {
    _lastVentaInv = inv;
    _lastCotInv   = null;
    document.getElementById('invoiceModalTitle').textContent = `Factura No. ${inv.id}`;
    document.getElementById('invoicePreview').innerHTML = buildVentaHTML(inv);
    Utils.showModal('invoiceModal');
  }

  function showCotizacionInvoice(header, items) {
    _lastCotInv   = { header, items };
    _lastVentaInv = null;
    document.getElementById('invoiceModalTitle').textContent = `Cotización ${header.numero}`;
    document.getElementById('invoicePreview').innerHTML = buildCotHTML(header, items);
    Utils.showModal('invoiceModal');
  }

  // ---- Shared styles for modal preview ----
  const PREVIEW_STYLE = `
    <style>
      .inv-doc { font-family:'Segoe UI',Arial,sans-serif; font-size:10px; color:#1a1a2e; }

      /* Header */
      .inv-header { display:flex; gap:14px; align-items:stretch; margin-bottom:12px; padding-bottom:10px; border-bottom:3px solid #22783A; }

      /* Logo box */
      .inv-logo {
        background:linear-gradient(135deg,#1a5c30,#22783A 55%,#2d9e4e);
        color:#fff; border-radius:8px; padding:10px 12px;
        min-width:170px; max-width:190px; position:relative; overflow:hidden; flex-shrink:0;
      }
      .inv-logo::after { content:''; position:absolute; bottom:-16px; right:-16px; width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.07); }
      .inv-logo__title { font-size:12px; font-weight:700; line-height:1.25; padding-right:32px; margin-bottom:5px; }
      .inv-logo__icon { position:absolute; top:7px; right:7px; background:rgba(0,0,0,0.25); border-radius:5px; width:28px; height:24px; display:flex; align-items:center; justify-content:center; font-size:14px; }
      .inv-logo__sep { border-top:1px solid rgba(255,255,255,0.3); margin:5px 0; }
      .inv-logo__info { font-size:6.5px; line-height:1.75; opacity:0.9; }
      .inv-logo__contact { margin-top:4px; font-size:7px; font-weight:700; color:#b4ffb4; }

      /* Title area */
      .inv-title-area { flex:1; display:flex; flex-direction:column; justify-content:space-between; }
      .inv-title-row { display:flex; justify-content:space-between; align-items:flex-start; }
      .inv-type { font-size:22px; font-weight:800; color:#1a5c30; letter-spacing:-1px; line-height:1; }
      .inv-badge { background:#1a5c30; color:#fff; font-size:7.5px; font-weight:700; padding:3px 9px; border-radius:20px; letter-spacing:0.07em; align-self:flex-start; }
      .inv-nums { display:grid; grid-template-columns:1fr 1fr; gap:3px 12px; font-size:8px; margin-top:7px; }
      .inv-nums span { color:#666; }
      .inv-nums strong { color:#1a1a2e; }

      /* Client block */
      .inv-client {
        background:#f0faf4; border:1px solid #c8ead4; border-left:4px solid #22783A;
        border-radius:0 5px 5px 0; padding:7px 10px; margin-top:6px; font-size:8px;
      }
      .inv-client-lbl { color:#22783A; font-weight:700; font-size:6.5px; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:2px; }
      .inv-client-name { font-size:9px; font-weight:700; color:#1a1a2e; margin-bottom:3px; }
      .inv-client-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px 12px; }
      .inv-client-item { font-size:7.5px; color:#555; }

      /* Table */
      .inv-table { width:100%; border-collapse:collapse; margin-top:10px; font-size:9px; }
      .inv-table thead tr { background:#1a5c30; color:#fff; }
      .inv-table th { padding:5px 7px; font-weight:700; font-size:7.5px; text-transform:uppercase; letter-spacing:0.05em; }
      .inv-table th:not(:first-child):not(:nth-child(2)) { text-align:center; }
      .inv-table th:last-child, .inv-table th:nth-last-child(2) { text-align:right; }
      .inv-table tbody tr:nth-child(odd) { background:#f4fdf7; }
      .inv-table td { padding:5px 7px; border-bottom:1px solid #e0f0e5; color:#2a2a2a; }
      .inv-table td.tc { text-align:center; }
      .inv-table td.tr { text-align:right; }
      .inv-table td.no { color:#22783A; font-weight:700; text-align:center; }

      /* Totals section */
      .inv-bottom { display:flex; justify-content:space-between; align-items:flex-end; margin-top:12px; gap:12px; }
      .inv-notes { flex:1; font-size:7.5px; color:#666; line-height:1.6; max-width:55%; }
      .inv-notes strong { display:block; color:#1a1a2e; font-size:7px; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px; }

      /* Totals table */
      .inv-totals { min-width:190px; }
      .inv-totals table { width:100%; border-collapse:collapse; }
      .inv-totals td { padding:3px 7px; font-size:8.5px; }
      .inv-totals .tl { text-align:right; color:#666; }
      .inv-totals .tv { text-align:right; font-weight:700; color:#1a1a2e; width:85px; border-bottom:1px solid #e0f0e5; }
      .inv-totals tr.grand { background:#1a5c30; border-radius:4px; overflow:hidden; }
      .inv-totals tr.grand td { color:#fff; padding:6px 9px; font-size:10px; font-weight:800; }
      .inv-totals tr.grand .tl { color:rgba(255,255,255,0.85); }
      .inv-totals tr.grand .tv { border-bottom:none; font-size:11px; }

      /* Footer */
      .inv-footer { margin-top:14px; padding-top:8px; border-top:1px dashed #c8ead4; text-align:center; font-size:7px; color:#999; }
      .inv-footer strong { color:#22783A; }
    </style>`;

  // ---- Shared logo block ----
  function logoBlock() {
    const E = Utils.EMPRESA;
    return `
      <div class="inv-logo">
        <div class="inv-logo__title">${E.nombre}</div>
        <div class="inv-logo__icon">🏠</div>
        <div class="inv-logo__sep"></div>
        <div class="inv-logo__info">
          correo: ${E.correo}<br>
          ${E.direccion}<br>
          Tel: ${E.telefono} &nbsp;|&nbsp; RNC: ${E.rnc}
        </div>
        <div class="inv-logo__contact">Contacto: ${E.contacto}</div>
      </div>`;
  }

  // ---- Venta preview — CORREGIDO: datos del cliente + ITBIS condicional ----
  function buildVentaHTML(inv) {
    // ✅ ITBIS condicional
    const conItbis = inv.conItbis !== undefined ? inv.conItbis : true;
    const itebis   = conItbis ? inv.total * Utils.EMPRESA.itebis : 0;
    const total    = inv.total + itebis;

    return `${PREVIEW_STYLE}
      <div class="inv-doc">
        <div class="inv-header">
          ${logoBlock()}
          <div class="inv-title-area">
            <div>
              <div class="inv-title-row">
                <div class="inv-type">Factura</div>
                <div class="inv-badge">ORIGINAL</div>
              </div>
              <div class="inv-nums">
                <div><span>No.</span> <strong>${inv.id}</strong></div>
                <div><span>Fecha:</span> <strong>${inv.fecha}</strong></div>
                <div><span>Hora:</span> <strong>${inv.hora || '—'}</strong></div>
                <div><span>RNC:</span> <strong>—</strong></div>
              </div>
            </div>
            <!-- ✅ Bloque cliente visible y completo -->
            <div class="inv-client">
              <div class="inv-client-lbl">Datos del Cliente</div>
              <div class="inv-client-name">${inv.cliente || '—'}</div>
              <div class="inv-client-grid">
                ${inv.telefono  ? `<div class="inv-client-item"><b>Tel:</b> ${inv.telefono}</div>` : ''}
                ${inv.contacto  ? `<div class="inv-client-item"><b>Contacto:</b> ${inv.contacto}</div>` : ''}
                ${inv.direccion ? `<div class="inv-client-item"><b>Dirección:</b> ${inv.direccion}</div>` : ''}
              </div>
            </div>
          </div>
        </div>

        <table class="inv-table">
          <thead>
            <tr><th style="width:30px">No.</th><th>Descripción</th><th style="width:45px">Cant.</th><th style="width:85px">P. Unitario</th><th style="width:85px">Subtotal</th></tr>
          </thead>
          <tbody>
            <tr>
              <td class="no">A</td>
              <td>${inv.producto}${inv.codigo ? ` <span style="color:#888;font-size:8px;">(${inv.codigo})</span>` : ''}</td>
              <td class="tc">${inv.cantidad}</td>
              <td class="tr">${Utils.fmt(inv.precio)}</td>
              <td class="tr">${Utils.fmt(inv.total)}</td>
            </tr>
            <tr><td colspan="5" style="height:16px;border-bottom:1px solid #e0f0e5;"></td></tr>
            <tr><td colspan="5" style="height:16px;border-bottom:1px solid #e0f0e5;"></td></tr>
          </tbody>
        </table>

        <div class="inv-bottom">
          <div class="inv-notes">
            ${inv.notas ? `<strong>Condiciones</strong>${inv.notas}` : '<strong>Gracias por su preferencia</strong>'}
          </div>
          <div class="inv-totals">
            <table>
              <tr>
                <td class="tl">Subtotal</td>
                <td class="tv">${Utils.fmt(inv.total)}</td>
              </tr>
              ${conItbis ? `<tr>
                <td class="tl">ITBIS ${Math.round(Utils.EMPRESA.itebis * 100)}%</td>
                <td class="tv">${Utils.fmt(itebis)}</td>
              </tr>` : `<tr>
                <td class="tl" style="font-size:7px;color:#bbb;">Sin ITBIS</td>
                <td class="tv" style="color:#bbb;">—</td>
              </tr>`}
              <tr class="grand">
                <td class="tl">Total RDS</td>
                <td class="tv">${Utils.fmt(total)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="inv-footer">
          <strong>${Utils.EMPRESA.nombre}</strong> &bull; ${Utils.EMPRESA.correo} &bull; Tel: ${Utils.EMPRESA.telefono} &bull; RNC: ${Utils.EMPRESA.rnc}
        </div>
      </div>`;
  }

  // ---- Cotización preview — CORREGIDO: datos del cliente + ITBIS condicional ----
  function buildCotHTML(h, items) {
    // ✅ ITBIS condicional
    const subtotal  = h.subtotal !== undefined ? h.subtotal : items.reduce((s, it) => s + it.subtotal, 0);
    const conItbis  = h.conItbis !== false;
    const itebis    = conItbis ? subtotal * Utils.EMPRESA.itebis : 0;
    const total     = subtotal + itebis;

    const itemRows = items.map((it, i) => `
      <tr>
        <td class="no">${String.fromCharCode(65 + i)}</td>
        <td>${it.nombre}</td>
        <td class="tc">${it.cant}</td>
        <td class="tc">${it.unidad || 'M2'}</td>
        <td class="tr">${Utils.fmt(it.precio)}</td>
        <td class="tr">${Utils.fmt(it.subtotal)}</td>
      </tr>`).join('');

    const emptyRows = Array(Math.max(0, 3 - items.length))
      .fill('<tr><td></td><td style="height:16px;border-bottom:1px solid #e0f0e5;"></td><td></td><td></td><td></td><td></td></tr>')
      .join('');

    return `${PREVIEW_STYLE}
      <div class="inv-doc">
        <div class="inv-header">
          ${logoBlock()}
          <div class="inv-title-area">
            <div>
              <div class="inv-title-row">
                <div class="inv-type">Cotización</div>
                <div class="inv-badge">COTIZACIÓN</div>
              </div>
              <div class="inv-nums">
                <div><span>No.</span> <strong>${h.numero}</strong></div>
                <div><span>Fecha:</span> <strong>${h.fecha}</strong></div>
                <div><span>Válida:</span> <strong>${h.validez || 15} días</strong></div>
                <div><span>RNC:</span> <strong>—</strong></div>
              </div>
            </div>
            <!-- ✅ Bloque cliente visible y completo -->
            <div class="inv-client">
              <div class="inv-client-lbl">Cotizado a</div>
              <div class="inv-client-name">${h.cliente || '—'}</div>
              <div class="inv-client-grid">
                ${h.telefono  ? `<div class="inv-client-item"><b>Tel:</b> ${h.telefono}</div>` : ''}
                ${h.email     ? `<div class="inv-client-item"><b>Email:</b> ${h.email}</div>` : ''}
                ${h.direccion ? `<div class="inv-client-item"><b>Dirección:</b> ${h.direccion}</div>` : '<div class="inv-client-item"><b>Dirección:</b> Santo Domingo D.N.</div>'}
              </div>
            </div>
          </div>
        </div>

        <table class="inv-table">
          <thead>
            <tr><th style="width:30px">No.</th><th>Descripción</th><th style="width:45px">Área</th><th style="width:35px">UN</th><th style="width:85px">Valor</th><th style="width:85px">Subtotal</th></tr>
          </thead>
          <tbody>
            ${itemRows}
            ${emptyRows}
          </tbody>
        </table>

        <div class="inv-bottom">
          <div class="inv-notes">
            ${h.notas ? `<strong>Condiciones de Pago</strong>${h.notas}` : '<strong>Precios sujetos a cambio sin previo aviso.</strong>'}
          </div>
          <div class="inv-totals">
            <table>
              <tr>
                <td class="tl">Subtotal</td>
                <td class="tv">${Utils.fmt(subtotal)}</td>
              </tr>
              ${conItbis ? `<tr>
                <td class="tl">ITBIS ${Math.round(Utils.EMPRESA.itebis * 100)}%</td>
                <td class="tv">${Utils.fmt(itebis)}</td>
              </tr>` : `<tr>
                <td class="tl" style="font-size:7px;color:#bbb;">Sin ITBIS</td>
                <td class="tv" style="color:#bbb;">—</td>
              </tr>`}
              <tr class="grand">
                <td class="tl">Total RDS</td>
                <td class="tv">${Utils.fmt(total)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="inv-footer">
          <strong>${Utils.EMPRESA.nombre}</strong> &bull; ${Utils.EMPRESA.correo} &bull; Tel: ${Utils.EMPRESA.telefono} &bull; RNC: ${Utils.EMPRESA.rnc}<br>
          Esta cotización es válida por ${h.validez || 15} días a partir de la fecha de emisión.
        </div>
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