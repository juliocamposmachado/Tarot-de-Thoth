@echo off
REM ============================================
REM  Tarot de Thoth - Handler para protocolo Windows
REM  Inicia a ponte local quando chamado via tarot-bridge://
REM ============================================

set SCRIPT_DIR=%~dp0
set URI=%~1

REM Extract action from URI
set ACTION=start
if not "%URI%"=="" (
    set ACTION=%URI:tarot-bridge://=%
)

REM Start the bridge
cd /d "%SCRIPT_DIR%"
call start.bat 2>nul

exit /b 0
