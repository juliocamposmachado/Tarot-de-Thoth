#!/bin/bash
# ============================================
#  Tarot de Thoth - Instalador do Protocolo
#  Registra tarot-bridge:// no sistema Linux
#  Permite que o site inicie a ponte com um clique
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HANDLER="$SCRIPT_DIR/handle-protocol.sh"

chmod +x "$HANDLER"
chmod +x "$SCRIPT_DIR/start.sh" 2>/dev/null
chmod +x "$SCRIPT_DIR/stop.sh" 2>/dev/null

# Create .desktop file for the protocol handler
DESKTOP_FILE="$HOME/.local/share/applications/tarot-bridge-protocol.desktop"

cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=Tarot de Thoth - Ponte Local
Comment=Inicia a ponte local para interpretacao automatica
Exec=$HANDLER %u
Icon=utilities-terminal
Terminal=false
Type=Application
MimeType=x-scheme-handler/tarot-bridge;
Categories=Utility;
NoDisplay=true
EOF

# Register the MIME type handler
MIME_DIR="$HOME/.local/share/mime/packages"
mkdir -p "$MIME_DIR"
cat > "$MIME_DIR/tarot-bridge.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="x-scheme-handler/tarot-bridge">
    <comment>Tarot de Thoth Bridge Protocol</comment>
  </mime-type>
</mime-info>
EOF

# Update MIME and desktop databases
update-desktop-database "$HOME/.local/share/applications/" 2>/dev/null
update-mime-database "$HOME/.local/share/mime/" 2>/dev/null
xdg-mime default tarot-bridge-protocol.desktop x-scheme-handler/tarot-bridge 2>/dev/null

echo "============================================"
echo "  Protocolo tarot-bridge:// registrado!"
echo "============================================"
echo ""
echo "  Agora o site pode iniciar a ponte automaticamente."
echo "  Quando voce clicar em 'Iniciar Ponte', o navegador"
echo "  pedira confirmacao para abrir o aplicativo."
echo ""
echo "  Para testar manualmente:"
echo "  xdg-open 'tarot-bridge://start'"
echo "============================================"
