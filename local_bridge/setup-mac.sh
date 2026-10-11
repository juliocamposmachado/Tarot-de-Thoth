#!/bin/bash
# ============================================
#  Tarot de Thoth - Instalacao da Ponte Local (macOS)
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  Tarot de Thoth - Instalacao (macOS)"
echo "============================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python 3 nao encontrado. Instale com: brew install python3"
    exit 1
fi

# Create virtual environment
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
playwright install chromium 2>/dev/null || true

# Generate SSL cert
if command -v openssl &> /dev/null; then
    mkdir -p .cert
    openssl req -x509 -newkey rsa:2048 \
        -keyout .cert/key.pem -out .cert/cert.pem \
        -days 365 -nodes \
        -subj "/CN=127.0.0.1" \
        -addext "subjectAltName=IP:127.0.0.1" 2>/dev/null
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

chmod +x *.sh

echo "Registrando protocolo tarot-bridge://..."
# macOS uses Launch Services for URL schemes
APP_SCRIPT="$SCRIPT_DIR/handle-protocol-mac.sh"
defaults write com.apple.LaunchServices LSHandlers \
    -array-add '{LSHandlerURLScheme="tarot-bridge";LSHandlerRoleAll="com.tarot-thoth.bridge";}' \
    2>/dev/null || true

echo "============================================"
echo "  Instalacao concluida!"
echo "  Para iniciar: ./start.sh"
echo "============================================"
