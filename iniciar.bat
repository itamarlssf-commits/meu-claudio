@echo off
chcp 65001 >nul
title Consultorio - Sistema
echo ============================================
echo   Iniciando o Sistema do Consultorio...
echo   O navegador abrira sozinho em instantes.
echo   NAO FECHE esta janela enquanto usa o sistema.
echo ============================================
start /b cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
pause
