@echo off
title GLOAR TECH - Instalador
color 0A
echo ============================================
echo   GLOAR TECH - Instalacion Automatica
echo ============================================
echo.

:: Verificar que Node.js este instalado
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    echo.
    echo Descargalo desde: https://nodejs.org
    echo Instala la version LTS, luego vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado: 
node -v
echo.

:: Instalar dependencias del backend
echo [1/3] Instalando dependencias del servidor...
cd /d "%~dp0backend-local"
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.
echo.

:: Crear el script VBS que inicia el servidor sin mostrar ventana negra
echo [2/3] Configurando inicio automatico con Windows...
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SCRIPT_DIR=%~dp0backend-local
set VBS_PATH=%STARTUP_FOLDER%\GLOAR-TECH-servidor.vbs

echo Set oShell = CreateObject("WScript.Shell") > "%VBS_PATH%"
echo oShell.Run "cmd /c cd /d ""%SCRIPT_DIR%"" && node server.js", 0, False >> "%VBS_PATH%"

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo crear el acceso directo de inicio automatico.
    pause
    exit /b 1
)
echo [OK] Inicio automatico configurado.
echo.

:: Iniciar el servidor ahora mismo (primera vez)
echo [3/3] Iniciando el servidor por primera vez...
start "GLOAR TECH Servidor" /min cmd /c "cd /d "%~dp0backend-local" && node server.js"
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ============================================
echo   Instalacion completada con exito!
echo ============================================
echo.
echo  El servidor ya esta corriendo en:
echo  http://localhost:3000
echo.
echo  Cada vez que enciendas la PC, el servidor
echo  se iniciara AUTOMATICAMENTE en segundo plano.
echo.
echo  Para usar la app, abre el archivo:
echo  index.html en tu navegador.
echo.
echo  Credenciales por defecto:
echo    Admin:   admin123
echo    Usuario: usuario123
echo.
pause
