'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sun, Zap, Crown, Star, Users, TrendingUp, 
  Shield, Sparkles, ChevronRight, Play, Lock,
  Heart, MessageCircle, Share2, Eye
} from 'lucide-react'
import { useUser } from '@/components/providers/AppProviders'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { MainApp } from '@/components/app/MainApp'

export function LandingPage() {
  const { isLoggedIn } = useUser()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([])

  useEffect(() => {
    const p = Array.from({length: 20}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5
    }))
    setParticles(p)
  }, [])

  if (isLoggedIn) {
    return <MainApp />
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => {}} />
  }

  return (
    <div className="min-h-screen aurora-bg relative overflow-hidden font-poppins">
      {/* Animated particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-500 opacity-20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4 + p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(5,5,8,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}
      >
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
          <div className="w-8 h-8 rounded-xl gradient-purple flex items-center justify-center">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">OnlyDay</span>
        </motion.div>
        <motion.button
          onClick={() => setShowOnboarding(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white btn-primary"
        >
          Entrar
        </motion.button>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-strong neon-border mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300 font-medium">A 1ª plataforma premium do Brasil</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
            <span className="text-white">Seu conteúdo,</span>
            <br />
            <span className="text-gradient neon-text">suas regras.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md mx-auto leading-relaxed">
            A rede social que transforma sua criatividade em renda. 
            Monetize cada momento, cada conexão.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <motion.button
            onClick={() => setShowOnboarding(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl btn-primary text-lg font-bold flex items-center gap-2 neon-purple"
          >
            <Zap className="w-5 h-5" />
            Começar Grátis
            <ChevronRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => setShowOnboarding(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl glass-strong border border-white/10 text-white text-lg font-semibold flex items-center gap-2"
          >
            <Play className="w-5 h-5 text-purple-400" />
            Ver Demo
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-6 mb-16 w-full max-w-md"
        >
          {[
            { label: 'Criadores', value: '50K+', icon: Users },
            { label: 'Ganhos', value: 'R$2M+', icon: TrendingUp },
            { label: 'Estrelas', value: '4.9', icon: Star },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center glass-card rounded-2xl p-4"
            >
              <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gradient">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            {
              icon: Crown,
              title: 'Empire Hub',
              desc: 'Dashboard completo de monetização com planos Bronze, Gold e Diamond',
              color: 'from-yellow-500/20 to-orange-500/20',
              delay: 0.9
            },
            {
              icon: Lock,
              title: 'The Vault',
              desc: '3 momentos grátis por dia, demais são pagos via Pix - você define o preço',
              color: 'from-purple-500/20 to-pink-500/20',
              delay: 1.0
            },
            {
              icon: Zap,
              title: 'OnlyAuction',
              desc: 'Leilão de atenção: fãs dão lances para ter sua resposta imediata',
              color: 'from-blue-500/20 to-purple-500/20',
              delay: 1.1
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feat.delay }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${feat.color} cursor-pointer`}
            >
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center mb-3">
                <feat.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-3">Criadores que <span className="text-gradient">faturam</span></h2>
          <p className="text-white/50">Histórias reais de quem monetiza no OnlyDay</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            { name: 'Luna Estrela', role: 'Criadora de Conteúdo', earning: 'R$ 18.500/mês', avatar: 'Luna', text: '"Em 3 meses já superei meu salário anterior. O OnlyAuction é incrível!"' },
            { name: 'Kai Noir', role: 'Fotógrafo', earning: 'R$ 12.000/mês', avatar: 'Kai', text: '"O The Vault me permite monetizar cada clique. Simplesmente perfeito."' },
          ].map((creator, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${creator.avatar}`}
                  alt={creator.name} className="w-12 h-12 rounded-full ring-2 ring-purple-500"
                />
                <div>
                  <div className="text-white font-semibold flex items-center gap-1">
                    {creator.name} <Shield className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="text-white/50 text-xs">{creator.role}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-gradient font-bold text-sm">{creator.earning}</div>
                  <div className="text-white/40 text-xs">média mensal</div>
                </div>
              </div>
              <p className="text-white/60 text-sm italic">{creator.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-10 max-w-lg mx-auto neon-border"
        >
          <div className="w-16 h-16 gradient-purple rounded-2xl flex items-center justify-center mx-auto mb-4 glow-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">
            Pronto para <span className="text-gradient">dominar?</span>
          </h2>
          <p className="text-white/50 mb-6">Junte-se aos melhores criadores do Brasil</p>
          <motion.button
            onClick={() => setShowOnboarding(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl btn-primary text-lg font-bold neon-purple"
          >
            Criar minha conta gratuita
          </motion.button>
        </motion.div>
      </section>

      <footer className="text-center py-8 text-white/30 text-sm">
        © 2025 OnlyDay. Todos os direitos reservados.
      </footer>
    </div>
  )
}
