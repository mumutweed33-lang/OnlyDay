# OD Core

OD Core e o sistema proprietario de recomendacao da OnlyDay.

## Modulos
- `OD Signal`: coleta e consolida eventos do produto
- `OD Discover`: descoberta e cold start
- `OD Rank`: ranking do feed principal
- `OD Bond`: aprofundamento da relacao fa-criador
- `OD Vault`: ordenacao de conteudo premium
- `OD Auction`: distribuicao de leiloes
- `OD Explain`: explicador de alcance para o Empire Hub

## Funcao objetivo
OD Core nao otimiza tempo de tela. Ele otimiza:
- LTV do fa
- retencao do assinante
- saude da cauda longa de criadores
- monetizacao premium com baixa erosao de marca

## Score v1
`final_score = payment_intent + bond + freshness + creator_quality + content_quality + diversity + discovery - risk - saturation`

Pesos da v1 em `supabase/od-core.sql`:
- `payment_intent_score * 0.30`
- `bond_score * 0.22`
- `freshness_score * 0.14`
- `creator_quality_score * 0.14`
- `content_quality_score * 0.10`
- `diversity_score * 0.05`
- `discovery_score * 0.05`
- `risk_penalty * 0.18`
- `saturation_penalty * 0.12`

## Superficies cobertas
A tabela `public.od_rank_scores` ja nasce preparada para:
- `feed`
- `explore`
- `vault`
- `auction`
- `chat_vip`

## Tabelas principais
- `public.od_event_log`
- `public.od_fan_creator_affinity_daily`
- `public.od_fan_niche_affinity_daily`
- `public.od_creator_quality_daily`
- `public.od_content_quality_daily`
- `public.od_rank_scores`
- `public.od_post_score_factors`
- `public.od_reach_explanations`

## Fluxo operacional
1. O app envia eventos para `public.od_event_log`
2. Jobs atualizam afinidade e qualidade
3. Jobs geram `od_rank_scores` por usuario
4. O Empire Hub consulta `od_reach_explanations`
5. O produto usa as superfices rankeadas de acordo com a aba

## Funcoes SQL criadas
- `public.od_event_weight()`
- `public.od_safe_ratio()`
- `public.od_refresh_fan_creator_affinity()`
- `public.od_refresh_fan_niche_affinity()`
- `public.od_refresh_creator_quality()`
- `public.od_refresh_content_quality()`
- `public.od_refresh_rank_scores_for_viewer()`
- `public.od_refresh_reach_explanations()`

## Como aplicar no Supabase
1. Rode primeiro `C:\Users\Guilherme Necto\Desktop\meu-projeto\supabase\schema.sql`
2. Rode depois `C:\Users\Guilherme Necto\Desktop\meu-projeto\supabase\od-core.sql`
3. Configure um cron/job para atualizar snapshots e ranking

## Rotina recomendada
- a cada 5-15 min:
  - `od_refresh_fan_creator_affinity(current_date)`
  - `od_refresh_fan_niche_affinity(current_date)`
  - `od_refresh_content_quality(current_date)`
- a cada 30-60 min:
  - `od_refresh_creator_quality(current_date)`
- por usuario ativo:
  - `od_refresh_rank_scores_for_viewer(<viewer_uuid>, current_date)`
- diariamente:
  - `od_refresh_reach_explanations(current_date)`

## Observacoes importantes
- Esta e uma v1 auditavel e explicavel
- Ela foi pensada para o inicio da OnlyDay, antes de ML pesado
- A proxima evolucao natural e colocar retrieval por embeddings + learning-to-rank
