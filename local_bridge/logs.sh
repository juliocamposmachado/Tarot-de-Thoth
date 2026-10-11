#!/bin/bash
# Mostra os logs da ponte local

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "bridge.log" ]; then
    tail -f bridge.log
else
    echo "Arquivo de log nao encontrado."
fi
