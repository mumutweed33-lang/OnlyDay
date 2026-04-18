# Fase 1 - Beta Fechado

Objetivo:
- deixar a OnlyDay pronta para testes reais com um grupo pequeno
- reduzir erros de fluxo antes de monetizacao real e abertura publica

## 1. Acesso e sessao
- [ ] Cadastro novo funcionando ponta a ponta
- [ ] Login com conta existente funcionando
- [ ] Logout voltando para a home publica
- [ ] Recuperacao de senha disparando corretamente
- [ ] Sessao persistindo apos refresh
- [ ] Diferenca clara entre conta comum e conta criador

## 2. Home publica e onboarding
- [ ] Landing carregando sem erro
- [ ] CTA `Entrar` abrindo login
- [ ] CTA `Comecar Gratis` abrindo cadastro
- [ ] CTA `Ver Demo` levando para bloco real
- [ ] Footer com links validos
- [ ] Termos, Privacidade, FAQ, Precos e Contato acessiveis
- [ ] Cadastro com senha minima, confirmacao e aceite legal
- [ ] Camera so ativando apos acao explicita do usuario

## 3. Feed principal
- [ ] Feed carregando com posts
- [ ] Like, save, share e comentarios respondendo
- [ ] Menu `...` com acoes coerentes
- [ ] Post proprio com comportamento de dono
- [ ] Hashtags navegando para descoberta
- [ ] Detalhe de post abrindo
- [ ] Notificacoes abrindo e marcando leitura

## 4. Explorar
- [ ] Busca funcionando por perfil, hashtag e assunto
- [ ] Radar do dia funcionando
- [ ] Tendencias clicaveis
- [ ] Cards de criador abrindo perfil
- [ ] Follow atualizando estado e contagem
- [ ] Resultados sem telas mortas

## 5. Momentos
- [ ] Barra de momentos carregando
- [ ] Viewer abrindo sem travar
- [ ] Navegacao entre momentos do mesmo criador funcionando
- [ ] Navegacao para o proximo criador funcionando
- [ ] Seu Momento abrindo fluxo de criacao
- [ ] Paywall de momentos deixando claro o estado demo

## 6. Perfil proprio e perfil publico
- [ ] Meu perfil abrindo como perfil proprio
- [ ] Perfil de outra pessoa abrindo como perfil publico
- [ ] Editar perfil carregando dados atuais
- [ ] Dashboard aparecendo so para criador
- [ ] Botao de mensagem presente no perfil publico
- [ ] Grades de posts abrindo detalhe

## 7. Chat
- [ ] Lista de conversas abrindo
- [ ] Entrar na conversa sem cair em loop de navegacao
- [ ] Modal de conexao premium com CTA claro
- [ ] Abrir conversa funcionando
- [ ] Composer fixo e utilizavel
- [ ] Envio de mensagem com feedback visual
- [ ] Envio de conteudo premium mock funcionando

## 8. Publicacao
- [ ] Modal de novo post abrindo
- [ ] Publicacao comum funcionando
- [ ] Publicacao premium exigindo preco valido
- [ ] Feedback claro apos publicar

## 9. Estabilidade tecnica
- [x] `tsc --noEmit` passando
- [x] `npm run build` passando
- [x] Site publicado carregando na Vercel
- [ ] Sem erros criticos visiveis para o usuario final

## 10. Criterio de saida da Fase 1
- [ ] Nenhum erro bloqueando uso principal do app
- [ ] UX principal coerente para teste com usuarios reais
- [ ] Base pronta para iniciar Fase 2 de monetizacao real
