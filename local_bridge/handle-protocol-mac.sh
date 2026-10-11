#!/bin/bash
# ============================================
#  Tarot de Thoth - Handler para protocolo macOS
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URI="$1"
ACTION=""

if [[ "$URI" == tarot-bridge://* ]]; then
    ACTION="${URI#tarot-bridge://}"
fi

case "$ACTION" in
    start|"")
        cd "$SCRIPT_DIR"
        ./start.sh 2>/dev/null
        ;;
    stop)
        cd "$SCRIPT_DIR"
        ./stop.sh 2>/dev/null
        ;;
    *)
        cd "$SCRIPT_DIR"
        ./start.sh 2>/dev/null
        ;;
esac
