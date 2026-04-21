/* ============================================================
   utils.js  —  Helpers compartidos
   ============================================================ */

const Utils = (() => {

  function gen7DigitId() {
    return String(Math.floor(1000000 + Math.random() * 9000000));
  }

  const ICON = { success: 'check', error: 'times', warning: 'exclamation-triangle', info: 'info' };

  function showAlert(elementId, type, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = `alert alert--${type} is-visible`;
    el.innerHTML = `<i class="fas fa-${ICON[type] || 'info'}-circle"></i> ${message}`;
  }

  function hideAlert(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.className = 'alert';
  }

  function showModal(id)  { document.getElementById(id)?.classList.remove('u-hidden'); }
  function hideModal(id)  { document.getElementById(id)?.classList.add('u-hidden'); }
  function resetForm(formId) { document.getElementById(formId)?.reset(); }

  function today()   { return new Date().toLocaleDateString('es-DO'); }
  function nowTime() { return new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }); }

  // ================================================================
  // EMPRESA INFO
  // ================================================================
  const EMPRESA = {
    nombre:    'Soluciones Linares P',
    correo:    'solucionesp@gmail.com',
    direccion: 'Av. Hermanas Mirabal Santa Cruz, Villa Mella. Frente a helados bon. S.D.N.',
    telefono:  '849-850-0698',
    rnc:       '22500275478',
    contacto:  'Gumeidy Linares',
    itebis:    0.18,
    moneda:    'RD$',
  };

  function fmt(n) {
    return EMPRESA.moneda + ' ' + parseFloat(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ================================================================
  // SHARED PRINT CSS — elegant template base
  // ================================================================
  const PRINT_CSS = `
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size:10px; color:#1a1a2e; background:#fff; }

    /* ---- WRAPPER ---- */
    .doc-wrap { max-width:740px; margin:0 auto; padding:14mm 12mm; }

    /* ---- HEADER ---- */
    .doc-header {
      display:flex; justify-content:space-between; align-items:stretch;
      margin-bottom:16px; gap:16px;
      border-bottom:3px solid #22783A; padding-bottom:12px;
    }

    /* Logo / empresa */
    .logo-box {
      background:linear-gradient(135deg,#1a5c30 0%,#22783A 60%,#2d9e4e 100%);
      color:#fff; border-radius:8px; padding:12px 14px;
      min-width:200px; max-width:220px; position:relative; overflow:hidden;
    }
    .logo-box::after {
      content:''; position:absolute; bottom:-20px; right:-20px;
      width:80px; height:80px; border-radius:50%;
      background:rgba(255,255,255,0.07);
    }
    .logo-title { font-size:14px; font-weight:700; line-height:1.25; margin-bottom:6px; padding-right:36px; }
    .logo-icon {
      position:absolute; top:8px; right:8px;
      background:rgba(0,0,0,0.25); border-radius:6px;
      width:34px; height:30px; display:flex; align-items:center; justify-content:center;
      font-size:17px;
    }
    .logo-sep { border-top:1px solid rgba(255,255,255,0.3); margin:6px 0; }
    .logo-info { font-size:6.8px; line-height:1.75; opacity:0.9; }
    .logo-contact { margin-top:5px; font-size:7.5px; font-weight:700; color:#b4ffb4; }

    /* Doc title & meta */
    .doc-title-area { flex:1; display:flex; flex-direction:column; justify-content:space-between; }
    .doc-title-row { display:flex; justify-content:space-between; align-items:flex-start; }
    .doc-type { font-size:26px; font-weight:800; color:#1a5c30; letter-spacing:-1px; line-height:1; }
    .doc-badge {
      background:#1a5c30; color:#fff; font-size:8px; font-weight:700;
      padding:4px 10px; border-radius:20px; letter-spacing:0.08em; align-self:flex-start;
    }
    .doc-num-row { display:grid; grid-template-columns:1fr 1fr; gap:4px 16px; font-size:8.5px; margin-top:8px; }
    .doc-num-row span { color:#555; }
    .doc-num-row strong { color:#1a1a2e; }

    /* Client block */
    .client-block {
      background:#f0faf4; border:1px solid #c8ead4; border-left:4px solid #22783A;
      border-radius:0 6px 6px 0; padding:8px 12px; margin-top:8px; font-size:8.5px;
    }
    .client-block .lbl { color:#22783A; font-weight:700; font-size:7px; text-transform:uppercase; letter-spacing:0.07em; }
    .client-block .val { color:#1a1a2e; font-size:9px; font-weight:600; margin-top:1px; }
    .client-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 14px; margin-top:4px; }

    /* ---- PRODUCTS TABLE ---- */
    .prod-table { width:100%; border-collapse:collapse; margin-top:12px; font-size:9px; }
    .prod-table thead tr { background:#1a5c30; color:#fff; }
    .prod-table th {
      padding:6px 8px; text-align:left; font-weight:700;
      font-size:7.5px; text-transform:uppercase; letter-spacing:0.06em;
    }
    .prod-table th:not(:first-child):not(:nth-child(2)) { text-align:center; }
    .prod-table th:last-child, .prod-table th:nth-last-child(2) { text-align:right; }

    .prod-table tbody tr:nth-child(odd)  { background:#f4fdf7; }
    .prod-table tbody tr:nth-child(even) { background:#fff; }
    .prod-table tbody tr:hover { background:#e8f7ed; }
    .prod-table td { padding:6px 8px; border-bottom:1px solid #dff0e4; color:#2a2a2a; }
    .prod-table td.tc { text-align:center; }
    .prod-table td.tr { text-align:right; }
    .prod-table td.no { color:#22783A; font-weight:700; text-align:center; }

    /* ---- TOTALS ---- */
    .totals-wrap { display:flex; justify-content:space-between; align-items:flex-end; margin-top:14px; gap:16px; }
    .notes-box { flex:1; font-size:8px; color:#555; line-height:1.65; max-width:55%; }
    .notes-box strong { color:#1a1a2e; display:block; margin-bottom:2px; font-size:8px; text-transform:uppercase; letter-spacing:0.05em; }
    .totals-box { min-width:200px; }
    .totals-box table { width:100%; border-collapse:collapse; }
    .totals-box td { padding:4px 8px; font-size:9px; }
    .totals-box .t-lbl { text-align:right; color:#555; }
    .totals-box .t-val { text-align:right; font-weight:700; color:#1a1a2e; width:90px; border-bottom:1px solid #e0ede5; }
    .totals-box tr.grand { background:#1a5c30; border-radius:4px; }
    .totals-box tr.grand td { color:#fff; padding:7px 10px; font-size:10px; font-weight:800; }
    .totals-box tr.grand .t-lbl { color:rgba(255,255,255,0.85); }
    .totals-box tr.grand .t-val { color:#fff; border-bottom:none; font-size:11px; }

    /* ---- FOOTER ---- */
    .doc-footer { margin-top:18px; padding-top:10px; border-top:1px dashed #c8ead4; text-align:center; font-size:7.5px; color:#888; }
    .doc-footer strong { color:#22783A; }

    @media print {
      body { background:#fff; }
      .doc-wrap { padding:10mm 8mm; }
      @page { margin:0; size:letter; }
    }
  `;

  // ================================================================
  // SHARED HTML BUILDER — logo + header block
  // ================================================================
  function buildDocHeader(docType, docBadge, metaFields, clientData) {
    const E = EMPRESA;
    const metaRows = metaFields.map(([lbl, val]) =>
      `<div><span>${lbl}</span> <strong>${val || '—'}</strong></div>`).join('');

    const clientRows = clientData.map(([lbl, val]) => val ? `
      <div>
        <div class="lbl">${lbl}</div>
        <div class="val">${val}</div>
      </div>` : '').join('');

    return `
      <div class="doc-header">
        <div class="logo-box">
          <div class="logo-title">${E.nombre}</div>
          <div class="logo-icon">🏠</div>
          <div class="logo-sep"></div>
          <div class="logo-info">
            correo: ${E.correo}<br>
            ${E.direccion}<br>
            Tel: ${E.telefono}<br>
            RNC: ${E.rnc}
          </div>
          <div class="logo-contact">Contacto: ${E.contacto}</div>
        </div>
        <div class="doc-title-area">
          <div>
            <div class="doc-title-row">
              <div class="doc-type">${docType}</div>
              <div class="doc-badge">${docBadge}</div>
            </div>
            <div class="doc-num-row">${metaRows}</div>
          </div>
          <div class="client-block">
            <div class="client-grid">${clientRows}</div>
          </div>
        </div>
      </div>`;
  }

  // ================================================================
  // PRINT: Factura de venta — CORREGIDO (cliente + ITBIS condicional)
  // ================================================================
  function printVenta(inv) {
    // ✅ ITBIS condicional — usa el flag del documento
    const conItbis  = inv.conItbis !== undefined ? inv.conItbis : true;
    const itebisAmt = conItbis ? inv.total * EMPRESA.itebis : 0;
    const totalRDS  = inv.total + itebisAmt;

    const header = buildDocHeader(
      'Factura',
      'ORIGINAL',
      [
        ['No.', inv.id],
        ['Fecha:', inv.fecha],
        ['Hora:', inv.hora],
        ['RNC:', ''],
      ],
      [
        // ✅ Datos del cliente — correctamente propagados
        ['Cliente', inv.cliente],
        ['Teléfono', inv.telefono || ''],
        ['Contacto', inv.contacto || ''],
        ['Dirección', inv.direccion || ''],
      ]
    );

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura ${inv.id}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<div class="doc-wrap">
  ${header}

  <table class="prod-table">
    <thead>
      <tr>
        <th style="width:32px">No.</th>
        <th>Descripción</th>
        <th style="width:50px">Cant.</th>
        <th style="width:90px">P. Unitario</th>
        <th style="width:90px">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="no">A</td>
        <td>${inv.producto}${inv.codigo ? ` <span style="color:#888;font-size:8px;">(${inv.codigo})</span>` : ''}</td>
        <td class="tc">${inv.cantidad}</td>
        <td class="tr">${fmt(inv.precio)}</td>
        <td class="tr">${fmt(inv.total)}</td>
      </tr>
      <tr><td colspan="5" style="height:18px;border-bottom:1px solid #dff0e4;"></td></tr>
      <tr><td colspan="5" style="height:18px;border-bottom:1px solid #dff0e4;"></td></tr>
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="notes-box">
      ${inv.notas ? `<strong>Condiciones</strong>${inv.notas}` : '<strong>Gracias por su preferencia</strong>'}
    </div>
    <div class="totals-box">
      <table>
        <tr>
          <td class="t-lbl">Subtotal</td>
          <td class="t-val">${fmt(inv.total)}</td>
        </tr>
        ${conItbis ? `<tr>
          <td class="t-lbl">ITBIS ${Math.round(EMPRESA.itebis * 100)}%</td>
          <td class="t-val">${fmt(itebisAmt)}</td>
        </tr>` : `<tr>
          <td class="t-lbl" style="font-size:7.5px;color:#aaa;">Sin ITBIS</td>
          <td class="t-val" style="color:#aaa;">—</td>
        </tr>`}
        <tr class="grand">
          <td class="t-lbl">Total RDS</td>
          <td class="t-val">${fmt(totalRDS)}</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="doc-footer">
    <strong>${EMPRESA.nombre}</strong> &bull; ${EMPRESA.correo} &bull; Tel: ${EMPRESA.telefono} &bull; RNC: ${EMPRESA.rnc}
  </div>
</div>
<script>window.onload=function(){ window.print(); window.onafterprint=function(){ window.close(); }; }<\/script>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=750');
    w.document.write(html);
    w.document.close();
  }

  // ================================================================
  // PRINT: Cotización — CORREGIDO (cliente + ITBIS condicional)
  // ================================================================
  function printCotizacion(header, items) {
    // ✅ ITBIS condicional
    const subtotal  = header.subtotal !== undefined ? header.subtotal : items.reduce((s, it) => s + it.subtotal, 0);
    const conItbis  = header.conItbis !== false;
    const itebis    = conItbis ? subtotal * EMPRESA.itebis : 0;
    const total     = subtotal + itebis;

    const itemRows = items.map((it, i) => `
      <tr>
        <td class="no">${String.fromCharCode(65 + i)}</td>
        <td>${it.nombre}</td>
        <td class="tc">${it.cant}</td>
        <td class="tc">${it.unidad || 'M2'}</td>
        <td class="tr">${fmt(it.precio)}</td>
        <td class="tr">${fmt(it.subtotal)}</td>
      </tr>`).join('');

    const empties = Array(Math.max(0, 4 - items.length))
      .fill('<tr><td class="no"></td><td style="height:18px;"></td><td></td><td></td><td></td><td></td></tr>')
      .join('');

    // ✅ Datos del cliente correctamente propagados
    const docHeader = buildDocHeader(
      'Cotización',
      'COTIZACIÓN',
      [
        ['No.', header.numero],
        ['Fecha:', header.fecha],
        ['Válida:', `${header.validez || 15} días`],
        ['RNC:', ''],
      ],
      [
        ['Cotizado a', header.cliente],
        ['Teléfono', header.telefono || ''],
        ['Email', header.email || ''],
        ['Dirección', header.direccion || 'Santo Domingo D.N.'],
      ]
    );

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cotización ${header.numero}</title>
<style>${PRINT_CSS}</style>
</head>
<body>
<div class="doc-wrap">
  ${docHeader}

  <table class="prod-table">
    <thead>
      <tr>
        <th style="width:32px">No.</th>
        <th>Descripción</th>
        <th style="width:50px">Área</th>
        <th style="width:38px">UN</th>
        <th style="width:90px">Valor</th>
        <th style="width:90px">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      ${empties}
    </tbody>
  </table>

  <div class="totals-wrap">
    <div class="notes-box">
      ${header.notas ? `<strong>Condiciones de Pago</strong>${header.notas}` : '<strong>Precios sujetos a cambio sin previo aviso.</strong>'}
    </div>
    <div class="totals-box">
      <table>
        <tr>
          <td class="t-lbl">Subtotal</td>
          <td class="t-val">${fmt(subtotal)}</td>
        </tr>
        ${conItbis ? `<tr>
          <td class="t-lbl">ITBIS ${Math.round(EMPRESA.itebis * 100)}%</td>
          <td class="t-val">${fmt(itebis)}</td>
        </tr>` : `<tr>
          <td class="t-lbl" style="font-size:7.5px;color:#aaa;">Sin ITBIS</td>
          <td class="t-val" style="color:#aaa;">—</td>
        </tr>`}
        <tr class="grand">
          <td class="t-lbl">Total RDS</td>
          <td class="t-val">${fmt(total)}</td>
        </tr>
      </table>
    </div>
  </div>

  <div class="doc-footer">
    <strong>${EMPRESA.nombre}</strong> &bull; ${EMPRESA.correo} &bull; Tel: ${EMPRESA.telefono} &bull; RNC: ${EMPRESA.rnc}<br>
    Esta cotización es válida por ${header.validez || 15} días a partir de la fecha de emisión.
  </div>
</div>
<script>window.onload=function(){ window.print(); window.onafterprint=function(){ window.close(); }; }<\/script>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=750');
    w.document.write(html);
    w.document.close();
  }

  // ================================================================
  // PDF: COTIZACIÓN — CORREGIDO (ITBIS condicional + cliente)
  // ================================================================
  function generateCotizacionPDF(header, items) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const PW = 215.9; const ML = 12; const MR = 12; const CW = PW - ML - MR;

    const G1 = [26, 92, 48]; const G2 = [34, 120, 56]; const G3 = [220, 245, 225];
    const GRAY = [180, 180, 180]; const BLACK = [26, 26, 46]; const WHITE = [255, 255, 255];

    // Header verde
    doc.setFillColor(...G1); doc.rect(0, 0, PW, 36, 'F');
    doc.setFillColor(255, 255, 255, 0.05);

    // Logo box
    doc.setFillColor(...G2); doc.roundedRect(ML, 4, 84, 28, 3, 3, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(EMPRESA.nombre, ML + 4, 13, { maxWidth: 76 });
    doc.setDrawColor(...WHITE); doc.setLineWidth(0.3);
    doc.line(ML + 4, 17, ML + 80, 17);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text(`Tel: ${EMPRESA.telefono}  |  RNC: ${EMPRESA.rnc}`, ML + 4, 21);
    doc.text(EMPRESA.correo, ML + 4, 26);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 255, 180);
    doc.text(`Contacto: ${EMPRESA.contacto}`, ML + 4, 31);

    // Título
    doc.setTextColor(...WHITE); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('Cotización', ML + 96, 18);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(`No. ${header.numero}  |  Fecha: ${header.fecha}  |  Válida: ${header.validez || 15} días`, ML + 96, 26);

    // ✅ Bloque cliente — datos correctamente mostrados
    const subtotal  = header.subtotal !== undefined ? header.subtotal : items.reduce((s, it) => s + it.subtotal, 0);
    const conItbis  = header.conItbis !== false;
    const itebis    = conItbis ? subtotal * EMPRESA.itebis : 0;
    const total     = subtotal + itebis;

    doc.setFillColor(240, 250, 244);
    doc.rect(ML, 40, CW, 18, 'F');
    doc.setDrawColor(...G2); doc.setLineWidth(0.5);
    doc.line(ML, 40, ML, 58);
    doc.setTextColor(...BLACK); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', ML + 3, 45);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(header.cliente || '—', ML + 3, 51);
    doc.setFontSize(7); doc.setTextColor(80, 80, 80);
    if (header.telefono) doc.text(`Tel: ${header.telefono}`, ML + 3, 56);
    if (header.email) doc.text(`Email: ${header.email}`, ML + 70, 56);
    doc.text(`Dirección: ${header.direccion || 'Santo Domingo D.N.'}`, ML + 3, 60);

    // Tabla
    doc.autoTable({
      startY: 65,
      head: [['No.', 'Descripción', 'Área', 'UN', 'Valor', 'Subtotal']],
      body: [
        ...items.map((it, i) => [String.fromCharCode(65 + i), it.nombre, it.cant, it.unidad || 'M2', fmt(it.precio), fmt(it.subtotal)]),
        ...Array(Math.max(0, 4 - items.length)).fill(['', '', '', '', '', '']),
      ],
      foot: (() => {
        const rows = [['', '', '', '', 'Subtotal', fmt(subtotal)]];
        if (conItbis) rows.push(['', '', '', '', `ITBIS ${Math.round(EMPRESA.itebis * 100)}%`, fmt(itebis)]);
        rows.push(['', '', '', '', 'TOTAL RDS', fmt(total)]);
        return rows;
      })(),
      headStyles: { fillColor: G1, textColor: WHITE, fontStyle: 'bold', fontSize: 8, lineWidth: 0 },
      bodyStyles: { fontSize: 8.5, textColor: BLACK, lineColor: [220, 240, 225], lineWidth: 0.2 },
      footStyles: { fillColor: WHITE, textColor: BLACK, fontStyle: 'bold', fontSize: 8.5, lineWidth: 0.2, halign: 'right' },
      alternateRowStyles: { fillColor: G3 },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 2: { cellWidth: 16, halign: 'center' }, 3: { cellWidth: 14, halign: 'center' }, 4: { cellWidth: 30, halign: 'right' }, 5: { cellWidth: 32, halign: 'right' } },
      margin: { left: ML, right: MR }, tableWidth: CW,
      willDrawCell(data) {
        if (data.section === 'foot') {
          const isLast = data.row.index === (conItbis ? 2 : 1);
          if (isLast) doc.setFillColor(...G3);
        }
      },
    });

    const fy = doc.lastAutoTable.finalY + 8;
    if (header.notas) {
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...BLACK);
      doc.text('Condiciones de pago:', ML, fy);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80);
      doc.text(header.notas, ML, fy + 5, { maxWidth: CW });
    }

    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(140, 140, 140);
    doc.text(`${EMPRESA.nombre}  ·  ${EMPRESA.correo}  ·  Tel: ${EMPRESA.telefono}  ·  RNC: ${EMPRESA.rnc}`, PW / 2, 258, { align: 'center' });
    doc.text('Esta cotización es válida por el período indicado. Precios sujetos a cambio sin previo aviso.', PW / 2, 263, { align: 'center' });

    doc.save(`Cotizacion_${header.numero}_${header.fecha.replace(/\//g, '-')}.pdf`);
  }

  // ================================================================
  // PDF: Factura — CORREGIDO (cliente + ITBIS condicional)
  // ================================================================
  function generateVentaPDF(inv) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const PW = 215.9; const ML = 12; const MR = 12; const CW = PW - ML - MR;

    const G1 = [26, 92, 48]; const G2 = [34, 120, 56]; const G3 = [220, 245, 225];
    const GRAY = [180, 180, 180]; const BLACK = [26, 26, 46]; const WHITE = [255, 255, 255];

    // ✅ ITBIS condicional
    const conItbis  = inv.conItbis !== undefined ? inv.conItbis : true;
    const itebisAmt = conItbis ? inv.total * EMPRESA.itebis : 0;
    const totalRDS  = inv.total + itebisAmt;

    // Header verde
    doc.setFillColor(...G1); doc.rect(0, 0, PW, 36, 'F');
    doc.setFillColor(...G2); doc.roundedRect(ML, 4, 84, 28, 3, 3, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(EMPRESA.nombre, ML + 4, 13, { maxWidth: 76 });
    doc.setDrawColor(...WHITE); doc.setLineWidth(0.3); doc.line(ML + 4, 17, ML + 80, 17);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal');
    doc.text(`Tel: ${EMPRESA.telefono}  |  RNC: ${EMPRESA.rnc}`, ML + 4, 21);
    doc.text(EMPRESA.correo, ML + 4, 26);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 255, 180);
    doc.text(`Contacto: ${EMPRESA.contacto}`, ML + 4, 31);

    doc.setTextColor(...WHITE); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('Factura', ML + 96, 18);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(`No. ${inv.id}  |  Fecha: ${inv.fecha}  |  Hora: ${inv.hora}`, ML + 96, 26);

    // ✅ Bloque cliente — datos correctamente mostrados
    doc.setFillColor(240, 250, 244);
    doc.rect(ML, 40, CW, 18, 'F');
    doc.setDrawColor(...G2); doc.setLineWidth(0.5);
    doc.line(ML, 40, ML, 58);
    doc.setTextColor(...BLACK); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', ML + 3, 45);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(inv.cliente || '—', ML + 3, 51);
    doc.setFontSize(7); doc.setTextColor(80, 80, 80);
    if (inv.telefono) doc.text(`Tel: ${inv.telefono}`, ML + 3, 56);
    if (inv.contacto) doc.text(`Contacto: ${inv.contacto}`, ML + 70, 51);
    if (inv.direccion) doc.text(`Dirección: ${inv.direccion}`, ML + 3, 60);

    const footRows = [['', '', '', 'Subtotal', fmt(inv.total)]];
    if (conItbis) footRows.push(['', '', '', `ITBIS ${Math.round(EMPRESA.itebis * 100)}%`, fmt(itebisAmt)]);
    footRows.push(['', '', '', 'TOTAL RDS', fmt(totalRDS)]);

    doc.autoTable({
      startY: 65,
      head: [['No.', 'Descripción', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: [
        ['A', `${inv.producto}${inv.codigo ? ` (${inv.codigo})` : ''}`, inv.cantidad, fmt(inv.precio), fmt(inv.total)],
        ...Array(3).fill(['', '', '', '', '']),
      ],
      foot: footRows,
      headStyles: { fillColor: G1, textColor: WHITE, fontStyle: 'bold', fontSize: 8, lineWidth: 0 },
      bodyStyles: { fontSize: 8.5, textColor: BLACK, lineColor: [220, 240, 225], lineWidth: 0.2 },
      footStyles: { fillColor: WHITE, textColor: BLACK, fontStyle: 'bold', fontSize: 8.5, lineWidth: 0.2, halign: 'right' },
      alternateRowStyles: { fillColor: G3 },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 2: { cellWidth: 18, halign: 'center' }, 3: { cellWidth: 36, halign: 'right' }, 4: { cellWidth: 36, halign: 'right' } },
      margin: { left: ML, right: MR }, tableWidth: CW,
      willDrawCell(data) {
        if (data.section === 'foot') {
          const isLast = data.row.index === footRows.length - 1;
          if (isLast) doc.setFillColor(...G3);
        }
      },
    });

    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(140, 140, 140);
    doc.text(`${EMPRESA.nombre}  ·  ${EMPRESA.correo}  ·  Tel: ${EMPRESA.telefono}  ·  RNC: ${EMPRESA.rnc}`, PW / 2, 258, { align: 'center' });
    doc.text('Gracias por su compra.', PW / 2, 263, { align: 'center' });

    doc.save(`Factura_${inv.id}_${inv.fecha.replace(/\//g, '-')}.pdf`);
  }

  // ================================================================
  // Excel: Factura
  // ================================================================
  function generateVentaExcel(inv) {
    const conItbis  = inv.conItbis !== undefined ? inv.conItbis : true;
    const itebisAmt = conItbis ? inv.total * EMPRESA.itebis : 0;
    const totalRDS  = inv.total + itebisAmt;
    const wb = XLSX.utils.book_new();
    const rows = [
      ['FACTURA DE VENTA', '', '', '', ''], [],
      ['Empresa:', EMPRESA.nombre, '', 'Fecha:', inv.fecha],
      ['N° Factura:', inv.id, '', 'Hora:', inv.hora],
      ['Cliente:', inv.cliente || '—', '', '', ''], [],   // ✅ cliente incluido
      ['NO.', 'DESCRIPCION', 'CANTIDAD', 'P. UNITARIO', 'SUB-TOTAL'],
      ['A', `${inv.producto}${inv.codigo ? ` (${inv.codigo})` : ''}`, inv.cantidad, inv.precio, inv.total], [],
      ['', '', '', 'SUB-TOTAL', inv.total],
    ];
    if (conItbis) rows.push(['', '', '', `ITBIS ${Math.round(EMPRESA.itebis * 100)}%`, itebisAmt]);
    rows.push(['', '', '', 'TOTAL RDS', totalRDS]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Factura');
    XLSX.writeFile(wb, `Factura_${inv.id}_${inv.fecha.replace(/\//g, '-')}.xlsx`);
  }

  // ================================================================
  // Excel: Cotización
  // ================================================================
  function generateCotizacionExcel(header, items) {
    const subtotal  = header.subtotal !== undefined ? header.subtotal : items.reduce((s, it) => s + it.subtotal, 0);
    const conItbis  = header.conItbis !== false;
    const itebis    = conItbis ? subtotal * EMPRESA.itebis : 0;
    const total     = subtotal + itebis;
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['COTIZACIÓN', '', '', '', '', ''], [],
      ['No. Cotización:', header.numero, '', 'Fecha:', header.fecha, ''],
      ['Cliente:', header.cliente || '—', '', 'Validez:', `${header.validez || 15} días`, ''],   // ✅ cliente
      ['Teléfono:', header.telefono || '', '', 'Dirección:', header.direccion || 'Santo Domingo D.N.', ''], [],
      ['NO.', 'DESCRIPCION', 'AREA', 'UN', 'VALOR', 'SUB-TOTAL'],
      ...items.map((it, i) => [String.fromCharCode(65 + i), it.nombre, it.cant, it.unidad || 'M2', it.precio, it.subtotal]), [],
      ['', '', '', '', 'SUB-TOTAL', subtotal],
    ];
    if (conItbis) wsData.push(['', '', '', '', `ITBIS ${Math.round(EMPRESA.itebis * 100)}%`, itebis]);
    wsData.push(['', '', '', '', 'TOTAL RDS', total]);
    if (header.notas) { wsData.push([]); wsData.push([`Condiciones de pago: ${header.notas}`]); }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 8 }, { wch: 32 }, { wch: 10 }, { wch: 8 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Cotización');
    XLSX.writeFile(wb, `Cotizacion_${header.numero}_${header.fecha.replace(/\//g, '-')}.xlsx`);
  }

  // ================================================================
  // Excel: Resumen
  // ================================================================
  function generateResumenExcel(type, data) {
    const headers = Object.keys(data[0]).map(h => h.toUpperCase().replace('_', ' '));
    const rows    = data.map(row => Object.values(row).map(v => v instanceof Date ? v.toLocaleDateString() : v));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 14) }));
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `Resumen_${type}_${today().replace(/\//g, '-')}.xlsx`);
  }

  return {
    gen7DigitId, EMPRESA, fmt,
    showAlert, hideAlert,
    showModal, hideModal, resetForm,
    today, nowTime,
    generateVentaPDF, generateVentaExcel,
    generateCotizacionPDF, generateCotizacionExcel,
    generateResumenExcel,
    printVenta, printCotizacion,
  };
})();