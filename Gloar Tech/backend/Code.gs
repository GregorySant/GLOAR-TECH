// ================================================================
//  INVENTARIO — Google Apps Script Backend
//  backend/Code.gs
//
//  Pega este código en tu proyecto de Google Apps Script.
//  Reemplaza SPREADSHEET_ID con el ID de tu Google Sheet.
// ================================================================

const SPREADSHEET_ID   = "1K_HDcKJZTXpLH0jmzZt5G8lEYZYtqwQGCfNDkmgVCQc";

// Nombres de hojas
const HOJA_CATEGORIAS  = "Categorias";
const HOJA_PRODUCTOS   = "Productos";
const HOJA_COMPRAS     = "Compras";
const HOJA_VENTAS      = "Ventas";
const HOJA_RESUMEN     = "resumen_diario";

// Encabezados por hoja
const HEADERS = {
  categorias : ["id", "nombre"],
  productos  : ["id", "nombre", "código", "categoría", "precio_compra", "precio_venta", "stock", "fecha_creado"],
  compras    : ["id", "producto_id", "cantidad", "precio_compra", "fecha", "proveedor"],
  ventas     : ["id", "producto_id", "cantidad", "precio_venta",  "fecha", "cliente"],
  resumen    : ["fecha", "total_ventas", "total_compras", "ganancia", "productos_vendidos"]
};

// ----------------------------------------------------------------
//  UTILIDADES
// ----------------------------------------------------------------

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Genera un ID numérico de exactamente 7 dígitos, único dentro de la hoja dada.
 * Rango: 1 000 000 – 9 999 999
 */
function generate7DigitId(sheet) {
  const usedIds = new Set();

  if (sheet && sheet.getLastRow() >= 2) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    ids.forEach(r => usedIds.add(String(r[0])));
  }

  let id;
  let attempts = 0;
  do {
    id = String(Math.floor(1000000 + Math.random() * 9000000));
    attempts++;
    if (attempts > 1000) throw new Error("No se pudo generar un ID único.");
  } while (usedIds.has(id));

  return id;
}

// ----------------------------------------------------------------
//  ENTRADA GET
// ----------------------------------------------------------------
function doGet(e) {
  const action    = e.parameter.action;
  const query     = e.parameter.query;
  const sheetName = e.parameter.sheetName;
  let result;

  try {
    switch (action) {
      case "iniciar":         result = iniciarBaseDeDatos();       break;
      case "resetear":        result = resetearBaseDeDatos();      break;
      case "getCategorias":   result = getCategorias();            break;
      case "buscarProducto":  result = buscarProducto(query);      break;
      case "getInventario":   result = getInventario();            break;
      case "getResumenDiario":result = getResumenDiario();         break;
      case "getData":
        if (sheetName) result = getData(sheetName);
        else result = { status: "error", message: "Falta parámetro sheetName." };
        break;
      default:
        result = { status: "error", message: `Acción GET '${action}' no reconocida.` };
    }
  } catch (err) {
    result = { status: "error", message: "Error en doGet: " + err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------
//  ENTRADA POST
// ----------------------------------------------------------------
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonResponse({ status: "error", message: "Sin datos POST." });
    }

    const req    = JSON.parse(e.postData.contents);
    const action = req.action;
    let result;

    switch (action) {
      case "agregarCategoria":    result = agregarCategoria(req);    break;
      case "agregarProducto":     result = agregarProducto(req);     break;
      case "editarProducto":      result = editarProducto(req);      break;
      case "eliminarProducto":    result = eliminarProducto(req);    break;
      case "registrarTransaccion":result = registrarTransaccion(req);break;
      default:
        result = { status: "error", message: `Acción POST '${action}' no reconocida.` };
    }

    return jsonResponse(result);

  } catch (err) {
    return jsonResponse({ status: "error", message: "Error en doPost: " + err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------
//  CATEGORÍAS
// ----------------------------------------------------------------
function getCategorias() {
  return getData(HOJA_CATEGORIAS);
}

function agregarCategoria(data) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_CATEGORIAS);
  if (!sheet) return sheetNotFound(HOJA_CATEGORIAS);

  const newId = generate7DigitId(sheet);
  sheet.appendRow([newId, data.nombre]);
  return { status: "success", message: `Categoría '${data.nombre}' agregada (ID: ${newId}).`, id: newId };
}

// ----------------------------------------------------------------
//  PRODUCTOS
// ----------------------------------------------------------------
function getInventario() {
  return getData(HOJA_PRODUCTOS);
}

function buscarProducto(query) {
  const result = getData(HOJA_PRODUCTOS);
  if (result.status !== "success") return result;

  const q = String(query || "").toLowerCase().trim();
  if (!q) return { status: "warning", message: "Especifique un ID, Código o Nombre." };

  const found = result.data.filter(p =>
    String(p.id       || "").toLowerCase().includes(q) ||
    String(p["código"]|| "").toLowerCase().includes(q) ||
    String(p.nombre   || "").toLowerCase().includes(q)
  );

  return found.length > 0
    ? { status: "success", data: found, message: found.length + " resultado(s)." }
    : { status: "warning", message: "Producto no encontrado." };
}

function agregarProducto(data) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_PRODUCTOS);
  if (!sheet) return sheetNotFound(HOJA_PRODUCTOS);

  // Si el frontend envió un ID de 7 dígitos, usarlo; si no, generar uno
  let newId = String(data.id || "").trim();
  if (!/^\d{7}$/.test(newId)) {
    newId = generate7DigitId(sheet);
  } else {
    // Verificar que no exista ya
    const existing = getData(HOJA_PRODUCTOS);
    if (existing.status === "success" && existing.data.some(p => String(p.id) === newId)) {
      newId = generate7DigitId(sheet);
    }
  }

  sheet.appendRow([
    newId,
    data.nombre,
    data.codigo,
    data.categoria,
    parseFloat(data.precio_compra),
    parseFloat(data.precio_venta),
    parseInt(data.stock),
    new Date()
  ]);

  return { status: "success", message: `Producto '${data.nombre}' registrado. ID: ${newId}`, id: newId };
}

function editarProducto(data) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_PRODUCTOS);
  if (!sheet) return sheetNotFound(HOJA_PRODUCTOS);

  const { rowIndex } = findProductRow(sheet, data.id);
  if (rowIndex === -1) return { status: "error", message: `Producto ID ${data.id} no encontrado.` };

  // rowIndex es base-0 desde fila 1 (encabezado). La fila real en Sheets = rowIndex + 1 (encabezado) + 1 = rowIndex + 2
  // Pero findProductRow ya devuelve el índice en el array (0 = encabezado, 1 = primera fila de datos)
  // La fila real en Sheets = rowIndex + 1
  const sheetRow = rowIndex + 1;

  sheet.getRange(sheetRow, 2).setValue(data.nombre);
  sheet.getRange(sheetRow, 3).setValue(data.codigo);
  sheet.getRange(sheetRow, 4).setValue(data.categoria);
  sheet.getRange(sheetRow, 5).setValue(parseFloat(data.precio_compra));
  sheet.getRange(sheetRow, 6).setValue(parseFloat(data.precio_venta));
  sheet.getRange(sheetRow, 7).setValue(parseInt(data.stock));

  return { status: "success", message: `Producto '${data.nombre}' actualizado correctamente.`, id: data.id };
}

function eliminarProducto(data) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_PRODUCTOS);
  if (!sheet) return sheetNotFound(HOJA_PRODUCTOS);

  const { rowData, rowIndex } = findProductRow(sheet, data.id);
  if (rowIndex === -1) return { status: "error", message: `Producto ID ${data.id} no encontrado.` };

  const nombre   = rowData ? rowData[1] : data.id;
  const sheetRow = rowIndex + 1;  // +1 porque rowIndex 1 = fila 2 de Sheets (fila 1 es encabezado)

  sheet.deleteRow(sheetRow);

  return { status: "success", message: `Producto '${nombre}' eliminado del inventario.`, id: data.id };
}

// ----------------------------------------------------------------
//  TRANSACCIONES (compras / ventas)
// ----------------------------------------------------------------
function registrarTransaccion(data) {
  const ss             = getSpreadsheet();
  const isCompra       = data.type === "compra";
  const sheetTx        = ss.getSheetByName(isCompra ? HOJA_COMPRAS : HOJA_VENTAS);
  const sheetProductos = ss.getSheetByName(HOJA_PRODUCTOS);

  if (!sheetTx || !sheetProductos) {
    return { status: "error", message: "Pestañas necesarias no existen. Inicie la Base de Datos." };
  }

  const { rowData, rowIndex } = findProductRow(sheetProductos, data.producto_id);
  if (rowIndex === -1) {
    return { status: "error", message: `Producto ID ${data.producto_id} no encontrado.` };
  }

  const cantidad  = parseInt(data.cantidad);
  const precio    = parseFloat(data.precio);
  const stockActual = parseFloat(rowData[6]) || 0;

  if (!isCompra && stockActual < cantidad) {
    return {
      status: "warning",
      message: `Stock insuficiente. Disponible: ${stockActual}, solicitado: ${cantidad}.`
    };
  }

  const nuevoStock = isCompra ? stockActual + cantidad : stockActual - cantidad;
  const txId       = generate7DigitId(sheetTx);

  // Registrar transacción
  sheetTx.appendRow([txId, data.producto_id, cantidad, precio, new Date(), data.extra_data || ""]);

  // Actualizar stock
  const sheetRow = rowIndex + 1;
  sheetProductos.getRange(sheetRow, 7).setValue(nuevoStock);

  // Actualizar precio si cambió
  const precioCol = isCompra ? 5 : 6;
  if (precio !== parseFloat(rowData[precioCol - 1])) {
    sheetProductos.getRange(sheetRow, precioCol).setValue(precio);
  }

  return {
    status: "success",
    message: `${isCompra ? "Compra" : "Venta"} registrada. Stock actualizado: ${nuevoStock} uds.`,
    id: txId
  };
}

// ----------------------------------------------------------------
//  RESUMEN DIARIO
// ----------------------------------------------------------------
function getResumenDiario() {
  return getData(HOJA_RESUMEN);
}

// ----------------------------------------------------------------
//  UTILIDADES DE DATOS
// ----------------------------------------------------------------
function getData(sheetName) {
  const ss    = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet || sheet.getLastRow() < 2) {
    return { status: "error", message: `Pestaña '${sheetName}' vacía o no existe.` };
  }

  const raw     = sheet.getDataRange().getValues();
  const headers = raw[0];
  const rows    = raw.slice(1);

  const mapped = rows.map(row => {
    const entry = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if (v === "" || v === null || v === undefined) v = "";
      entry[h] = v;
    });
    return entry;
  }).filter(entry => Object.values(entry).some(v => v !== ""));

  return { status: "success", data: mapped };
}

/**
 * Busca un producto por ID.
 * Devuelve { rowData: Array, rowIndex: number } donde rowIndex es 1-based dentro
 * del array de datos crudos (índice 0 = encabezado, índice 1 = primera fila de datos).
 * La fila real en Google Sheets = rowIndex + 1.
 */
function findProductRow(sheet, productoId) {
  if (!sheet || sheet.getLastRow() < 2) return { rowData: null, rowIndex: -1 };

  const raw      = sheet.getDataRange().getValues();
  const searchId = String(productoId || "").trim();

  for (let i = 1; i < raw.length; i++) {
    if (String(raw[i][0] || "").trim() === searchId) {
      return { rowData: raw[i], rowIndex: i };
    }
  }
  return { rowData: null, rowIndex: -1 };
}

function sheetNotFound(name) {
  return { status: "error", message: `La pestaña '${name}' no existe. Inicie la Base de Datos.` };
}

// ----------------------------------------------------------------
//  CONFIGURACIÓN DE BASE DE DATOS
// ----------------------------------------------------------------
function createOrResetSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  const action = sheet ? "verificada" : "creada";
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return `'${name}' ${action}.`;
}

function iniciarBaseDeDatos() {
  const ss  = getSpreadsheet();
  const msg = [
    createOrResetSheet(ss, HOJA_CATEGORIAS, HEADERS.categorias),
    createOrResetSheet(ss, HOJA_PRODUCTOS,  HEADERS.productos),
    createOrResetSheet(ss, HOJA_COMPRAS,    HEADERS.compras),
    createOrResetSheet(ss, HOJA_VENTAS,     HEADERS.ventas),
    createOrResetSheet(ss, HOJA_RESUMEN,    HEADERS.resumen)
  ];
  return { status: "success", message: "Base de datos inicializada: " + msg.join(" ") };
}

function resetearBaseDeDatos() {
  const ss = getSpreadsheet();
  ss.getSheets().forEach(s => {
    if (s.getName() !== "Hoja 1") ss.deleteSheet(s);
  });
  return iniciarBaseDeDatos();
}
