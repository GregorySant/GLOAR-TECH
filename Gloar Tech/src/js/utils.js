/* ============================================================
   utils.js  —  Helpers compartidos
   ============================================================ */

const Utils = (() => {

  // ---- IDs ----
  /** Genera un ID numérico de 7 dígitos (client-side, para mostrar antes de guardar) */
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
  function resetForm(formId) {
    document.getElementById(formId)?.reset();
  }

  // ---- Fechas ----
  function today() {
    return new Date().toLocaleDateString('es-DO');
  }
  function nowTime() {
    return new Date().toLocaleTimeString('es-DO');
  }

  // ---- PDF: Factura de venta (1 producto) ----
  function generateVentaPDF(inv) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(9, 25, 51);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('FACTURA DE VENTA', 14, 14);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Inventario', 14, 22);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 196, 18, { align: 'right' });

    // Info
    doc.setTextColor(60, 60, 60); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${inv.fecha}`, 14, 42);
    doc.text(`Hora: ${inv.hora}`,   14, 49);
    doc.text(`N° Transacción: ${inv.id}`, 14, 56);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${inv.cliente}`, 14, 63);

    // Tabla
    doc.autoTable({
      startY: 72,
      head: [['Producto', 'Código', 'Categoría', 'Cant.', 'P. Unitario', 'Total']],
      body: [[inv.producto, inv.codigo, inv.categoria, inv.cantidad,
              `$${inv.precio.toFixed(2)}`, `$${inv.total.toFixed(2)}`]],
      headStyles: { fillColor: [5, 93, 226], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [240, 247, 255] },
    });

    const fy = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(232, 242, 252); doc.rect(120, fy, 76, 12, 'F');
    doc.setFont('helvetica', 'bold'); doc.setTextColor(9, 25, 51); doc.setFontSize(11);
    doc.text('TOTAL A PAGAR:', 125, fy + 8);
    doc.setTextColor(5, 93, 226);
    doc.text(`$${inv.total.toFixed(2)}`, 195, fy + 8, { align: 'right' });

    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text('Gracias por su compra.', 105, 285, { align: 'center' });

    doc.save(`Factura_${inv.id}_${inv.fecha.replace(/\//g, '-')}.pdf`);
  }

  // ---- Excel: Factura de venta ----
  function generateVentaExcel(inv) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['FACTURA DE VENTA', '', '', '', '', ''], [],
      ['Empresa:', 'Sistema de Inventario', '', 'Fecha:', inv.fecha, ''],
      ['N° Transacción:', inv.id, '', 'Hora:', inv.hora, ''],
      ['Cliente:', inv.cliente, '', '', '', ''], [],
      ['PRODUCTO', 'CÓDIGO', 'CATEGORÍA', 'CANTIDAD', 'P. UNITARIO', 'TOTAL'],
      [inv.producto, inv.codigo, inv.categoria, inv.cantidad, inv.precio, inv.total], [],
      ['', '', '', '', 'TOTAL:', inv.total],
    ]);
    ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Factura');
    XLSX.writeFile(wb, `Factura_${inv.id}_${inv.fecha.replace(/\//g, '-')}.xlsx`);
  }

  // ---- PDF: Cotización ----
  function generateCotizacionPDF(header, items) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(9, 25, 51); doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN', 14, 14);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Inventario', 14, 22);
    doc.setFontSize(9);
    doc.text(`N° ${header.numero}`, 196, 10, { align: 'right' });
    doc.text(`Fecha: ${header.fecha}`, 196, 18, { align: 'right' });
    doc.text(`Válida por: ${header.validez} días`, 196, 26, { align: 'right' });

    doc.setTextColor(60, 60, 60); doc.setFontSize(10);
    doc.setFont('helvetica', 'bold'); doc.text('DATOS DEL CLIENTE', 14, 42);
    doc.setFont('helvetica', 'normal'); doc.text(`Nombre: ${header.cliente}`, 14, 50);
    let y = 50;
    if (header.email)    { y += 7; doc.text(`Email: ${header.email}`, 14, y); }
    if (header.telefono) { y += 7; doc.text(`Teléfono: ${header.telefono}`, 14, y); }

    doc.autoTable({
      startY: y + 12,
      head: [['#', 'Producto', 'Código', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: items.map((it, i) => [i + 1, it.nombre, it.codigo, it.cant,
             `$${it.precio.toFixed(2)}`, `$${it.subtotal.toFixed(2)}`]),
      headStyles: { fillColor: [5, 93, 226], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [240, 247, 255] },
      columnStyles: { 0: { cellWidth: 10 }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    });

    const fy = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(232, 242, 252); doc.rect(120, fy, 76, 12, 'F');
    doc.setFont('helvetica', 'bold'); doc.setTextColor(9, 25, 51); doc.setFontSize(11);
    doc.text('TOTAL:', 125, fy + 8);
    doc.setTextColor(5, 93, 226);
    doc.text(`$${header.total.toFixed(2)}`, 195, fy + 8, { align: 'right' });

    if (header.notas) {
      const ny = fy + 22;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(60, 60, 60);
      doc.text('Notas:', 14, ny);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(header.notas, 182), 14, ny + 6);
    }

    doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text('Esta cotización es válida por el período indicado.', 105, 285, { align: 'center' });
    doc.save(`Cotizacion_${header.numero}_${header.fecha.replace(/\//g, '-')}.pdf`);
  }

  // ---- Excel: Cotización ----
  function generateCotizacionExcel(header, items) {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['COTIZACIÓN', '', '', '', '', ''], [],
      ['N° Cotización:', header.numero, '', 'Fecha:', header.fecha, ''],
      ['Cliente:', header.cliente, '', 'Email:', header.email || '', ''],
      ['Teléfono:', header.telefono || '', '', 'Válida por:', `${header.validez} días`, ''], [],
      ['#', 'PRODUCTO', 'CÓDIGO', 'CANTIDAD', 'P. UNITARIO', 'SUBTOTAL'],
      ...items.map((it, i) => [i + 1, it.nombre, it.codigo, it.cant, it.precio, it.subtotal]), [],
      ['', '', '', '', 'TOTAL:', header.total],
    ];
    if (header.notas) { wsData.push([]); wsData.push(['Notas:', header.notas]); }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Cotización');
    XLSX.writeFile(wb, `Cotizacion_${header.numero}_${header.fecha.replace(/\//g, '-')}.xlsx`);
  }

  // ---- Excel: Resumen ----
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
    gen7DigitId,
    showAlert, hideAlert,
    showModal, hideModal,
    resetForm,
    today, nowTime,
    generateVentaPDF, generateVentaExcel,
    generateCotizacionPDF, generateCotizacionExcel,
    generateResumenExcel,
  };
})();
