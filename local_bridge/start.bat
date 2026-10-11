@echo off
REM ============================================
REM  Tarot de Thoth - Iniciar Ponte Local (Windows)
REM ============================================

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check if Python venv exists
if not exist ".venv\Scripts\activate.bat" (
    echo Ambiente virtual nao encontrado. Execute install.bat primeiro.
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

REM Load .env
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do set "%%a=%%b"
)

set PORT=5317
if defined BRIDGE_PORT set PORT=%BRIDGE_PORT%

REM Check if already running
netstat -an | findstr ":%PORT% " | findstr "LISTENING" >nul 2>nul
if %errorlevel%==0 (
    echo A ponte local ja esta rodando na porta %PORT%.
    exit /b 0
)

echo Iniciando ponte local na porta %PORT%...
start /b python bridge.py > bridge.log 2>&1

timeout /t 3 /nobreak >nul

echo Ponte local iniciada!
echo HTTP:  http://127.0.0.1:%PORT%
echo HTTPS: https://127.0.0.1:%PORT%+1
echo.
echo IMPORTANTE: Acesse https://127.0.0.1:5318/api/v1/health no navegador
echo e aceite o certificado de seguranca (Avancado ^> Continuar).
