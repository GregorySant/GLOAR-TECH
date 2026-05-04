// ================================================================
//  GLOAR TECH — Backend Local (Node.js + sql.js)
//  Sin compilación — funciona en cualquier PC con Node.js
// ================================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const initSqlJs = require('sql.js');

const app    = express();
const PORT   = 3000;
const DB_PATH = path.join(__dirname, 'gloartech.db');

app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// ── Frontend path (se sirve DESPUÉS de las rutas API) ────────────
const FRONTEND_PATH = path.join(__dirname, '..');

// ── Base de Datos ────────────────────────────────────────────────
let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📂  Base de datos cargada: gloartech.db');
  } else {
    db = new SQL.Database();
    console.log('🆕  Base de datos nueva creada: gloartech.db');
  }

  iniciarBaseDeDatos();
  saveDB(); // guardar estructura inicial
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(sql, params = []) {
  const stmt   = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

// ── Utilidades ───────────────────────────────────────────────────
function generate7DigitId(table) {
  let id, exists;
  let attempts = 0;
  do {
    id = String(Math.floor(1000000 + Math.random() * 9000000));
    exists = get(`SELECT 1 FROM ${table} WHERE id = ?`, [id]);
    if (++attempts > 1000) throw new Error('No se pudo generar ID único.');
  } while (exists);
  return id;
}

// ── Crear tablas ─────────────────────────────────────────────────
function iniciarBaseDeDatos() {
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY, nombre TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY, nombre TEXT NOT NULL, codigo TEXT,
      categoria TEXT, precio_compra REAL DEFAULT 0,
      precio_venta REAL DEFAULT 0, stock INTEGER DEFAULT 0,
      fecha_creado TEXT
    );
    CREATE TABLE IF NOT EXISTS compras (
      id TEXT PRIMARY KEY, producto_id TEXT, cantidad INTEGER,
      precio_compra REAL, fecha TEXT, proveedor TEXT
    );
    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY, producto_id TEXT, cantidad INTEGER,
      precio_venta REAL, fecha TEXT, cliente TEXT, con_itbis INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS resumen_diario (
      fecha TEXT PRIMARY KEY, total_ventas REAL DEFAULT 0,
      total_compras REAL DEFAULT 0, ganancia REAL DEFAULT 0,
      productos_vendidos INTEGER DEFAULT 0
    );
  `);
  return { status: 'success', message: 'Base de datos inicializada correctamente.' };
}

function resetearBaseDeDatos() {
  db.run(`
    DROP TABLE IF EXISTS categorias;
    DROP TABLE IF EXISTS productos;
    DROP TABLE IF EXISTS compras;
    DROP TABLE IF EXISTS ventas;
    DROP TABLE IF EXISTS resumen_diario;
  `);
  saveDB();
  return iniciarBaseDeDatos();
}

// ── Categorías ───────────────────────────────────────────────────
function getCategorias() {
  return { status: 'success', data: all('SELECT * FROM categorias') };
}

function agregarCategoria(data) {
  const id = generate7DigitId('categorias');
  run('INSERT INTO categorias (id, nombre) VALUES (?, ?)', [id, data.nombre]);
  return { status: 'success', message: `Categoría '${data.nombre}' agregada (ID: ${id}).`, id };
}

function eliminarCategoria(data) {
  const cat = get('SELECT nombre FROM categorias WHERE id=?', [data.id]);
  if (!cat) return { status: 'error', message: `Categoría ID ${data.id} no encontrada.` };
  run('DELETE FROM categorias WHERE id=?', [data.id]);
  return { status: 'success', message: `Categoría '${cat.nombre}' eliminada.` };
}

// ── Productos ────────────────────────────────────────────────────
function mapProducto(r) {
  return {
    id: r.id, nombre: r.nombre,
    'código':    r.codigo,
    'categoría': r.categoria,
    precio_compra: r.precio_compra,
    precio_venta:  r.precio_venta,
    stock:         r.stock,
    fecha_creado:  r.fecha_creado,
  };
}

function getInventario() {
  return { status: 'success', data: all('SELECT * FROM productos').map(mapProducto) };
}

function buscarProducto(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return { status: 'warning', message: 'Especifique un ID, Código o Nombre.' };

  const rows = all(
    `SELECT * FROM productos
     WHERE lower(id) LIKE ? OR lower(codigo) LIKE ? OR lower(nombre) LIKE ?`,
    [`%${q}%`, `%${q}%`, `%${q}%`]
  ).map(mapProducto);

  return rows.length > 0
    ? { status: 'success', data: rows, message: `${rows.length} resultado(s).` }
    : { status: 'warning', message: 'Producto no encontrado.' };
}

function agregarProducto(data) {
  let id = String(data.id || '').trim();
  if (!/^\d{7}$/.test(id) || get('SELECT 1 FROM productos WHERE id=?', [id])) {
    id = generate7DigitId('productos');
  }
  run(
    `INSERT INTO productos (id,nombre,codigo,categoria,precio_compra,precio_venta,stock,fecha_creado)
     VALUES (?,?,?,?,?,?,?,?)`,
    [id, data.nombre, data.codigo||'', data.categoria||'',
     parseFloat(data.precio_compra)||0, parseFloat(data.precio_venta)||0,
     parseInt(data.stock)||0, new Date().toISOString()]
  );
  return { status: 'success', message: `Producto '${data.nombre}' registrado. ID: ${id}`, id };
}

function editarProducto(data) {
  if (!get('SELECT 1 FROM productos WHERE id=?', [data.id]))
    return { status: 'error', message: `Producto ID ${data.id} no encontrado.` };

  run(
    `UPDATE productos SET nombre=?,codigo=?,categoria=?,
     precio_compra=?,precio_venta=?,stock=? WHERE id=?`,
    [data.nombre, data.codigo||'', data.categoria||'',
     parseFloat(data.precio_compra)||0, parseFloat(data.precio_venta)||0,
     parseInt(data.stock)||0, data.id]
  );
  return { status: 'success', message: `Producto '${data.nombre}' actualizado.`, id: data.id };
}

function eliminarProducto(data) {
  const prod = get('SELECT nombre FROM productos WHERE id=?', [data.id]);
  if (!prod) return { status: 'error', message: `Producto ID ${data.id} no encontrado.` };

  run('DELETE FROM productos WHERE id=?', [data.id]);
  return { status: 'success', message: `Producto '${prod.nombre}' eliminado.`, id: data.id };
}

// ── Transacciones ────────────────────────────────────────────────
function registrarTransaccion(data) {
  const isCompra = data.type === 'compra';
  const prod     = get('SELECT * FROM productos WHERE id=?', [data.producto_id]);
  if (!prod) return { status: 'error', message: `Producto ID ${data.producto_id} no encontrado.` };

  const cantidad    = parseInt(data.cantidad);
  const precio      = parseFloat(data.precio);
  const stockActual = prod.stock || 0;

  if (!isCompra && stockActual < cantidad) {
    return { status: 'warning', message: `Stock insuficiente. Disponible: ${stockActual}, solicitado: ${cantidad}.` };
  }

  const nuevoStock = isCompra ? stockActual + cantidad : stockActual - cantidad;
  const fecha      = new Date().toISOString();

  if (isCompra) {
    const txId = generate7DigitId('compras');
    run(
      'INSERT INTO compras (id,producto_id,cantidad,precio_compra,fecha,proveedor) VALUES (?,?,?,?,?,?)',
      [txId, data.producto_id, cantidad, precio, fecha, data.extra_data||'']
    );
    run('UPDATE productos SET stock=?, precio_compra=? WHERE id=?',
      [nuevoStock, precio !== prod.precio_compra ? precio : prod.precio_compra, data.producto_id]);
  } else {
    const txId     = generate7DigitId('ventas');
    const conItbis = data.con_itbis === true || data.con_itbis === 'true' ? 1 : 0;
    run(
      'INSERT INTO ventas (id,producto_id,cantidad,precio_venta,fecha,cliente,con_itbis) VALUES (?,?,?,?,?,?,?)',
      [txId, data.producto_id, cantidad, precio, fecha, data.extra_data||'', conItbis]
    );
    run('UPDATE productos SET stock=?, precio_venta=? WHERE id=?',
      [nuevoStock, precio !== prod.precio_venta ? precio : prod.precio_venta, data.producto_id]);
  }

  actualizarResumenDiario(isCompra, precio * cantidad);

  return {
    status: 'success',
    message: `${isCompra ? 'Compra' : 'Venta'} registrada. Stock actualizado: ${nuevoStock} uds.`
  };
}

function actualizarResumenDiario(isCompra, monto) {
  const hoy    = new Date().toISOString().slice(0, 10);
  const existe = get('SELECT * FROM resumen_diario WHERE fecha=?', [hoy]);

  if (!existe) {
    run(
      `INSERT INTO resumen_diario (fecha,total_ventas,total_compras,ganancia,productos_vendidos)
       VALUES (?,?,?,?,?)`,
      [hoy, isCompra ? 0 : monto, isCompra ? monto : 0,
       isCompra ? -monto : monto, isCompra ? 0 : 1]
    );
  } else if (isCompra) {
    run(`UPDATE resumen_diario SET total_compras=total_compras+?, ganancia=ganancia-? WHERE fecha=?`,
      [monto, monto, hoy]);
  } else {
    run(`UPDATE resumen_diario SET total_ventas=total_ventas+?, ganancia=ganancia+?,
         productos_vendidos=productos_vendidos+1 WHERE fecha=?`,
      [monto, monto, hoy]);
  }
}

function getResumenDiario() {
  return { status: 'success', data: all('SELECT * FROM resumen_diario ORDER BY fecha DESC') };
}

function getData(sheetName) {
  const map = {
  'Categorias': 'categorias', 'CATEGORIAS': 'categorias',
  'Productos': 'productos', 'PRODUCTOS': 'productos',
  'Compras': 'compras', 'COMPRAS': 'compras',
  'Ventas': 'ventas', 'VENTAS': 'ventas',
  'resumen_diario': 'resumen_diario'
};

  const table = map[sheetName];
  if (!table) return { status: 'error', message: `Tabla '${sheetName}' no reconocida.` };
  return { status: 'success', data: all(`SELECT * FROM ${table}`) };
}

// ── Rutas API ─────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  const { action, query, sheetName } = req.query;
  let result;
  try {
    switch (action) {
      case 'iniciar':          result = iniciarBaseDeDatos(); saveDB(); break;
      case 'resetear':         result = resetearBaseDeDatos(); break;
      case 'getCategorias':    result = getCategorias();       break;
      case 'buscarProducto':   result = buscarProducto(query); break;
      case 'getInventario':    result = getInventario();       break;
      case 'getResumenDiario': result = getResumenDiario();    break;
      case 'getData':
        result = sheetName ? getData(sheetName)
          : { status: 'error', message: 'Falta parámetro sheetName.' };
        break;
      default:
        result = { status: 'error', message: `Acción '${action}' no reconocida.` };
    }
  } catch (err) {
    result = { status: 'error', message: 'Error: ' + err.message };
  }
  res.json(result);
});

app.post('/api', (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    let result;
    switch (body.action) {
      case 'agregarCategoria':     result = agregarCategoria(body);     break;
      case 'eliminarCategoria':    result = eliminarCategoria(body);    break;
      case 'agregarProducto':      result = agregarProducto(body);      break;
      case 'editarProducto':       result = editarProducto(body);       break;
      case 'eliminarProducto':     result = eliminarProducto(body);     break;
      case 'registrarTransaccion': result = registrarTransaccion(body); break;
      default:
        result = { status: 'error', message: `Acción '${body.action}' no reconocida.` };
    }
    res.json(result);
  } catch (err) {
    res.json({ status: 'error', message: 'Error: ' + err.message });
  }
});

// ── Servir archivos estáticos (DESPUÉS de las rutas API) ─────────
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(FRONTEND_PATH, 'sw.js'));
});
app.use(express.static(FRONTEND_PATH));

// ── Arrancar ─────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀  GLOAR TECH corriendo en http://localhost:${PORT}`);
    console.log(`📦  Base de datos: gloartech.db\n`);
  });
});
