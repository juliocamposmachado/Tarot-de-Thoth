#!/bin/bash
# ============================================
#  Tarot de Thoth - Handler para protocolo personalizado
#  Registra o esquema tarot-bridge:// no sistema
#  Quando o site chama tarot-bridge://start, este script
#  inicia automaticamente a ponte local.
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse the URI argument
URI="$1"
ACTION=""

if [[ "$URI" == tarot-bridge://* ]]; then
    ACTION="${URI#tarot-bridge://}"
fi

case "$ACTION" in
    start|"")
        # Start the bridge
        cd "$SCRIPT_DIR"
        ./start.sh 2>/dev/null
        ;;
    stop)
        cd "$SCRIPT_DIR"
        ./stop.sh 2>/dev/null
        ;;
    *)
        # Unknown action, try to start anyway
        cd "$SCRIPT_DIR"
        ./start.sh 2>/dev/null
        ;;
esac
