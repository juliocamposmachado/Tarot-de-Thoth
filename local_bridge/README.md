# Ponte Local — Tarot de Thoth + ChatGPT

Este serviço Python roda no seu computador e faz a ponte entre o site Tarot de Thoth
e uma conversa específica do ChatGPT, usando automação de navegador (Playwright).

## Como funciona

1. O site envia o prompt para este serviço local via HTTP (localhost:5317).
2. O serviço abre o ChatGPT na conversa configurada, digita e envia o prompt.
3. Aguarda a resposta ser gerada completamente.
4. Captura o texto da resposta e devolve ao site.
5. Salva o histórico no banco SQLite local.

**Sem API da OpenAI. Sem chaves. Sem custo.** Usa apenas a sessão do ChatGPT
já autenticada no seu navegador.

## Instalação rápida (Linux Zorin)

```bash
cd local_bridge
./setup.sh
```

O script cria o ambiente virtual, instala as dependências e o navegador Chromium.

## Iniciar a ponte

```bash
./start.sh
```

Na primeira execução, uma janela do navegador abrirá. Faça login no ChatGPT
manualmente se necessário. A sessão será salva e reutilizada nas próximas vezes.

Para iniciar em segundo plano (sem terminal aberto):

```bash
./start.sh   # já roda em background com nohup
```

Ou use o atalho de desktop: copie `tarot-bridge.desktop` para `~/.local/share/applications/`.

## Comandos disponíveis

| Script | Descrição |
|--------|-----------|
| `./setup.sh` | Instala tudo (ambiente virtual + dependências + navegador) |
| `./start.sh` | Inicia a ponte em segundo plano |
| `./stop.sh` | Encerra a ponte |
| `./logs.sh` | Mostra os logs em tempo real |

## Endpoints da API local

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/health` | Verifica se a ponte está ativa e a sessão do ChatGPT |
| POST | `/api/v1/readings` | Cria uma nova solicitação de leitura |
| GET | `/api/v1/readings/{id}` | Consulta o estado de uma leitura |
| GET | `/api/v1/readings` | Lista o histórico de leituras |
| POST | `/api/v1/readings/{id}/cancel` | Cancela uma leitura em andamento |

## Configuração

Edite o arquivo `.env`:

- `BRIDGE_PORT`: porta do serviço local (padrão: 5317)
- `CHATGPT_CONVERSATION_URL`: URL da conversa do ChatGPT
- `ALLOWED_ORIGINS`: origens permitidas para CORS (separadas por vírgula)
- `HEADLESS`: executar navegador sem interface gráfica (true/false)
- `GENERATION_TIMEOUT`: tempo máximo de espera pela resposta (segundos)

## Segurança

- O serviço escuta apenas em `127.0.0.1` (localhost) — não acessível pela internet.
- Não armazena credenciais, cookies ou tokens.
- CORS restrito às origens configuradas.
- Banco SQLite local, nunca publicado no Vercel.
- Perfil do navegador é local e protegido.

## Solução de problemas

- **Sessão expirada**: execute com `HEADLESS=false`, faça login novamente no ChatGPT.
- **Campo não encontrado**: a interface do ChatGPT pode ter mudado. Verifique os seletores em `browser_worker.py`.
- **Resposta vazia**: aumente `GENERATION_TIMEOUT` no `.env`.
- **CORS bloqueado**: adicione a origem do site em `ALLOWED_ORIGINS`.
- **Porta em uso**: altere `BRIDGE_PORT` no `.env` ou encerre o processo com `./stop.sh`.
