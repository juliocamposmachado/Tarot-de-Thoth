#!/bin/bash
# ============================================
#  Tarot de Thoth - Iniciar Ponte Local
#  Inicia o servico Python em segundo plano
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "Ambiente virtual nao encontrado. Executando instalacao..."
    ./setup.sh
fi

source .venv/bin/activate

# Load .env if it exists
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

PORT="${BRIDGE_PORT:-5317}"

# Check if already running
if lsof -i :$PORT -t 2>/dev/null | head -1 | grep -q .; then
    echo "A ponte local ja esta rodando nas portas $PORT (HTTP) e $((PORT+1)) (HTTPS)."
    echo "Para encerrar: ./stop.sh"
    exit 0
fi

echo "============================================"
echo "  Iniciando ponte local na porta $PORT..."
echo "============================================"

# Start in background, redirect output to log
nohup python bridge.py > bridge.log 2>&1 &
BRIDGE_PID=$!

echo "$BRIDGE_PID" > bridge.pid

# Wait a moment and check if it started
sleep 3

if kill -0 $BRIDGE_PID 2>/dev/null; then
    echo "Ponte local iniciada com sucesso! PID: $BRIDGE_PID"
    echo ""
    echo "  HTTP:  http://127.0.0.1:$PORT"
    echo "  HTTPS: https://127.0.0.1:$((PORT+1))"
    echo "  Log:   $SCRIPT_DIR/bridge.log"
    echo ""
    echo "  IMPORTANTE: Na primeira vez, acesse https://127.0.0.1:$((PORT+1))/api/v1/health"
    echo "  no navegador e aceite o certificado de seguranca (clique em 'Avancado' > 'Continuar')."
    echo "  Isso permite que o site em HTTPS se comunique com a ponte local."
    echo ""
    echo "Para parar: ./stop.sh"
    echo "Para ver logs: ./logs.sh"
else
    echo "ERRO: A ponte nao conseguiu iniciar. Veja o log:"
    cat bridge.log
    exit 1
fi
