#!/bin/bash
# Encerra a ponte local do Tarot de Thoth

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${BRIDGE_PORT:-5317}"

# Try PID file first
if [ -f "bridge.pid" ]; then
    PID=$(cat bridge.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "Ponte local encerrada (PID: $PID)."
        rm -f bridge.pid
        exit 0
    fi
    rm -f bridge.pid
fi

# Fallback: kill by port (both HTTP and HTTPS)
for p in $PORT $((PORT+1)); do
    PID=$(lsof -i :$p -t 2>/dev/null | head -1)
    if [ -n "$PID" ]; then
        kill $PID
    fi
done
echo "Ponte local encerrada."
