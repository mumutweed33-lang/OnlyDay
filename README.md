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

## Estado Atual

- O projeto esta buildando com sucesso em producao
- O repositorio ja esta sincronizado com o GitHub
- O app hoje funciona como demo frontend com dados mockados

## Observacoes

- Os dados do usuario, posts e conversas sao salvos em `localStorage`
- Imagens de exemplo usam `picsum.photos` e `api.dicebear.com`
- Para evoluir para producao real, o proximo passo natural e integrar autenticacao, banco de dados e API
