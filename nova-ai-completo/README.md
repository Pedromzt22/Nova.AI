# Nova.ai — landing page + Studio com backend seguro

Este projeto já é a Nova.ai completa (landing page, Studio, galeria, tela de
login) no visual cyberpunk neon roxo/rosa, com o gerador de imagens do Studio
**conectado a uma API real**, sem nunca expor sua chave no navegador. O
front-end só conversa com as rotas `/api/generate/image` e
`/api/generate/video`, que rodam no servidor e são as únicas que conhecem
sua chave.

## Como rodar localmente

1. Instale as dependências:
   ```
   npm install
   ```

2. Crie sua conta gratuita na Replicate: https://replicate.com
   (dá um cadastro rápido com GitHub/Google; ganha alguns créditos de teste)

3. Gere um token em https://replicate.com/account/api-tokens

4. Copie o arquivo de exemplo e cole seu token:
   ```
   cp .env.local.example .env.local
   ```
   Abra `.env.local` e preencha:
   ```
   REPLICATE_API_TOKEN=r8_seu_token_aqui
   ```

5. Rode o projeto:
   ```
   npm run dev
   ```
   Acesse http://localhost:3000

## Por que Replicate?

Foi escolhida porque uma única chave dá acesso a diversos modelos de imagem
(Flux, SDXL) e de vídeo (Stable Video Diffusion e outros) via uma API REST
simples — bom ponto de partida antes de decidir se quer trocar por
Fal.ai ou OpenAI depois. A lógica de chamada fica isolada em `lib/replicate.ts`,
então trocar de provedor no futuro significa editar só esse arquivo.

## O que já está implementado

- Landing page, Studio, galeria e tela de login completos (visual cyberpunk neon)
- Rotas de API protegidas (`app/api/generate/image`, `app/api/generate/video`)
- Chave de API mantida apenas em variável de ambiente do servidor
- Validação básica do prompt (tamanho, presença)
- Rate limiting simples por IP (em memória — trocar por Redis/Upstash em produção real com múltiplos servidores)
- Botão "Gerar imagem" do Studio já chama `/api/generate/image` de verdade e mostra o resultado, erro e gasto de créditos (créditos ainda só no estado local do navegador, não persistidos)

## O que ainda falta para produção completa

- **Autenticação** (Supabase Auth ou similar) para saber quem está gerando
- **Sistema de créditos**: debitar créditos do usuário no banco de dados
  antes/depois de cada geração bem-sucedida (hoje o TODO está marcado no
  código das rotas)
- **Armazenamento**: hoje a URL da imagem/vídeo vem direto da Replicate e
  expira depois de um tempo — para manter permanentemente, baixe o arquivo
  e suba para o Supabase Storage ou S3
- **Fila para vídeos**: gerações de vídeo demoram mais que o timeout de uma
  requisição HTTP comum; em produção use um worker/fila (ex: Inngest, Trigger.dev)
  em vez de esperar a resposta na mesma requisição
- Deploy (Vercel é o caminho mais simples para apps Next.js)

## Segurança — resumo

- `.env.local` nunca é commitado (está no `.gitignore`)
- A chave só existe no processo do servidor, nunca no HTML/JS enviado ao navegador
- Toda geração passa por validação de entrada e rate limit antes de custar dinheiro
