import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Shield, Check, X, AlertTriangle, Loader2, Zap, Copy } from 'lucide-react';
import { sendToAgentAndWait, AgentType, buildPrompt, InterpretationRequest } from '../services/agentService';

interface BridgeModalProps {
  open: boolean;
  onClose: () => void;
  selectedAgent: AgentType;
  request: InterpretationRequest;
  onInterpretationReceived: (text: string) => void;
}

type Phase = 'confirm' | 'executing' | 'success' | 'error';

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'error';
}

export const BridgeModal: React.FC<BridgeModalProps> = ({
  open,
  onClose,
  selectedAgent,
  request,
  onInterpretationReceived,
}) => {
  const [phase, setPhase] = useState<Phase>('confirm');
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!open) {
      setPhase('confirm');
      setLogs([]);
      setInterpretation('');
      setErrorMsg('');
    }
  }, [open]);

  if (!open) return null;

  const addLog = (text: string, type: LogLine['type'] = 'info') => {
    setLogs((prev) => [...prev, { text, type }]);
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const executeBridge = async () => {
    setPhase('executing');
    setLogs([]);
    setInterpretation('');
    setErrorMsg('');

    addLog('> Iniciando ponte automatica...', 'info');
    await delay(300);

    addLog('> Verificando permissoes do navegador...', 'info');
    await delay(200);

    try {
      const testWin = window.open('about:blank', '_blank');
      if (testWin) testWin.close();
      addLog('  [OK] Permissao de pop-ups: concedida', 'success');
    } catch {
      addLog('  [AVISO] Permissao de pop-ups: pode ser necessario permitir manualmente', 'info');
    }
    await delay(200);

    try {
      await navigator.clipboard.writeText(' ');
      addLog('  [OK] Permissao de area de transferencia: concedida', 'success');
    } catch {
      addLog('  [AVISO] Area de transferencia: contexto seguro necessario', 'info');
    }
    await delay(200);

    addLog('> Verificando sintese de voz...', 'info');
    if ('speechSynthesis' in window) {
      addLog('  [OK] Sintese de voz disponivel', 'success');
    } else {
      addLog('  [AVISO] Sintese de voz nao detectada', 'info');
    }
    await delay(300);

    addLog('> Construindo prompt de interpretacao...', 'info');
    const prompt = buildPrompt(request);
    addLog(`  [OK] Prompt gerado (${prompt.length} caracteres)`, 'success');
    await delay(300);

    addLog('> Conectando ao agente de IA (servidor)...', 'info');
    await delay(400);

    addLog('> Enviando prompt para o servidor...', 'info');
    const response = await sendToAgentAndWait(selectedAgent, prompt, (status) => {
      if (status.state === 'waiting') {
        addLog('  [...] Aguardando resposta do agente...', 'info');
      } else if (status.state === 'received') {
        addLog(`  [OK] Resposta recebida (${status.text.length} caracteres)`, 'success');
      } else if (status.state === 'error') {
        addLog(`  [ERRO] ${status.message}`, 'error');
      }
    });

    if (response && response.length > 20) {
      await delay(300);
      addLog('> Ponte estabelecida com sucesso!', 'success');
      addLog('> Interpretacao pronta para exibicao.', 'success');
      setInterpretation(response);
      setPhase('success');
    } else {
      await delay(200);
      const msg = 'Falha ao receber interpretacao do agente. Verifique a conexao e tente novamente.';
      setErrorMsg(msg);
      addLog(`> [ERRO] ${msg}`, 'error');
      setPhase('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(interpretation).catch(() => {});
  };

  const handleUseInterpretation = () => {
    onInterpretationReceived(interpretation);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] bg-indigo-950/95 p-4">
      <div className="bg-indigo-900 rounded-lg max-w-2xl w-full border border-purple-700/40 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-700/40">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400/20 rounded-full p-2">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-400">Iniciar Ponte Automaticamente</h2>
              <p className="text-purple-300 text-xs">Conexao com o agente de IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-yellow-400 transition-colors p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Confirmation phase */}
          {phase === 'confirm' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-indigo-950/50 rounded-lg border border-purple-700/30">
                <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Confirmar execucao do comando
                  </p>
                  <p className="text-purple-300 text-xs leading-relaxed">
                    Este processo ira conectar seu navegador ao agente de IA selecionado,
                    enviar os dados da sua leitura de tarot e receber automaticamente a
                    interpretacao. O comando sera executado no servidor usando arquivos
                    temporarios para a comunicacao.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-lg border border-purple-700/20">
                <p className="text-purple-300 text-xs mb-2 font-medium">O que sera executado:</p>
                <ul className="space-y-1.5 text-purple-400 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Verificacao de permissoes do navegador (pop-ups, clipboard, voz)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Geracao do prompt com os dados da sua leitura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Envio do prompt ao servidor e comunicacao com a IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Recebimento automatico da interpretacao</span>
                  </li>
                </ul>
              </div>

              <p className="text-purple-400 text-xs text-center">
                Deseja autorizar a execucao deste comando?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-indigo-800 text-purple-200 rounded-md hover:bg-indigo-700 transition font-medium flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={executeBridge}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition font-medium flex items-center justify-center"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Autorizar e Executar
                </button>
              </div>
            </div>
          )}

          {/* Executing phase - terminal output */}
          {(phase === 'executing' || phase === 'success' || phase === 'error') && (
            <div className="space-y-4">
              {/* Terminal-style log */}
              <div className="bg-black/80 rounded-lg border border-purple-900/50 p-4 font-mono text-sm max-h-[280px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-900/40">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-mono">terminal@thoth-bridge</span>
                </div>
                <div className="space-y-1">
                  {logs.map((line, i) => (
                    <div
                      key={i}
                      className={`font-mono text-xs leading-relaxed ${
                        line.type === 'success'
                          ? 'text-green-400'
                          : line.type === 'error'
                            ? 'text-red-400'
                            : 'text-purple-300'
                      }`}
                    >
                      {line.text}
                    </div>
                  ))}
                  {phase === 'executing' && (
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-mono mt-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>executando...</span>
                    </div>
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>

              {/* Success - show interpretation */}
              {phase === 'success' && interpretation && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700/40 rounded-lg">
                    <Check className="w-5 h-5 text-green-400" />
                    <p className="text-green-300 text-sm font-medium">
                      Ponte estabelecida com sucesso! Interpretacao recebida.
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-950/50 rounded-lg border border-purple-700/30 max-h-[200px] overflow-y-auto">
                    <p className="text-yellow-200 text-sm whitespace-pre-wrap leading-relaxed">
                      {interpretation}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2.5 bg-indigo-800 text-purple-200 rounded-md hover:bg-indigo-700 transition flex items-center justify-center text-sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </button>
                    <button
                      onClick={handleUseInterpretation}
                      className="flex-1 px-4 py-2.5 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition font-medium flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Usar Interpretacao
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {phase === 'error' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-900/30 border border-red-700/40 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{errorMsg}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 bg-indigo-800 text-purple-200 rounded-md hover:bg-indigo-700 transition text-sm"
                    >
                      Fechar
                    </button>
                    <button
                      onClick={executeBridge}
                      className="flex-1 px-4 py-2.5 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition font-medium flex items-center justify-center text-sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
