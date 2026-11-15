# 🃏 Tarot de Thoth

> Um projeto digital dedicado à exploração esotérica do Tarot de Thoth, baseado nas obras de Aleister Crowley e nas ilustrações de Lady Frieda Harris.

## 🌐 Visite o site

Acesse a versão online em: [tarot-de-thoth.vercel.app](https://tarot-de-thoth.vercel.app)

## ✨ Sobre o Projeto

Este projeto tem como objetivo apresentar uma interpretação interativa e moderna das cartas do Tarot de Thoth. Com base em *O Livro de Thoth* de Crowley, o sistema incorpora elementos da tradição da Qabalah, astrologia, alquimia e magia cerimonial.

### Funcionalidades:
- Leitura interativa das 78 cartas do baralho
- Categorias: Arcanos Maiores e Menores
- Interface com **text-to-speech** para acessibilidade
- Navegação por símbolos, nomes ou significados
- Design responsivo e otimizado para SEO

## 🧩 Tecnologias Utilizadas

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lodash](https://lodash.com/)
- [Vercel](https://vercel.com/) para hospedagem

## 🚀 Como Rodar Localmente

```bash
git clone https://github.com/AstridNielsen-lab/Tarot-de-Thoth.git
cd Tarot-de-Thoth
npm install
npm run dev
```

### Configuração da Claude

As interpretações são geradas no servidor pela Claude Messages API. Copie `.env.example` para `.env.local` em desenvolvimento ou configure estas variáveis no ambiente da Vercel ou do Supabase:

```bash
ANTHROPIC_API_KEY=sua_chave_da_anthropic
ANTHROPIC_WORKSPACE_ID=seu_workspace_id
ANTHROPIC_MODEL=claude-sonnet-5-5
ANTHROPIC_VERSION=2026-10-21
```

`ANTHROPIC_API_KEY` nunca deve usar o prefixo `VITE_`, pois a chave precisa permanecer apenas no servidor.

## 👥 Contribuições
Contribuições são bem-vindas! Para sugestões, abra uma issue ou envie um pull request.

## 📱 Contato
Desenvolvido por Julio Campos Machado 📲 WhatsApp: +5511970603441

## 🪄 Inspiração
“Do que se fala não se pode dizer. Do que se pode dizer não se fala.”
