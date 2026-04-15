'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, TrendingUp, DollarSign, Users, BarChart3, Zap, Star, ArrowUp, ArrowDown, Sparkles, Gift, Lock } from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'

const PLANS = [
  {
    name: 'Bronze',
    icon: '🥉',
    price: 29.90,
    color: 'from-amber-700 to-amber-900',
    border: 'border-amber-700/40',
    features: ['Feed exclusivo', '5 Momentos/dia', 'Chat básico', 'Sem anúncios'],
    tax: '20%',
    subscribers: 234,
  },
  {
    name: 'Gold',
    icon: '🥇',
    price: 69.90,
    color: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-500/40',
    features: ['Tudo do Bronze', 'Momentos ilimitados', 'Chat VIP prioritário', 'Conteúdo 4K'],
    tax: '17%',
    subscribers: 89,
    popular: true,
  },
  {
    name: 'Diamond',
    icon: '💎',
    price: 149.90,
    color: 'from-violet-500 to-purple-700',
    border: 'border-violet-500/40',
    features: ['Tudo do Gold', 'Chamada de vídeo mensal', 'Acesso antecipado', 'Badge exclusivo'],
    tax: '15%',
    subscribers: 41,
  },
]

const TRANSACTIONS = [
  { type: 'assinatura', user: 'Luna_Fan_01', amount: 149.90, plan: 'Diamond', time: '2 min atrás', positive: true },
  { type: 'leilão', user: 'Rafael_Gold', amount: 75.00, plan: 'Leilão', time: '15 min atrás', positive: true },
  { type: 'conteúdo', user: 'Sofia_Vip', amount: 29.90, plan: 'Post', time: '1h atrás', positive: true },
  { type: 'saque', user: 'Você', amount: -500.00, plan: 'Pix', time: '3h atrás', positive: false },
  { type: 'assinatura', user: 'Viktor_Fan', amount: 69.90, plan: 'Gold', time: '5h atrás', positive: true },
]

export function EmpireHub() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAIReport, setShowAIReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  const grossRevenue = 3847.50
  const platformFee = grossRevenue * 0.15
  const netRevenue = grossRevenue - platformFee

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    await new Promise(r => setTimeout(r, 2000))
    setGeneratingReport(false)
    setShowAIReport(true)
  }

  return (
    <div className='min-h-screen bg-dark'>
      <div className='sticky top-0 z-30 glass border-b border-white/5 px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Crown className='w-6 h-6 text-violet-400' />
            <h1 className='text-xl font-black text-white'>Empire Hub</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleGenerateReport}
            className='flex items-center gap-1.5 btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white'
          >
            {generatingReport ? (
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            ) : (
              <Sparkles className='w-4 h-4' />
            )}
            Relatório IA
          </motion.button>
        </div>
        <div className='flex gap-1 mt-3'>
          {['overview', 'plans', 'wallet'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={'flex-1 py-2 rounded-xl text-xs font-semibold transition-all capitalize ' + (activeTab === tab ? 'btn-primary text-white' : 'glass border border-white/10 text-white/50')}
            >
              {tab === 'overview' ? 'Visão Geral' : tab === 'plans' ? 'Planos' : 'Carteira'}
            </button>
          ))}
        </div>
      </div>

      <div className='p-4 space-y-4'>
        {activeTab === 'overview' && (
          <>
            <div className='grid grid-cols-2 gap-3'>
              {[
                { label: 'Receita Bruta', value: 'R$ ' + grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: DollarSign, color: 'text-green-400', trend: '+23%' },
                { label: 'Receita Líquida', value: 'R$ ' + netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), icon: TrendingUp, color: 'text-violet-400', trend: '+23%' },
                { label: 'Assinantes', value: '364', icon: Users, color: 'text-blue-400', trend: '+8' },
                { label: 'Posts Premium', value: '47', icon: BarChart3, color: 'text-amber-400', trend: '+12' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -2 }}
                  className='glass rounded-2xl p-4 border border-white/10'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <stat.icon className={'w-5 h-5 ' + stat.color} />
                    <span className='text-xs text-green-400 font-semibold'>{stat.trend}</span>
                  </div>
                  <div className='text-lg font-black text-white'>{stat.value}</div>
                  <div className='text-xs text-white/40'>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className='glass rounded-2xl p-4 border border-white/10'>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-sm font-semibold text-white'>Taxa da Plataforma</span>
                <span className='text-sm font-bold text-violet-400'>15%</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex-1 h-2 bg-white/10 rounded-full overflow-hidden'>
                  <div className='h-full w-[15%] bg-violet-500 rounded-full' />
                </div>
                <span className='text-xs text-white/40'>R$ {platformFee.toFixed(2)}</span>
              </div>
            </div>

            <div className='glass rounded-2xl p-4 border border-white/10'>
              <h3 className='font-bold text-white mb-3 flex items-center gap-2'><Zap className='w-4 h-4 text-violet-400' />Transações Recentes</h3>
              <div className='space-y-3'>
                {TRANSACTIONS.map((tx, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className={'w-8 h-8 rounded-xl flex items-center justify-center text-xs ' + (tx.positive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                        {tx.positive ? <ArrowUp className='w-4 h-4' /> : <ArrowDown className='w-4 h-4' />}
                      </div>
                      <div>
                        <div className='text-xs font-semibold text-white'>{tx.user}</div>
                        <div className='text-[10px] text-white/30'>{tx.plan} · {tx.time}</div>
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
                className='glass rounded-2xl p-5 border border-violet-500/30'
              >
                <div className='flex items-center gap-2 mb-3'>
                  <Sparkles className='w-5 h-5 text-violet-400' />
                  <span className='font-bold text-white text-sm'>Relatório Gerado por IA</span>
                  <span className='text-xs text-violet-400 glass px-2 py-0.5 rounded-full border border-violet-500/20'>Gemini</span>
                </div>
                <div className='text-sm text-white/70 leading-relaxed space-y-2'>
                  <p>📈 <strong className='text-white'>Crescimento de 23%</strong> este mês comparado ao anterior.</p>
                  <p>💡 <strong className='text-violet-300'>Recomendação:</strong> Publique conteúdo entre 19h-22h para maximizar engajamento.</p>
                  <p>🎯 <strong className='text-white'>364 assinantes ativos</strong>. Meta para próximo mês: 450.</p>
                  <p>💜 Seus fãs Diamond têm <strong className='text-violet-300'>3x mais</strong> probabilidade de renovar a assinatura.</p>
                </div>
                <button className='mt-4 w-full py-2 rounded-xl text-xs text-violet-400 border border-violet-500/20 hover:bg-violet-500/10 transition-colors'>
                  Enviar relatório completo por e-mail
                </button>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'plans' && (
          <div className='space-y-4'>
            <p className='text-sm text-white/50'>Gerencie seus planos de assinatura e preços</p>
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={'glass rounded-3xl p-5 border ' + plan.border + (plan.popular ? ' ring-1 ring-yellow-500/30' : '')}
              >
                {plan.popular && (
                  <div className='flex items-center gap-1 text-xs text-yellow-400 mb-2'>
                    <Star className='w-3 h-3 fill-yellow-400' /> Mais popular
                  </div>
                )}
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className={'w-12 h-12 rounded-2xl bg-gradient-to-br ' + plan.color + ' flex items-center justify-center text-2xl'}>
                      {plan.icon}
                    </div>
                    <div>
                      <div className='font-bold text-white'>{plan.name}</div>
                      <div className='text-xs text-white/40'>Taxa: {plan.tax}</div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xl font-black text-white'>R$ {plan.price.toFixed(2)}</div>
                    <div className='text-xs text-white/40'>{plan.subscribers} assinantes</div>
                  </div>
                </div>
                <div className='space-y-1.5 mb-4'>
                  {plan.features.map((f) => (
                    <div key={f} className='flex items-center gap-2 text-xs text-white/70'>
                      <div className='w-1.5 h-1.5 rounded-full bg-violet-400' />
                      {f}
                    </div>
                  ))}
                </div>
                <button className='w-full py-2.5 rounded-xl text-sm font-semibold glass border border-white/10 text-white/70 hover:border-violet-500/30 hover:text-white transition-all'>
                  Editar Plano
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className='space-y-4'>
            <div className='glass rounded-3xl p-6 border border-violet-500/30 text-center relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-900/10' />
              <div className='relative z-10'>
                <Crown className='w-8 h-8 text-violet-400 mx-auto mb-2' />
                <div className='text-xs text-white/40 mb-1'>Saldo Disponível</div>
                <div className='text-4xl font-black text-gradient mb-1'>
                  R$ {netRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className='text-xs text-white/40'>Atualizado agora</div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='btn-primary py-4 rounded-2xl font-bold text-white flex flex-col items-center gap-1'
              >
                <DollarSign className='w-5 h-5' />
                <span className='text-sm'>Sacar Pix</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='glass border border-white/10 py-4 rounded-2xl font-bold text-white/70 flex flex-col items-center gap-1 hover:border-violet-500/30'
              >
                <Gift className='w-5 h-5' />
                <span className='text-sm'>Histórico</span>
              </motion.button>
            </div>
            <div className='glass rounded-2xl p-4 border border-amber-500/20'>
              <div className='flex items-center gap-2 text-amber-400 mb-2'>
                <Lock className='w-4 h-4' />
                <span className='text-sm font-semibold'>Saque mínimo: R$ 50,00</span>
              </div>
              <p className='text-xs text-white/40'>Taxa OnlyDay: 15% sobre receita bruta. Pix disponível em até 2 dias úteis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}