'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, BarChart3, Crown, DollarSign, Gift, Lock, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'

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

export function EmpireHub() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAIReport, setShowAIReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

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
                <button className="w-full rounded-xl border border-white/10 bg-white/6 py-2.5 text-sm font-semibold text-white/70 transition-all hover:border-violet-500/30 hover:text-white">
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
                className="flex flex-col items-center gap-1 rounded-2xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] py-4 font-bold text-white shadow-[0_12px_26px_rgba(124,58,237,0.35)]"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Sacar Pix</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
