@echo off
REM ============================================
REM  Tarot de Thoth - Instalacao da Ponte Local (Windows)
REM ============================================

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo ============================================
echo  Tarot de Thoth - Instalacao da Ponte Local
echo ============================================

REM Check Python
python --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado. Instale Python 3.10+ de python.org
    pause
    exit /b 1
)

REM Create virtual environment
if not exist ".venv" (
    echo Criando ambiente virtual...
    python -m venv .venv
)

echo Ativando ambiente virtual e instalando dependencias...
call .venv\Scripts\activate.bat
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo Instalando navegador Chromium...
playwright install chromium 2>nul

REM Create .env
if not exist ".env" (
    copy .env.example .env
)

REM Register protocol
echo Registrando protocolo tarot-bridge://...
call install-protocol.bat

echo.
echo ============================================
echo  Instalacao concluida!
echo ============================================
echo  Para iniciar: start.bat
echo ============================================
pause
