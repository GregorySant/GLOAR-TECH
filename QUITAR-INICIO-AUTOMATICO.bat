@echo off
title GLOAR TECH - Quitar inicio automatico
color 0E
echo ¿Seguro que deseas quitar el inicio automatico del servidor?
echo (La app no funcionara hasta que lo vuelvas a iniciar manualmente)
echo.
pause

set VBS_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\GLOAR-TECH-servidor.vbs

IF EXIST "%VBS_PATH%" (
    del "%VBS_PATH%"
    echo [OK] Inicio automatico eliminado.
) ELSE (
    echo [INFO] El inicio automatico no estaba configurado.
)

:: Detener servidor si esta corriendo
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Para volver a activarlo, ejecuta INSTALAR-GLOAR-TECH.bat
pause
