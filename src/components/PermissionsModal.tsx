import React, { useState } from 'react';
import { Shield, Check, X, Bot, Clipboard, Eye } from 'lucide-react';

interface PermissionsModalProps {
  onGranted: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ onGranted }) => {
  const [popupChecked, setPopupChecked] = useState(false);
  const [clipboardChecked, setClipboardChecked] = useState(false);
  const [ttsChecked, setTtsChecked] = useState(false);
  const [step, setStep] = useState<'intro' | 'requesting' | 'done'>('intro');

  const requestPermissions = async () => {
    setStep('requesting');

    // Test popup permission by opening a blank tab and closing it
    try {
      const testWin = window.open('about:blank', '_blank');
      if (testWin) {
        testWin.close();
        setPopupChecked(true);
      }
    } catch {
      // Popups blocked — user needs to allow
    }

    // Request clipboard permission (write + read)
    try {
      await navigator.clipboard.writeText(' ');
      setClipboardChecked(true);
    } catch {
      // Clipboard may require user gesture or secure context
    }

    // Check speech synthesis availability
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        const voices = synth.getVoices();
        if (voices.length > 0 || 'speechSynthesis' in window) {
          setTtsChecked(true);
        }
      }
    } catch {
      // TTS not available
    }

    // Brief delay to show the "requesting" animation
    setTimeout(() => setStep('done'), 800);
  };

  const handleFinish = () => {
    onGranted();
  };

  const allChecked = popupChecked && clipboardChecked && ttsChecked;

  if (step === 'intro') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[60] bg-indigo-950/95 p-4">
        <div className="bg-indigo-900 p-6 rounded-lg max-w-md w-full border border-purple-700/40 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-400/20 rounded-full p-2">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-yellow-400">Permissões Necessárias</h2>
          </div>

          <p className="text-purple-200 text-sm mb-4">
            Para que o Tarot de Thoth envie suas cartas ao agente de IA e receba a interpretação,
            precisamos de algumas permissões do seu navegador:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 bg-indigo-950/50 rounded-md">
              <Eye className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-100 text-sm font-medium">Pop-ups e redirecionamentos</p>
                <p className="text-purple-400 text-xs mt-0.5">
                  Necessário para abrir o agente de IA (ChatGPT, Copilot ou Gemini) em nova aba.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-indigo-950/50 rounded-md">
              <Clipboard className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-100 text-sm font-medium">Área de transferência</p>
                <p className="text-purple-400 text-xs mt-0.5">
                  Para copiar o prompt automaticamente e capturar a resposta quando você voltar ao site.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-indigo-950/50 rounded-md">
              <Bot className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-100 text-sm font-medium">Síntese de voz</p>
                <p className="text-purple-400 text-xs mt-0.5">
                  Para ler a interpretação em voz alta (tecnologia nativa do navegador).
                </p>
              </div>
            </div>
          </div>

          <p className="text-purple-400 text-xs mb-4">
            Se o navegador pedir permissão para pop-ups, clique em "Permitir". Estas permissões são apenas para o funcionamento do oráculo.
          </p>

          <button
            onClick={requestPermissions}
            className="w-full px-4 py-3 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition font-medium flex items-center justify-center"
          >
            <Shield className="w-5 h-5 mr-2" />
            Conceder Permissões
          </button>
        </div>
      </div>
    );
  }

  if (step === 'requesting') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[60] bg-indigo-950/95 p-4">
        <div className="bg-indigo-900 p-8 rounded-lg max-w-md w-full border border-purple-700/40 shadow-2xl text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
          <p className="text-purple-200 text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Done step — show results
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] bg-indigo-950/95 p-4">
      <div className="bg-indigo-900 p-6 rounded-lg max-w-md w-full border border-purple-700/40 shadow-2xl">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Status das Permissões
        </h2>

        <div className="space-y-3 mb-6">
          <PermissionRow
            label="Pop-ups e redirecionamentos"
            granted={popupChecked}
            hint={popupChecked ? 'Permitido' : 'Pode ser necessário permitir manualmente na barra do navegador'}
          />
          <PermissionRow
            label="Área de transferência"
            granted={clipboardChecked}
            hint={clipboardChecked ? 'Permitido' : 'Necessário contexto seguro (HTTPS) — ainda funciona com colagem manual'}
          />
          <PermissionRow
            label="Síntese de voz"
            granted={ttsChecked}
            hint={ttsChecked ? 'Disponível' : 'Não detectado — a interpretação será exibida em texto'}
          />
        </div>

        {!allChecked && (
          <div className="p-3 bg-orange-900/30 border border-orange-700/40 rounded-md mb-4">
            <p className="text-orange-300 text-xs">
              Algumas permissões não foram concedidas automaticamente. O site ainda funciona, mas pode ser necessário copiar e colar manualmente em alguns passos.
            </p>
          </div>
        )}

        <button
          onClick={handleFinish}
          className="w-full px-4 py-3 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition font-medium flex items-center justify-center"
        >
          <Check className="w-5 h-5 mr-2" />
          Continuar para o Tarot
        </button>
      </div>
    </div>
  );
};

const PermissionRow: React.FC<{ label: string; granted: boolean; hint: string }> = ({ label, granted, hint }) => (
  <div className="flex items-center gap-3 p-3 bg-indigo-950/50 rounded-md">
    {granted ? (
      <div className="bg-green-600/30 rounded-full p-1">
        <Check className="w-4 h-4 text-green-400" />
      </div>
    ) : (
      <div className="bg-orange-600/30 rounded-full p-1">
        <X className="w-4 h-4 text-orange-400" />
      </div>
    )}
    <div className="flex-1">
      <p className="text-purple-100 text-sm font-medium">{label}</p>
      <p className="text-purple-400 text-xs">{hint}</p>
    </div>
  </div>
);
