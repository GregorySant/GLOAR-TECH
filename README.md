# GLOAR TECH — Instrucciones de Uso

## Estructura del proyecto

```
GLOAR-TECH/
├── index.html              ← Abrir esto en el navegador
├── sw.js                   ← Service Worker (PWA) ← NUEVO
├── pages/login.html
├── src/
│   ├── js/
│   │   ├── config.js
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── ui.js
│   │   ├── auth.js
│   │   ├── store.js
│   │   └── utils.js
│   └── styles/
├── image/
│   └── site.webmanifest    ← Manifiesto PWA (actualizado)
└── backend-local/
    ├── server.js
    ├── package.json
    └── gloartech.db        ← Base de datos (se crea sola)
```

---

## Instalación como PWA en Windows (Chrome o Edge)

### Paso 1 — Iniciar el servidor
```bash
cd backend-local
npm install   # solo la primera vez
npm start
```

### Paso 2 — Abrir en el navegador
Abre Chrome o Edge y ve a:
```
http://localhost:3000
```
> ⚠️ El servidor debe estar corriendo para instalar la PWA.
> Configura el inicio automático con INSTALAR-GLOAR-TECH.bat

### Paso 3 — Instalar como app
- **Chrome:** clic en el ícono ⊕ en la barra de direcciones → "Instalar GLOAR TECH"
- **Edge:** clic en `···` → Aplicaciones → Instalar este sitio como aplicación

La app aparecerá en el **escritorio y el menú Inicio** como cualquier programa.

---

## Inicio automático del servidor

Ejecuta **INSTALAR-GLOAR-TECH.bat** una sola vez.  
El servidor arrancará solo cada vez que enciendas la PC.

---

## Credenciales por defecto

| Rol           | Contraseña    |
|---------------|---------------|
| Administrador | `admin123`    |
| Usuario       | `usuario123`  |

---

## Backup

Tu base de datos está en `backend-local/gloartech.db`.  
Copia ese archivo para hacer backup.
