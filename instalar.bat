@echo off
chcp 65001 >nul
title Consultorio - Instalacao
echo ============================================
echo   Sistema do Consultorio - Instalacao
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Tentando instalar automaticamente...
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  echo.
  echo Node.js instalado. FECHE esta janela e execute instalar.bat DE NOVO.
  pause
  exit /b
)

echo Node.js encontrado. Instalando dependencias do sistema...
echo (isso pode levar alguns minutos na primeira vez)
echo.
call npm install
if errorlevel 1 (
  echo.
  echo ERRO na instalacao. Verifique sua conexao com a internet e tente de novo.
  pause
  exit /b
)

echo.
echo ============================================
echo   Instalacao concluida com sucesso!
echo   Use o arquivo INICIAR.bat para abrir o sistema.
echo ============================================
pause
