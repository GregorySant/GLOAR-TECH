@echo off
title GLOAR TECH - Detener Servidor
color 0C
echo Deteniendo el servidor de GLOAR TECH...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq GLOAR TECH Servidor" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq GLOAR TECH Servidor" >nul 2>&1
echo Hecho. El servidor fue detenido.
echo (Se volvera a iniciar la proxima vez que enciendas la PC)
pause
