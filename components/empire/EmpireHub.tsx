'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, BarChart3, Crown, DollarSign, Gift, Lock, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const PLANS = [
  {
    name: 'Bronze',
    icon: 'B',
    price: 29.9,
    color: 'from-amber-700 to-amber-900',
    border: 'border-amber-700/40',
    features: ['Feed exclusivo', '5 Momentos por dia', 'Chat basico', 'Sem anuncios'],
    tax: '20%',
    subscribers: 234,
  },
  {
    name: 'Gold',
    icon: 'G',
    price: 69.9,
    color: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-500/40',
    features: ['Tudo do Bronze', 'Momentos ilimitados', 'Chat VIP prioritario', 'Conteudo 4K'],
    tax: '17%',
    subscribers: 89,
    popular: true,
  },
  {
    name: 'Diamond',
    icon: 'D',
    price: 149.9,
    color: 'from-violet-500 to-purple-700',
    border: 'border-violet-500/40',
    features: ['Tudo do Gold', 'Chamada mensal', 'Acesso antecipado', 'Badge exclusivo'],
    tax: '15%',
    subscribers: 41,
  },
]

const TRANSACTIONS = [
  { user: 'Luna_Fan_01', amount: 149.9, plan: 'Diamond', time: '2 min atras', positive: true },
  { user: 'Rafael_Gold', amount: 75, plan: 'Leilao', time: '15 min atras', positive: true },
  { user: 'Sofia_Vip', amount: 29.9, plan: 'Post', time: '1h atras', positive: true },
  { user: 'Voce', amount: -500, plan: 'Pix', time: '3h atras', positive: false },
]

interface ReachExplanationRow {
  snapshot_date: string
  post_id: string
  impressions: number
  relative_reach_delta: number
  primary_positive_reason: string | null
  primary_negative_reason: string | null
}

interface CreatorQualityRow {
  snapshot_date: string
  posting_consistency_score: number
  chat_reply_score: number
  subscriber_health_score: number
  monetization_balance_score: number
  safety_score: number
  creator_quality_score: number
}

interface PostScoreFactorRow {
  snapshot_at: string
  post_id: string
  factor_key: string
  factor_value: number
  factor_direction: 'positive' | 'negative'
  explanation: string
}

export function EmpireHub() {
  const { user } = useUser()
  const { posts } = usePosts()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAIReport, setShowAIReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reachExplanations, setReachExplanations] = useState<ReachExplanationRow[]>([])
  const [creatorQuality, setCreatorQuality] = useState<CreatorQualityRow | null>(null)
  const [postScoreFactors, setPostScoreFactors] = useState<PostScoreFactorRow[]>([])
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!actionFeedback) return
    const timeout = window.setTimeout(() => setActionFeedback(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [actionFeedback])

  useEffect(() => {
    let cancelled = false

    async function loadReachExplanations() {
      if (!user?.id || !user.isCreator) {
        setReachExplanations([])
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_reach_explanations')
          .select('snapshot_date, post_id, impressions, relative_reach_delta, primary_positive_reason, primary_negative_reason')
          .eq('creator_profile_id', user.id)
          .order('snapshot_date', { ascending: false })
          .order('impressions', { ascending: false })
          .limit(4)

        if (error) {
          console.warn('[od-core] reach explanations unavailable for empire hub', error.message)
          if (!cancelled) setReachExplanations([])
          return
        }

        if (!cancelled) {
          setReachExplanations((data as ReachExplanationRow[]) ?? [])
        }
      } catch (error) {
        console.error('[od-core] failed to load reach explanations', error)
        if (!cancelled) setReachExplanations([])
      }
    }

    void loadReachExplanations()

    return () => {
      cancelled = true
    }
  }, [user?.id, user?.isCreator])

  useEffect(() => {
    let cancelled = false

    async function loadPostScoreFactors() {
      if (!user?.id || !user.isCreator) {
        setPostScoreFactors([])
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_post_score_factors')
          .select('snapshot_at, post_id, factor_key, factor_value, factor_direction, explanation')
          .eq('viewer_profile_id', user.id)
          .order('snapshot_at', { ascending: false })
          .limit(24)

        if (error) {
          console.warn('[od-core] post score factors unavailable for empire hub', error.message)
          if (!cancelled) setPostScoreFactors([])
          return
        }

        if (!cancelled) {
          setPostScoreFactors((data as PostScoreFactorRow[]) ?? [])
        }
      } catch (error) {
        console.error('[od-core] failed to load post score factors', error)
        if (!cancelled) setPostScoreFactors([])
      }
    }

    void loadPostScoreFactors()

    return () => {
      cancelled = true
    }
  }, [user?.id, user?.isCreator])

  useEffect(() => {
    let cancelled = false

    async function loadCreatorQuality() {
      if (!user?.id || !user.isCreator) {
        setCreatorQuality(null)
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_creator_quality_daily')
          .select('snapshot_date, posting_consistency_score, chat_reply_score, subscriber_health_score, monetization_balance_score, safety_score, creator_quality_score')
          .eq('creator_profile_id', user.id)
          .order('snapshot_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          console.warn('[od-core] creator quality unavailable for empire hub', error.message)
          if (!cancelled) setCreatorQuality(null)
          return
        }

        if (!cancelled) {
          setCreatorQuality((data as CreatorQualityRow | null) ?? null)
        }
      } catch (error) {
        console.error('[od-core] failed to load creator quality', error)
        if (!cancelled) setCreatorQuality(null)
      }
    }

    void loadCreatorQuality()

    return () => {
      cancelled = true
    }
  }, [user?.id, user?.isCreator])

  const postPreviewById = useMemo(
    () =>
      new Map(
        posts.map((post) => [
          post.id,
          post.content.trim().slice(0, 96) || 'Post premium sem texto',
        ])
      ),
    [posts]
  )

  const factorHighlights = useMemo(() => {
    const grouped = new Map<
      string,
      {
        snapshotAt: string
        positive: PostScoreFactorRow[]
        negative: PostScoreFactorRow[]
      }
    >()

    for (const factor of postScoreFactors) {
      const current = grouped.get(factor.post_id) ?? {
        snapshotAt: factor.snapshot_at,
        positive: [],
        negative: [],
      }

      if (factor.snapshot_at > current.snapshotAt) {
        current.snapshotAt = factor.snapshot_at
        current.positive = []
        current.negative = []
      }

      if (factor.snapshot_at === current.snapshotAt) {
        if (factor.factor_direction === 'positive') {
          current.positive.push(factor)
        } else {
          current.negative.push(factor)
        }
      }

      grouped.set(factor.post_id, current)
    }

    return Array.from(grouped.entries())
      .map(([postId, factors]) => ({
        postId,
        snapshotAt: factors.snapshotAt,
        positive: [...factors.positive].sort((a, b) => b.factor_value - a.factor_value).slice(0, 2),
        negative: [...factors.negative].sort((a, b) => b.factor_value - a.factor_value).slice(0, 2),
      }))
      .slice(0, 4)
  }, [postScoreFactors])

  const grossRevenue = 3847.5
  const platformFee = grossRevenue * 0.15
  const netRevenue = grossRevenue - platformFee

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    await new Promise((r) => setTimeout(r, 1600))
    setGeneratingReport(false)
    setShowAIReport(true)
  }

  return (
    <div className="min-h-screen bg-dark pb-28">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,4,12,0.84)] px-4 py-4 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-violet-300/15">
              <Crown className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Empire Hub</h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">creator revenue room</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateReport}
            className="flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_26px_rgba(124,58,237,0.35)]"
          >
            {generatingReport ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Relatorio IA
          </motion.button>
        </div>

        <div className="flex gap-2">
          {['overview', 'plans', 'wallet'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all ' +
                (activeTab === tab
                  ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_12px_26px_rgba(124,58,237,0.35)]'
                  : 'border border-white/10 bg-white/6 text-white/50')
              }
            >
              {tab === 'overview' ? 'Visao Geral' : tab === 'plans' ? 'Planos' : 'Carteira'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {actionFeedback && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
            {actionFeedback}
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="rounded-[28px] border border-white/8 bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/30">Panorama</p>
                  <p className="mt-1 text-sm text-white/72">Receita, recorrencia e sinais do que esta puxando mais resposta.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/15">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Receita Bruta', value: 'R$ ' + grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: DollarSign, color: 'text-green-400', trend: '+23%' },
                  { label: 'Receita Liquida', value: 'R$ ' + netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: TrendingUp, color: 'text-violet-400', trend: '+23%' },
                  { label: 'Assinantes', value: '364', icon: Users, color: 'text-blue-400', trend: '+8' },
                  { label: 'Posts Premium', value: '47', icon: BarChart3, color: 'text-amber-400', trend: '+12' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <stat.icon className={'h-5 w-5 ' + stat.color} />
                      <span className="text-xs font-semibold text-green-400">{stat.trend}</span>
                    </div>
                    <div className="text-lg font-black text-white">{stat.value}</div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Taxa da plataforma</span>
                <span className="text-sm font-bold text-violet-300">15%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[15%] rounded-full bg-violet-500" />
                </div>
                <span className="text-xs text-white/40">R$ {platformFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
                <Zap className="h-4 w-4 text-violet-400" />
                Transacoes recentes
              </h3>
              <div className="space-y-3">
                {TRANSACTIONS.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={'flex h-8 w-8 items-center justify-center rounded-xl text-xs ' + (tx.positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                        {tx.positive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{tx.user}</div>
                        <div className="text-[10px] text-white/30">{tx.plan} · {tx.time}</div>
                      </div>
                    </div>
                    <span className={'text-sm font-bold ' + (tx.positive ? 'text-green-400' : 'text-red-400')}>
                      {tx.positive ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {showAIReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-violet-500/30 bg-white/[0.045] p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <span className="text-sm font-bold text-white">Resumo de IA</span>
                </div>
                <div className="space-y-2 text-sm leading-relaxed text-white/70">
                  <p>Receita em alta com ganho de 23% no periodo.</p>
                  <p>O plano Diamond segue como maior alavanca de margem.</p>
                  <p>Publicacoes entre 19h e 22h devem performar melhor para conversao.</p>
                </div>
              </motion.div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <h3 className="font-bold text-white">Sinais do OD Core</h3>
              </div>

              {creatorQuality ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Qualidade geral', value: creatorQuality.creator_quality_score, tone: 'text-violet-300' },
                    { label: 'Consistencia', value: creatorQuality.posting_consistency_score, tone: 'text-emerald-300' },
                    { label: 'Resposta no chat', value: creatorQuality.chat_reply_score, tone: 'text-sky-300' },
                    { label: 'Saude dos assinantes', value: creatorQuality.subscriber_health_score, tone: 'text-amber-300' },
                    { label: 'Mix de receita', value: creatorQuality.monetization_balance_score, tone: 'text-pink-300' },
                    { label: 'Seguranca', value: creatorQuality.safety_score, tone: 'text-cyan-300' },
                  ].map((signal) => (
                    <div key={signal.label} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">{signal.label}</div>
                      <div className={`mt-2 text-lg font-black ${signal.tone}`}>
                        {(Number(signal.value ?? 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                  Assim que o OD Core consolidar seu snapshot diario, os sinais de consistencia, resposta e saude da base vao aparecer aqui.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-400" />
                <h3 className="font-bold text-white">Explicador de alcance</h3>
              </div>

              {reachExplanations.length > 0 ? (
                <div className="space-y-3">
                  {reachExplanations.map((item) => {
                    const preview = postPreviewById.get(item.post_id) ?? `Post ${item.post_id.slice(0, 8)}`
                    const delta = Number(item.relative_reach_delta ?? 0)
                    const isPositive = delta >= 0

                    return (
                      <div key={`${item.snapshot_date}-${item.post_id}`} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <div className="line-clamp-2 text-sm font-semibold text-white">{preview}</div>
                            <div className="mt-1 text-[11px] text-white/30">
                              {new Date(item.snapshot_date).toLocaleDateString('pt-BR')} • {item.impressions.toLocaleString('pt-BR')} impressoes
                            </div>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isPositive ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
                            {isPositive ? '+' : ''}{delta.toFixed(1)}%
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-white/58">
                          {item.primary_positive_reason && (
                            <p>
                              <span className="font-semibold text-emerald-300">Subiu porque:</span>{' '}
                              {item.primary_positive_reason}
                            </p>
                          )}
                          {item.primary_negative_reason && (
                            <p>
                              <span className="font-semibold text-amber-300">Limitou porque:</span>{' '}
                              {item.primary_negative_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                  Assim que o `OD Core` acumular impressoes e rodar o refresh de alcance, seus principais motivos de distribuicao vao aparecer aqui.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                <h3 className="font-bold text-white">Fatores por post</h3>
              </div>

              {factorHighlights.length > 0 ? (
                <div className="space-y-3">
                  {factorHighlights.map((item) => {
                    const preview = postPreviewById.get(item.postId) ?? `Post ${item.postId.slice(0, 8)}`
                    return (
                      <div key={`${item.postId}-${item.snapshotAt}`} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                        <div className="mb-2">
                          <div className="line-clamp-2 text-sm font-semibold text-white">{preview}</div>
                          <div className="mt-1 text-[11px] text-white/30">
                            Snapshot {new Date(item.snapshotAt).toLocaleString('pt-BR')}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {item.positive.map((factor) => (
                            <div key={`${item.postId}-${factor.factor_key}-pos`} className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-2">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                                {factor.factor_key.replace(/_/g, ' ')}
                              </div>
                              <div className="mt-1 text-xs text-white/65">{factor.explanation}</div>
                            </div>
                          ))}
                          {item.negative.map((factor) => (
                            <div key={`${item.postId}-${factor.factor_key}-neg`} className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-2">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                                {factor.factor_key.replace(/_/g, ' ')}
                              </div>
                              <div className="mt-1 text-xs text-white/65">{factor.explanation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                  Quando o `OD Core` começar a gravar `od_post_score_factors`, esta area vai mostrar os principais fatores positivos e negativos de cada post.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">Gerencie precos, posicionamento e proposta de valor de cada plano.</p>
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={'rounded-3xl border p-5 ' + plan.border + (plan.popular ? ' ring-1 ring-yellow-500/30' : '') + ' bg-white/[0.045]'}
              >
                {plan.popular && (
                  <div className="mb-2 flex items-center gap-1 text-xs text-yellow-400">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    Mais popular
                  </div>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-black text-white ' + plan.color}>
                      {plan.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white">{plan.name}</div>
                      <div className="text-xs text-white/40">Taxa: {plan.tax}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">R$ {plan.price.toFixed(2)}</div>
                    <div className="text-xs text-white/40">{plan.subscribers} assinantes</div>
                  </div>
                </div>
                <div className="mb-4 space-y-1.5">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-white/70">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setActiveTab('plans')
                    setActionFeedback(`Plano ${plan.name} aberto para edição.`)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/6 py-2.5 text-sm font-semibold text-white/70 transition-all hover:border-violet-500/30 hover:text-white"
                >
                  Editar plano
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-white/[0.045] p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-900/10" />
              <div className="relative z-10">
                <Crown className="mx-auto mb-2 h-8 w-8 text-violet-400" />
                <div className="mb-1 text-xs text-white/40">Saldo disponivel</div>
                <div className="mb-1 text-4xl font-black text-gradient">
                  R$ {netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-white/40">Atualizado agora</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActionFeedback('Fluxo de saque por Pix preparado. Agora entramos na etapa de integração financeira real.')}
                className="flex flex-col items-center gap-1 rounded-2xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] py-4 font-bold text-white shadow-[0_12px_26px_rgba(124,58,237,0.35)]"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Sacar Pix</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActionFeedback('Histórico financeiro destacado. O detalhamento completo entra na próxima etapa da carteira.')}
                className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/6 py-4 font-bold text-white/70"
              >
                <Gift className="h-5 w-5" />
                <span className="text-sm">Historico</span>
              </motion.button>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-semibold">Saque minimo: R$ 50,00</span>
              </div>
              <p className="text-xs text-white/45">Pix disponivel em ate 2 dias uteis. Taxa OnlyDay aplicada sobre receita bruta.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
