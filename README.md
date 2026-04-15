# OnlyDay

Aplicacao frontend em `Next.js` para uma rede social premium com foco em criadores, monetizacao e experiencia mobile-first.

O projeto simula o fluxo principal da plataforma com landing page, onboarding, feed, exploracao, chat VIP, perfil e dashboard de creator economy.

## Visao Geral

O app foi estruturado como um prototipo funcional de produto, com interface rica, animacoes e dados persistidos localmente no navegador.

Atualmente, o estado e controlado no frontend com `React Context` e `localStorage`, sem backend real ou integracao com API.

## Funcionalidades

- Landing page com proposta da plataforma e entrada para onboarding
- Fluxo de onboarding com cadastro, selfie, documentos e perfil
- Feed com posts, momentos e interacoes simuladas
- Area de exploracao com tendencias, categorias e criadores em ascensao
- Chat VIP com conversas, conteudo bloqueado e mecanica de leilao
- Empire Hub com visao de receita, planos e carteira
- Perfil do usuario com dados persistidos localmente

## Stack

- `Next.js 15`
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Framer Motion`
- `Lucide React`

## Estrutura

```text
app/
  globals.css
  layout.tsx
  page.tsx

components/
  app/
  chat/
  empire/
  explore/
  feed/
  landing/
  momentos/
  onboarding/
  profile/
  providers/
  ui/
```

## Como Rodar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

### 3. Abrir no navegador

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: inicia o ambiente de desenvolvimento
- `npm run build`: gera o build de producao
- `npm run start`: sobe a aplicacao ja buildada
- `npm run lint`: executa a checagem de lint

## Deploy

### Vercel

1. Importe o repositorio no painel da Vercel
2. Selecione o framework `Next.js`
3. Mantenha os comandos padrao:

```text
Build Command: npm run build
Install Command: npm install
Output: .next
```

4. Publique o projeto

O arquivo `vercel.json` ja foi adicionado para deixar o deploy mais direto.

## Estado Atual

- O projeto esta buildando com sucesso em producao
- O repositorio ja esta sincronizado com o GitHub
- O app hoje funciona como demo frontend com dados mockados

## Auth e Banco

O projeto agora tem uma base inicial para migrar de demo local para auth e banco reais com `Supabase` como caminho principal:

- `components/providers/UserContext.tsx`: usa uma camada de auth em vez de falar direto com `localStorage`
- `lib/auth/contracts.ts`: contrato da autenticacao
- `lib/auth/mock-auth-service.ts`: implementacao local atual
- `lib/auth/supabase-auth-service.ts`: implementacao real de login com `Supabase Auth`
- `lib/auth/index.ts`: ponto de troca entre `mock` e `supabase`
- `lib/db/contracts.ts`: contratos de repositorio para banco
- `lib/config/env.ts`: leitura centralizada de variaveis de ambiente
- `lib/supabase/client.ts`: cliente browser do Supabase
- `types/domain.ts`: tipos de dominio reaproveitaveis
- `.env.example`: variaveis iniciais para ambiente real

### Como ligar o Supabase

1. Crie um projeto no painel do Supabase
2. Copie `.env.example` para `.env.local`
3. Preencha:

```bash
NEXT_PUBLIC_AUTH_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Rode:

```bash
npm install
npm run dev
```

### O que ja esta pronto

- Criacao de conta com `email + senha`
- Login real com `Supabase Auth`
- Persistencia de sessao no navegador
- Perfil basico salvo nos metadados do usuario e em cache local para a UX
- Tratamento para o caso em que o Supabase exigir confirmacao por e-mail antes do primeiro login

### Proximo passo natural para backend real completo

1. criar tabelas no Supabase para `profiles`, `posts`, `messages` e `momentos`
2. ligar `lib/db/` a repositórios reais
3. trocar os providers de posts, mensagens e momentos para consumir esses repositórios

## Observacoes

- Os dados do usuario, posts e conversas sao salvos em `localStorage`
- Imagens de exemplo usam `picsum.photos` e `api.dicebear.com`
- Para evoluir para producao real, o proximo passo natural e integrar autenticacao, banco de dados e API
