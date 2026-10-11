# Ponte Local — Tarot de Thoth + ChatGPT

Este serviço Python roda no seu computador e faz a ponte entre o site Tarot de Thoth
e uma conversa específica do ChatGPT, usando automação de navegador (Playwright).

## Como funciona

1. O site envia o prompt para este serviço local via HTTP.
2. O serviço abre o ChatGPT na conversa configurada, digita e envia o prompt.
3. Aguarda a resposta ser gerada completamente.
4. Captura o texto da resposta e devolve ao site.
5. Salva o histórico no banco SQLite local.

## Pré-requisitos

- Python 3.10 ou superior
- Um navegador instalado (Chromium/Chrome/Edge)
- Uma sessão do ChatGPT ativa (você fará login na primeira execução)

## Instalação (Linux Zorin)

```bash
cd local_bridge
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
# Edite .env se necessário
```

## Execução

```bash
source .venv/bin/activate
python bridge.py
```

Na primeira execução, uma janela do navegador abrirá. Faça login no ChatGPT
manualmente se necessário. A sessão será salva no perfil do navegador e reutilizada
nas próximas execuções.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/health` | Verifica se a ponte está ativa e a sessão do ChatGPT |
| POST | `/api/v1/readings` | Cria uma nova solicitação de leitura |
| GET | `/api/v1/readings/{id}` | Consulta o estado de uma leitura |
| GET | `/api/v1/readings` | Lista o histórico de leituras |
| POST | `/api/v1/readings/{id}/cancel` | Cancela uma leitura em andamento |
| POST | `/api/v1/shutdown` | Encerra o navegador |

## Configuração

Edite o arquivo `.env`:

- `BRIDGE_PORT`: porta do serviço local (padrão: 5317)
- `CHATGPT_CONVERSATION_URL`: URL da conversa do ChatGPT
- `ALLOWED_ORIGINS`: origens permitidas para CORS
- `HEADLESS`: executar navegador em segundo plano (true/false)
- `GENERATION_TIMEOUT`: tempo máximo de espera pela resposta (segundos)

## Segurança

- O serviço escuta apenas em `127.0.0.1` (localhost).
- Não expõe credenciais, cookies ou tokens.
- Não habilita CORS globalmente — apenas as origens configuradas.
- O banco de dados fica no diretório local, nunca publicado.
- O perfil do navegador é local e protegido.

## Solução de problemas

- **Sessão expirada**: abra o navegador (HEADLESS=false), faça login novamente.
- **Campo não encontrado**: a interface do ChatGPT pode ter mudado. Verifique os seletores em `browser_worker.py`.
- **Resposta vazia**: aumente `GENERATION_TIMEOUT` no `.env`.
- **CORS bloqueado**: adicione a origem do site em `ALLOWED_ORIGINS`.
