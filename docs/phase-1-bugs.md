# Fase 1 - Registro de Bugs

Use este arquivo durante a QA funcional do beta fechado.

## Como preencher
- Tela:
- Acao:
- Esperado:
- Atual:
- Severidade:
- Status:

---

## Bug 1
- Tela: Chat / perfil publico
- Acao: abrir conversa a partir de um perfil publico e enviar mensagem
- Esperado: conversa persistida no banco e reutilizada depois de refresh
- Atual: conversa era criada apenas no estado local, entao podia sumir e mensagens caiam no fallback
- Severidade: bloqueador
- Status: corrigido

## Bug 2
- Tela: Chat / OnlyAuction
- Acao: enviar lance em uma conversa
- Esperado: mensagem de lance gravada com sender e receiver reais
- Atual: receiverId usava o id da conversa, nao o id do outro participante
- Severidade: bloqueador
- Status: corrigido

## Bug 3
- Tela: Supabase / perfis reais
- Acao: cadastrar, atualizar perfil ou listar perfis no Explorar
- Esperado: campos de profile mapeados corretamente entre app e tabela profiles
- Atual: app usava camelCase enquanto schema esta em snake_case, perdendo flags como creator/verified e podendo falhar no upsert
- Severidade: bloqueador
- Status: corrigido

## Bug 4
- Tela: Explorar
- Acao: buscar perfis reais carregados do banco
- Esperado: perfis criadores reais aparecem na descoberta e busca
- Atual: busca usava apenas rankings OD Core e criadores mockados
- Severidade: medio
- Status: corrigido

## Bug 5
- Tela: Feed
- Acao: carregar feed com posts existentes
- Esperado: placeholders aparecem apenas durante estado vazio/carregando
- Atual: dois skeleton cards ficavam fixos no fim da tela
- Severidade: acabamento
- Status: corrigido

## Bug 6
- Tela: Onboarding / selfie
- Acao: negar permissao de camera ou falhar getUserMedia
- Esperado: mensagem clara e tela permanece no estado de ativar camera
- Atual: UI entrava em cameraActive sem stream valido
- Severidade: medio
- Status: corrigido

## Bug 7
- Tela: Ambiente local / QA visual
- Acao: rodar npm run dev dentro do ambiente Codex e bater localhost
- Esperado: dev server responde de forma estavel para navegacao visual
- Atual: no sandbox falha com spawn EPERM; fora do sandbox abriu porta mas ficou instavel/lento para requests HTTP
- Severidade: bloqueador de QA visual, nao necessariamente de produto
- Status: aberto

## Bug 8
- Tela: Onboarding / cadastro
- Acao: criar nova conta em navegador sem camera liberada
- Esperado: usuario consegue continuar o cadastro em modo de teste controlado
- Atual: etapa de selfie bloqueava a criacao da conta se a camera falhasse
- Severidade: medio
- Status: corrigido

## Bug 9
- Tela: Onboarding / cadastro Supabase
- Acao: criar conta quando o Supabase exige confirmacao de e-mail ou o e-mail ja existe
- Esperado: mensagem orienta claramente o proximo passo
- Atual: erro tecnico/ambiguous fazia parecer que o cadastro simplesmente nao funcionava
- Severidade: medio
- Status: corrigido
