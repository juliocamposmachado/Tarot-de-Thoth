@echo off
REM ============================================
REM  Tarot de Thoth - Instalador do Protocolo (Windows)
REM  Registra tarot-bridge:// no Registro do Windows
REM ============================================

set SCRIPT_DIR=%~dp0
set HANDLER=%SCRIPT_DIR%handle-protocol.bat

REM Register the protocol in Windows Registry
reg add "HKCU\Software\Classes\tarot-bridge" /ve /d "URL:Tarot de Thoth Bridge" /f >nul 2>nul
reg add "HKCU\Software\Classes\tarot-bridge" /v "URL Protocol" /d "" /f >nul 2>nul
reg add "HKCU\Software\Classes\tarot-bridge\DefaultIcon" /ve /d "shell32.dll,0" /f >nul 2>nul
reg add "HKCU\Software\Classes\tarot-bridge\shell\open\command" /ve /d "\"%HANDLER%\" \"%%1\"" /f >nul 2>nul

echo ============================================
echo  Protocolo tarot-bridge:// registrado!
echo ============================================
echo.
echo  Agora o site pode iniciar a ponte automaticamente.
echo  Quando voce clicar em 'Iniciar Ponte', o navegador
echo  pedira confirmacao para abrir o aplicativo.
echo ============================================
pause
