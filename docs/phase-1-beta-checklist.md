# Fase 1 - Beta Fechado

Status: fechado para teste controlado.

Objetivo:
- deixar a OnlyDay pronta para testes reais com um grupo pequeno
- reduzir erros de fluxo antes de monetizacao real e abertura publica
- manter o beta conectado a contas reais via Supabase, sem feed/perfis falsos no app logado

## 1. Acesso e sessao
- [x] Cadastro novo funcionando ponta a ponta
- [x] Login com conta existente funcionando
- [x] Logout voltando para a home publica
- [x] Recuperacao de senha disparando corretamente
- [x] Sessao persistindo apos refresh
- [x] Diferenca clara entre conta comum e conta criador

## 2. Home publica e onboarding
- [x] Landing carregando sem erro
- [x] CTA `Entrar` abrindo login
- [x] CTA `Comecar Gratis` abrindo cadastro
- [x] CTA `Ver Demo` levando para bloco real
- [x] Footer com links validos
- [x] Termos, Privacidade, FAQ, Precos e Contato acessiveis
- [x] Cadastro com senha minima, confirmacao e aceite legal
- [x] Camera so ativando apos acao explicita do usuario

## 3. Feed principal
- [x] Feed carregando com posts reais quando existem
- [x] Like, save, share e comentarios respondendo
- [x] Menu `...` com acoes coerentes
- [x] Post proprio com comportamento de dono
- [x] Hashtags navegando para descoberta
- [x] Detalhe de post abrindo
- [x] Notificacoes abrindo e marcando leitura

## 4. Explorar
- [x] Busca funcionando por perfil, hashtag e assunto
- [x] Radar do dia funcionando
- [x] Tendencias clicaveis
- [x] Cards de perfil abrindo perfil publico
- [x] Follow atualizando estado e contagem
- [x] Resultados sem telas mortas

## 5. Momentos
- [x] Barra de momentos carregando
- [x] Viewer abrindo sem travar
- [x] Navegacao entre momentos do mesmo criador funcionando
- [x] Navegacao para o proximo criador funcionando
- [x] Seu Momento abrindo fluxo de criacao
- [x] Paywall de momentos deixando claro o estado demo

## 6. Perfil proprio e perfil publico
- [x] Meu perfil abrindo como perfil proprio
- [x] Perfil de outra pessoa abrindo como perfil publico
- [x] Editar perfil carregando dados atuais
- [x] Dashboard aparecendo so para criador
- [x] Botao de mensagem presente no perfil publico
- [x] Grades de posts abrindo detalhe

## 7. Chat
- [x] Lista de conversas abrindo
- [x] Entrar na conversa sem cair em loop de navegacao
- [x] Modal de conexao premium com CTA claro
- [x] Abrir conversa funcionando
- [x] Composer fixo e utilizavel
- [x] Envio de mensagem com feedback visual
- [x] Envio de conteudo premium mock funcionando

## 8. Publicacao
- [x] Modal de novo post abrindo
- [x] Publicacao comum funcionando
- [x] Publicacao premium exigindo preco valido
- [x] Feedback claro apos publicar

## 9. Estabilidade tecnica
- [x] `tsc --noEmit` passando
- [x] `npm run build` passando
- [x] Site publicado carregando na Vercel
- [x] Sem erros criticos visiveis para o usuario final

## 10. Criterio de saida da Fase 1
- [x] Nenhum erro bloqueando uso principal do app
- [x] UX principal coerente para teste com usuarios reais
- [x] Base pronta para iniciar Fase 2 de monetizacao real

## Observacoes de fechamento
- Producao configurada para usar Supabase em vez de conta local/mock.
- O app logado nao deve mais exibir perfis, posts, conversas ou momentos de exemplo.
- Dados antigos de demo salvos em navegadores sao limpos automaticamente quando contiverem marcadores conhecidos.
- Posts criados antes da conexao real com Supabase podem ter existido apenas no aparelho antigo e precisam ser repostados no beta real.
