/* ============================================================
   utils.js  —  Helpers compartidos
   ============================================================ */

const Utils = (() => {

  // ---- IDs ----
  function gen7DigitId() {
    return String(Math.floor(1000000 + Math.random() * 9000000));
  }

  // ---- Alertas ----
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

  // ---- Modales ----
  function showModal(id)  { document.getElementById(id)?.classList.remove('u-hidden'); }
  function hideModal(id)  { document.getElementById(id)?.classList.add('u-hidden'); }

  // ---- Formularios ----
  function resetForm(formId) { document.getElementById(formId)?.reset(); }

  // ---- Fechas ----
  function today()   { return new Date().toLocaleDateString('es-DO'); }
  function nowTime() { return new Date().toLocaleTimeString('es-DO'); }

  // ================================================================
  // EMPRESA INFO — edita aquí para personalizar los documentos
  // ================================================================
  const EMPRESA = {
    nombre:    'Soluciones Linares P',
    correo:    'solucionesp@gmail.com',
    direccion: 'Av. Hermanas Mirabal Santa Cruz, Villa Mella. Frente a helados bon. S.D.N.',
    telefono:  '849-850-0698',
    rnc:       '22500275478',
    contacto:  'Gumeidy Linares',
    itebis:    0.18,       // 18 %  (0 para no aplicar)
    moneda:    'RD$',
  };

  // ================================================================
  // HELPER — formateo de moneda
  // ================================================================
  function fmt(n) {
    return EMPRESA.moneda + ' ' + parseFloat(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ================================================================
  // PDF: COTIZACIÓN  (plantilla igual a la imagen)
  // ================================================================
  function generateCotizacionPDF(header, items) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const PW = 215.9;   // letter width mm
    const ML = 10;      // margin left
    const MR = 10;      // margin right
    const CW = PW - ML - MR;  // content width

    // ---- Paleta ----
    const GREEN      = [34, 120, 56];
    const GREEN_DARK = [20, 80, 35];
    const GREEN_LITE = [220, 245, 225];
    const GRAY_LINE  = [180, 180, 180];
    const BLACK      = [30, 30, 30];
    const WHITE      = [255, 255, 255];
    const BLUE_HEAD  = [25, 60, 130];

    // ================================================================
    // HEADER BLOCK — logo verde izquierda | título derecha
    // ================================================================
    const HDR_H = 42;
    // Fondo verde del logo
    doc.setFillColor(...GREEN);
    doc.roundedRect(ML, 8, 80, HDR_H, 3, 3, 'F');

    // Nombre empresa en blanco grande
    doc.setTextColor(...WHITE);
    doc.setFontSize(15); doc.setFont('helvetica', 'bold');
    doc.text(EMPRESA.nombre, ML + 4, 20, { maxWidth: 72 });

    // Icono de casa (usando símbolo unicode o simplemente un rectángulo verde oscuro decorativo)
    doc.setFillColor(...GREEN_DARK);
    doc.rect(ML + 58, 10, 20, 16, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(12);
    doc.text('🏠', ML + 62, 21); // símbolo casa

    // Línea blanca separadora dentro del logo
    doc.setDrawColor(...WHITE);
    doc.setLineWidth(0.4);
    doc.line(ML + 4, 27, ML + 76, 27);

    // Datos empresa (zona inferior del bloque verde)
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...WHITE);
    doc.text(`correo: ${EMPRESA.correo}`,       ML + 4, 32);
    doc.text(EMPRESA.direccion,                  ML + 4, 37, { maxWidth: 72 });
    doc.text(`telefono: ${EMPRESA.telefono}`,    ML + 4, 43);
    doc.text(`RNC: ${EMPRESA.rnc}`,              ML + 4, 47);

    // Contacto en negrita / verde claro
    doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 255, 180);
    doc.text(`contacto: ${EMPRESA.contacto}`, ML + 4, 52);

    // ---- Bloque derecho: título COTIZACIÓN ----
    const TX = ML + 90;  // texto derecho x
    doc.setTextColor(...BLACK); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('Cotizacion', TX, 18);

    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const rnl = 9; // row line height
    let ry = 26;
    doc.text(`No. ${header.numero}`,             TX, ry); ry += rnl - 2;
    doc.text(`Fecha: ${header.fecha}`,           TX, ry); ry += rnl - 2;
    doc.text(`Cotizacion valida por ${header.validez || 15} dias.`, TX, ry); ry += rnl;
    doc.text('',                                 TX, ry); ry += rnl - 4;
    doc.text(`RNC.`,                             TX, ry); ry += rnl - 2;
    doc.text(`Cotizado a: ${header.cliente}`,    TX, ry); ry += rnl - 2;
    doc.text(`Telefono: ${header.telefono || ''}`, TX, ry); ry += rnl - 2;
    doc.text(`Contacto:`,                        TX, ry); ry += rnl - 2;
    doc.text(`Direccion: ${header.direccion || 'Santo Domingo D.N.'}`, TX, ry);

    // ================================================================
    // TABLA DE PRODUCTOS
    // ================================================================
    const tableTop = 62;

    // Calcular totales
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const itebis   = subtotal * EMPRESA.itebis;
    const total    = subtotal + itebis;

    doc.autoTable({
      startY: tableTop,
      head: [['NO.', 'DESCRIPCION', 'AREA', 'UN', 'VALOR', 'SUB-TOTAL']],
      body: [
        // Filas de productos
        ...items.map((it, i) => [
          String.fromCharCode(65 + i),   // A, B, C…
          it.nombre,
          it.cant,
          it.unidad || 'M2',
          fmt(it.precio),
          fmt(it.subtotal),
        ]),
        // Filas vacías para dar espacio (mínimo 5 filas en total como en la imagen)
        ...Array(Math.max(0, 4 - items.length)).fill(['', '', '', '', '', '']),
      ],
      foot: [
        ['', '', '', '', 'SUB-TOTAL',    fmt(subtotal)],
        ['', '', '', '', `ITEBIS ${Math.round(EMPRESA.itebis * 100)}%`, fmt(itebis)],
        ['', '', '', '', 'TOTAL RDS',   fmt(total)],
      ],
      headStyles: {
        fillColor: WHITE,
        textColor: BLACK,
        fontStyle: 'bold',
        fontSize:  9,
        lineColor: GRAY_LINE,
        lineWidth: 0.3,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: BLACK,
        lineColor: GRAY_LINE,
        lineWidth: 0.2,
      },
      footStyles: {
        fillColor: WHITE,
        textColor: BLACK,
        fontStyle: 'bold',
        fontSize:  9,
        lineColor: GRAY_LINE,
        lineWidth: 0.2,
        halign: 'right',
      },
      alternateRowStyles: { fillColor: GREEN_LITE },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 14, halign: 'center' },
        4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: ML, right: MR },
      tableWidth: CW,
      // Dibujar borde externo
      didDrawPage(data) {
        // borde exterior tabla
        doc.setDrawColor(...GRAY_LINE); doc.setLineWidth(0.4);
      },
      willDrawCell(data) {
        // Resaltar filas de foot con fondo blanco y texto en negrita derecho
        if (data.section === 'foot') {
          doc.setFillColor(255, 255, 255);
          if (data.row.index === 2) {
            // TOTAL RDS — destacar
            doc.setFillColor(220, 245, 225);
          }
        }
      },
    });

    // ---- Notas / condiciones de pago ----
    const fy = doc.lastAutoTable.finalY + 6;
    if (header.notas) {
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...BLACK);
      doc.text(`condiciones de pago: ${header.notas}`, ML, fy + 4, { maxWidth: CW });
    }

    // ---- Pie de página ----
    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(150, 150, 150);
    doc.text('Esta cotización es válida por el período indicado. Precios sujetos a cambio sin previo aviso.',
      PW / 2, 265, { align: 'center' });

    doc.save(`Cotizacion_${header.numero}_${header.fecha.replace(/\//g, '-')}.pdf`);
  }

  // ================================================================
  // PRINT: Cotización (ventana de impresión del navegador)
  // ================================================================
  function printCotizacion(header, items) {
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const itebis   = subtotal * EMPRESA.itebis;
    const total    = subtotal + itebis;

    const itemRows = items.map((it, i) => `
      <tr>
        <td class="tc">${String.fromCharCode(65 + i)}</td>
        <td>${it.nombre}</td>
        <td class="tc">${it.cant}</td>
        <td class="tc">${it.unidad || 'M2'}</td>
        <td class="tr">${fmt(it.precio)}</td>
        <td class="tr">${fmt(it.subtotal)}</td>
      </tr>`).join('');

    const emptyRows = Array(Math.max(0, 4 - items.length))
      .fill('<tr><td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>').join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cotización ${header.numero}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #1e1e1e; padding: 12mm; }

  /* ---- HEADER ---- */
  .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }

  .logo-box {
    background: #22783A; color: white; border-radius: 6px;
    padding: 8px 10px; width: 200px; position: relative;
  }
  .logo-title { font-size: 15px; font-weight: bold; line-height: 1.2; margin-bottom: 4px; }
  .logo-house {
    position: absolute; top: 6px; right: 6px;
    background: #145023; border-radius: 4px;
    width: 36px; height: 28px; display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-sep { border-top: 1px solid rgba(255,255,255,0.5); margin: 4px 0; }
  .logo-info { font-size: 7px; line-height: 1.65; }
  .logo-contact { color: #b4ffb4; font-weight: bold; margin-top: 2px; font-size: 7.5px; }

  .doc-title-box { text-align: left; min-width: 220px; padding-left: 20px; }
  .doc-title { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
  .doc-meta { font-size: 9px; line-height: 1.7; }

  /* ---- TABLE ---- */
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
  thead th {
    border: 1px solid #bbb; padding: 4px 6px; font-weight: bold;
    background: white; text-transform: uppercase; font-size: 8.5px;
  }
  tbody td { border: 1px solid #bbb; padding: 4px 6px; }
  tbody tr:nth-child(odd)  { background: #dcf5e1; }
  tbody tr:nth-child(even) { background: white; }

  tfoot td { border: 0; padding: 3px 6px; }
  .tfoot-label { text-align: right; font-weight: bold; padding-right: 4px; }
  .tfoot-value { border: 1px solid #bbb; text-align: right; font-weight: bold; min-width: 80px; }
  .tfoot-total { background: #dcf5e1; }

  .tc { text-align: center; }
  .tr { text-align: right; }

  /* ---- FOOTER NOTE ---- */
  .conditions { margin-top: 6px; font-size: 8.5px; }

  @media print {
    body { padding: 8mm; }
    @page { margin: 0; }
  }
</style>
</head>
<body>

<div class="doc-header">
  <div class="logo-box">
    <div class="logo-title">${EMPRESA.nombre}</div>
    <div class="logo-house">🏠</div>
    <div class="logo-sep"></div>
    <div class="logo-info">
      correo: ${EMPRESA.correo}<br>
      ${EMPRESA.direccion}<br>
      telefono: ${EMPRESA.telefono}<br>
      RNC: ${EMPRESA.rnc}
    </div>
    <div class="logo-contact">contacto: ${EMPRESA.contacto}</div>
  </div>

  <div class="doc-title-box">
    <div class="doc-title">Cotizacion</div>
    <div class="doc-meta">
      No. ${header.numero}<br>
      Fecha: ${header.fecha}<br>
      Cotizacion valida por ${header.validez || 15} dias.<br>
      <br>
      RNC.<br>
      Cotizado a: ${header.cliente}<br>
      Telefono: ${header.telefono || ''}<br>
      Contacto:<br>
      Direccion: ${header.direccion || 'Santo Domingo D.N.'}
    </div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:32px">NO.</th>
      <th>DESCRIPCION</th>
      <th style="width:42px">AREA</th>
      <th style="width:38px">UN</th>
      <th style="width:70px">VALOR</th>
      <th style="width:80px">SUB-TOTAL</th>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
    ${emptyRows}
    <tr><td colspan="4" class="conditions">${header.notas ? `condiciones de pago: ${header.notas}` : ''}</td>
      <td class="tfoot-label">SUB-TOTAL</td>
      <td class="tfoot-value">${fmt(subtotal)}</td>
    </tr>
    <tr><td colspan="4"></td>
      <td class="tfoot-label">ITEBIS ${Math.round(EMPRESA.itebis * 100)}%</td>
      <td class="tfoot-value">${fmt(itebis)}</td>
    </tr>
    <tr><td colspan="4"></td>
      <td class="tfoot-label tfoot-total">TOTAL RDS</td>
      <td class="tfoot-value tfoot-total">${fmt(total)}</td>
    </tr>
  </tbody>
</table>

<script>window.onload=function(){ window.print(); window.onafterprint=function(){ window.close(); }; }<\/script>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
  }

  // ================================================================
  // PRINT: Factura de venta
  // ================================================================
  function printVenta(inv) {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Factura ${inv.id}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 10px; color: #1e1e1e; padding: 12mm; }

  .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }

  .logo-box {
    background: #22783A; color: white; border-radius: 6px;
    padding: 8px 10px; width: 200px; position: relative;
  }
  .logo-title { font-size: 15px; font-weight: bold; line-height: 1.2; margin-bottom: 4px; }
  .logo-house {
    position: absolute; top: 6px; right: 6px;
    background: #145023; border-radius: 4px;
    width: 36px; height: 28px; display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-sep { border-top: 1px solid rgba(255,255,255,0.5); margin: 4px 0; }
  .logo-info { font-size: 7px; line-height: 1.65; }
  .logo-contact { color: #b4ffb4; font-weight: bold; margin-top: 2px; font-size: 7.5px; }

  .doc-title-box { text-align: left; min-width: 220px; padding-left: 20px; }
  .doc-title { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
  .doc-meta { font-size: 9px; line-height: 1.7; }

  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
  thead th { border: 1px solid #bbb; padding: 4px 6px; font-weight: bold; background: white; text-transform: uppercase; }
  tbody td { border: 1px solid #bbb; padding: 4px 6px; }
  tbody tr:nth-child(odd) { background: #dcf5e1; }

  .tfoot-label { text-align: right; font-weight: bold; padding-right: 4px; }
  .tfoot-value { border: 1px solid #bbb; text-align: right; font-weight: bold; min-width: 80px; }
  .tfoot-total { background: #dcf5e1; }
  .tc { text-align: center; }
  .tr { text-align: right; }

  @media print { body { padding: 8mm; } @page { margin: 0; } }
</style>
</head>
<body>

<div class="doc-header">
  <div class="logo-box">
    <div class="logo-title">${EMPRESA.nombre}</div>
    <div class="logo-house">🏠</div>
    <div class="logo-sep"></div>
    <div class="logo-info">
      correo: ${EMPRESA.correo}<br>
      ${EMPRESA.direccion}<br>
      telefono: ${EMPRESA.telefono}<br>
      RNC: ${EMPRESA.rnc}
    </div>
    <div class="logo-contact">contacto: ${EMPRESA.contacto}</div>
  </div>

  <div class="doc-title-box">
    <div class="doc-title">Factura</div>
    <div class="doc-meta">
      No. ${inv.id}<br>
      Fecha: ${inv.fecha}<br>
      Hora: ${inv.hora}<br>
      <br>
      RNC.<br>
      Cliente: ${inv.cliente}<br>
      Telefono:<br>
      Contacto:<br>
      Direccion:
    </div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:32px">NO.</th>
      <th>DESCRIPCION</th>
      <th style="width:42px">CANT.</th>
      <th style="width:70px">P. UNITARIO</th>
      <th style="width:80px">SUB-TOTAL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tc">A</td>
      <td>${inv.producto} (${inv.codigo})</td>
      <td class="tc">${inv.cantidad}</td>
      <td class="tr">${fmt(inv.precio)}</td>
      <td class="tr">${fmt(inv.total)}</td>
    </tr>
    <tr><td colspan="3"></td>
      <td class="tfoot-label">SUB-TOTAL</td>
      <td class="tfoot-value">${fmt(inv.total)}</td>
    </tr>
    <tr><td colspan="3"></td>
      <td class="tfoot-label">ITEBIS ${Math.round(EMPRESA.itebis * 100)}%</td>
      <td class="tfoot-value">${fmt(inv.total * EMPRESA.itebis)}</td>
    </tr>
    <tr><td colspan="3"></td>
      <td class="tfoot-label tfoot-total">TOTAL RDS</td>
      <td class="tfoot-value tfoot-total">${fmt(inv.total * (1 + EMPRESA.itebis))}</td>
    </tr>
  </tbody>
</table>

<script>window.onload=function(){ window.print(); window.onafterprint=function(){ window.close(); }; }<\/script>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
  }

  // ================================================================
  // PDF: Factura de venta
  // ================================================================
  function generateVentaPDF(inv) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const PW = 215.9; const ML = 10; const MR = 10; const CW = PW - ML - MR;
    const GREEN = [34, 120, 56]; const GREEN_DARK = [20, 80, 35];
    const GREEN_LITE = [220, 245, 225]; const GRAY_LINE = [180, 180, 180];
    const BLACK = [30, 30, 30]; const WHITE = [255, 255, 255];

    const HDR_H = 42;
    doc.setFillColor(...GREEN); doc.roundedRect(ML, 8, 80, HDR_H, 3, 3, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(15); doc.setFont('helvetica', 'bold');
    doc.text(EMPRESA.nombre, ML + 4, 20, { maxWidth: 72 });
    doc.setFillColor(...GREEN_DARK); doc.rect(ML + 58, 10, 20, 16, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(12); doc.text('🏠', ML + 62, 21);
    doc.setDrawColor(...WHITE); doc.setLineWidth(0.4); doc.line(ML + 4, 27, ML + 76, 27);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
    doc.text(`correo: ${EMPRESA.correo}`,    ML + 4, 32);
    doc.text(EMPRESA.direccion,               ML + 4, 37, { maxWidth: 72 });
    doc.text(`telefono: ${EMPRESA.telefono}`, ML + 4, 43);
    doc.text(`RNC: ${EMPRESA.rnc}`,           ML + 4, 47);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 255, 180);
    doc.text(`contacto: ${EMPRESA.contacto}`, ML + 4, 52);

    const TX = ML + 90;
    doc.setTextColor(...BLACK); doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.text('Factura', TX, 18);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    let ry = 26;
    doc.text(`No. ${inv.id}`,         TX, ry); ry += 7;
    doc.text(`Fecha: ${inv.fecha}`,   TX, ry); ry += 7;
    doc.text(`Hora: ${inv.hora}`,     TX, ry); ry += 9;
    doc.text('RNC.',                  TX, ry); ry += 7;
    doc.text(`Cliente: ${inv.cliente}`, TX, ry); ry += 7;
    doc.text('Telefono:',             TX, ry); ry += 7;
    doc.text('Contacto:',             TX, ry); ry += 7;
    doc.text('Direccion:',            TX, ry);

    const itebisAmt = inv.total * EMPRESA.itebis;
    const totalRDS  = inv.total + itebisAmt;

    doc.autoTable({
      startY: 62,
      head: [['NO.', 'DESCRIPCION', 'CANT.', 'P. UNITARIO', 'SUB-TOTAL']],
      body: [
        ['A', `${inv.producto} (${inv.codigo})`, inv.cantidad, fmt(inv.precio), fmt(inv.total)],
        ...Array(3).fill(['', '', '', '', '']),
      ],
      foot: [
        ['', '', '', 'SUB-TOTAL', fmt(inv.total)],
        ['', '', '', `ITEBIS ${Math.round(EMPRESA.itebis*100)}%`, fmt(itebisAmt)],
        ['', '', '', 'TOTAL RDS', fmt(totalRDS)],
      ],
      headStyles: { fillColor: WHITE, textColor: BLACK, fontStyle: 'bold', fontSize: 9, lineColor: GRAY_LINE, lineWidth: 0.3 },
      bodyStyles: { fontSize: 9, textColor: BLACK, lineColor: GRAY_LINE, lineWidth: 0.2 },
      footStyles: { fillColor: WHITE, textColor: BLACK, fontStyle: 'bold', fontSize: 9, lineColor: GRAY_LINE, lineWidth: 0.2, halign: 'right' },
      alternateRowStyles: { fillColor: GREEN_LITE },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 2: { cellWidth: 18, halign: 'center' }, 3: { cellWidth: 32, halign: 'right' }, 4: { cellWidth: 32, halign: 'right' } },
      margin: { left: ML, right: MR }, tableWidth: CW,
      willDrawCell(data) { if (data.section === 'foot' && data.row.index === 2) doc.setFillColor(...GREEN_LITE); },
    });

    doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.setTextColor(150, 150, 150);
    doc.text('Gracias por su compra.', PW / 2, 265, { align: 'center' });
    doc.save(`Factura_${inv.id}_${inv.fecha.replace(/\//g, '-')}.pdf`);
  }

  // ================================================================
  // Excel: Factura de venta
  // ================================================================
  function generateVentaExcel(inv) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['FACTURA DE VENTA', '', '', '', ''], [],
      ['Empresa:', EMPRESA.nombre, '', 'Fecha:', inv.fecha],
      ['N° Factura:', inv.id, '', 'Hora:', inv.hora],
      ['Cliente:', inv.cliente, '', '', ''], [],
      ['NO.', 'DESCRIPCION', 'CANTIDAD', 'P. UNITARIO', 'SUB-TOTAL'],
      ['A', `${inv.producto} (${inv.codigo})`, inv.cantidad, inv.precio, inv.total], [],
      ['', '', '', 'SUB-TOTAL', inv.total],
      ['', '', '', `ITEBIS ${Math.round(EMPRESA.itebis*100)}%`, inv.total * EMPRESA.itebis],
      ['', '', '', 'TOTAL RDS', inv.total * (1 + EMPRESA.itebis)],
    ]);
    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Factura');
    XLSX.writeFile(wb, `Factura_${inv.id}_${inv.fecha.replace(/\//g, '-')}.xlsx`);
  }

  // ================================================================
  // Excel: Cotización
  // ================================================================
  function generateCotizacionExcel(header, items) {
    const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
    const itebis   = subtotal * EMPRESA.itebis;
    const total    = subtotal + itebis;
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['COTIZACIÓN', '', '', '', '', ''], [],
      ['No. Cotización:', header.numero, '', 'Fecha:', header.fecha, ''],
      ['Cliente:', header.cliente, '', 'Validez:', `${header.validez || 15} días`, ''],
      ['Teléfono:', header.telefono || '', '', 'Dirección:', header.direccion || 'Santo Domingo D.N.', ''], [],
      ['NO.', 'DESCRIPCION', 'AREA', 'UN', 'VALOR', 'SUB-TOTAL'],
      ...items.map((it, i) => [String.fromCharCode(65 + i), it.nombre, it.cant, it.unidad || 'M2', it.precio, it.subtotal]), [],
      ['', '', '', '', 'SUB-TOTAL', subtotal],
      ['', '', '', '', `ITEBIS ${Math.round(EMPRESA.itebis * 100)}%`, itebis],
      ['', '', '', '', 'TOTAL RDS', total],
    ];
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

  // Public API
  return {
    gen7DigitId,
    EMPRESA,
    fmt,
    showAlert, hideAlert,
    showModal, hideModal,
    resetForm,
    today, nowTime,
    generateVentaPDF, generateVentaExcel,
    generateCotizacionPDF, generateCotizacionExcel,
    generateResumenExcel,
    printVenta, printCotizacion,
  };
})();