#!/bin/bash
# ============================================
#  Tarot de Thoth - Instalacao da Ponte Local
#  Script unico: instala tudo e inicia o servico
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  Tarot de Thoth - Instalacao da Ponte Local"
echo "============================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python 3 nao encontrado. Instale com:"
    echo "  sudo apt install python3 python3-venv python3-pip"
    exit 1
fi

PY_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "Python encontrado: $PY_VERSION"

if [[ "$PY_VERSION" < "3.10" ]]; then
    echo "ERRO: Python 3.10 ou superior necessario."
    exit 1
fi

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv .venv
fi

# Activate and install
echo "Ativando ambiente virtual e instalando dependencias..."
source .venv/bin/activate

pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo "Instalando navegador Chromium para o Playwright..."
playwright install chromium 2>/dev/null || true

echo "Gerando certificado SSL para HTTPS local..."
if command -v openssl &> /dev/null; then
    mkdir -p .cert
    openssl req -x509 -newkey rsa:2048 \
        -keyout .cert/key.pem -out .cert/cert.pem \
        -days 365 -nodes \
        -subj "/CN=127.0.0.1" \
        -addext "subjectAltName=IP:127.0.0.1" 2>/dev/null
    echo "Certificado gerado."
else
    echo "Aviso: openssl nao encontrado. HTTPS nao estara disponivel."
fi

# Create .env from example if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Arquivo .env criado a partir do exemplo."
fi

# Make all scripts executable
chmod +x *.sh 2>/dev/null

# Register the custom protocol handler (tarot-bridge://)
echo "Registrando protocolo tarot-bridge://..."
./install-protocol.sh 2>/dev/null || echo "Aviso: nao foi possivel registrar o protocolo automaticamente."

echo ""
echo "============================================"
echo "  Instalacao concluida!"
echo "============================================"
echo ""
echo "  O protocolo tarot-bridge:// foi registrado."
echo "  O site podera iniciar a ponte automaticamente."
echo ""
echo "  Para iniciar manualmente: ./start.sh"
echo "  Para parar: ./stop.sh"
echo "  Para ver logs: ./logs.sh"
echo ""
echo "  Na primeira execucao, uma janela do navegador abrira."
echo "  Faca login no ChatGPT se necessario."
echo ""
echo "  IMPORTANTE: Acesse https://127.0.0.1:5318/api/v1/health"
echo "  no navegador e aceite o certificado (Avancado > Continuar)."
echo "============================================"
