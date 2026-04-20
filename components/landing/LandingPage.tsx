'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Crown,
  ChevronRight,
  Eye,
  Heart,
  Lock,
  Play,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { MainApp } from '@/components/app/MainApp'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useUser } from '@/components/providers/AppProviders'
import { BrandLockup, BrandLogo } from '@/components/ui/BrandLogo'
import type { LoginMode } from '@/components/providers/UserContext'

type Particle = {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

const STATS = [
  {
    label: 'Beta fechado',
    value: 'Real',
    detail: 'testes com contas reais cadastradas',
    icon: Users,
  },
  {
    label: 'Dados',
    value: 'Sem demo',
    detail: 'feed e busca sem perfis falsos',
    icon: TrendingUp,
  },
  {
    label: 'Conexao',
    value: '@user',
    detail: 'encontre pessoas por nome e username',
    icon: Star,
  },
]

const FEATURES = [
  {
    icon: Crown,
    title: 'Empire Hub',
    desc: 'Dashboard com receita, planos, carteira e leitura clara do que esta puxando crescimento.',
    color: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
  {
    icon: Lock,
    title: 'The Vault',
    desc: 'Momentos e conteudos premium destravados sob demanda, com escassez e valor percebido maiores.',
    color: 'from-fuchsia-500/20 via-violet-500/10 to-transparent',
  },
  {
    icon: Zap,
    title: 'OnlyAuction',
    desc: 'Leiloes de atencao para transformar urgencia e proximidade em uma mecanica de monetizacao.',
    color: 'from-sky-500/20 via-indigo-500/10 to-transparent',
  },
]

export function LandingPage() {
  const { isLoggedIn } = useUser()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingMode, setOnboardingMode] = useState<LoginMode>('signUp')
  const [particles, setParticles] = useState<Particle[]>([])
  const featuresRef = useRef<HTMLElement | null>(null)
  const creatorsRef = useRef<HTMLElement | null>(null)
  const ctaRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const nextParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
    }))
    setParticles(nextParticles)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      setShowOnboarding(false)
    }
  }, [isLoggedIn])

  if (isLoggedIn) {
    return <MainApp />
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        initialMode={onboardingMode}
        onBack={() => setShowOnboarding(false)}
        onComplete={() => {}}
      />
    )
  }

  const openSignIn = () => {
    setOnboardingMode('signIn')
    setShowOnboarding(true)
  }

  const openSignUp = () => {
    setOnboardingMode('signUp')
    setShowOnboarding(true)
  }

  const scrollToBlock = (target: 'features' | 'creators' | 'cta') => {
    const refMap = {
      features: featuresRef,
      creators: creatorsRef,
      cta: ctaRef,
    }

    refMap[target].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508] font-poppins text-white">
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.16),_transparent_32%),radial-gradient(circle_at_20%_80%,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(236,72,153,0.12),_transparent_22%)]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <motion.div
        aria-hidden
        className="absolute -top-16 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.22, 0.4, 0.22] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-purple-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{ y: [-18, 18, -18], opacity: [0.12, 0.4, 0.12] }}
          transition={{ duration: 5 + particle.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-6"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-[24px] border border-white/8 bg-black/20 px-3 py-2.5 backdrop-blur-2xl">
          <motion.div whileHover={{ scale: 1.02 }}>
            <BrandLockup subtitle="premium social commerce" />
          </motion.div>

          <motion.button
            onClick={openSignIn}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border border-violet-300/25 bg-white/7 px-5 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            Entrar
          </motion.button>
        </div>
      </motion.header>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-white/55"
        >
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
            onboarding guiado para criadores
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            feed, chat VIP e monetizacao no mesmo fluxo
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex items-center gap-2 rounded-full border border-violet-300/20 bg-white/6 px-5 py-2.5 text-sm text-violet-200 shadow-[0_0_30px_rgba(124,58,237,0.12)] backdrop-blur-xl"
        >
          <Sparkles className="h-4 w-4 text-violet-300" />
          <span className="font-medium">A 1a plataforma premium do Brasil</span>
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-8 max-w-5xl text-center"
        >
          <h1 className="mb-5 text-5xl font-black leading-[0.95] tracking-[-0.05em] md:text-7xl lg:text-8xl">
            <span className="text-white">Seu conteudo,</span>
            <br />
            <span className="text-gradient neon-text">sua economia.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/72 md:text-xl">
            Uma rede social desenhada para transformar proximidade em recorrencia, escassez em desejo e audiencia em operacao premium.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row"
        >
          <motion.button
            onClick={openSignUp}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center justify-center gap-2 rounded-2xl btn-primary px-8 py-4 text-lg font-bold text-white shadow-[0_24px_60px_rgba(124,58,237,0.35)]"
          >
            <Zap className="h-5 w-5" />
            Comecar Gratis
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            onClick={() => scrollToBlock('features')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/7 px-8 py-4 text-lg font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
          >
            <Play className="h-5 w-5 text-cyan-300" />
            Ver Demo
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="mb-16 flex flex-wrap items-center justify-center gap-6 text-sm text-white/45"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-300" />
            entrada guiada com menor friccao
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-300" />
            exclusividade e relacionamento no centro
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-300" />
            interface mobile-first focada em conversao
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-16 grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.62 + index * 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent" />
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-violet-400/25">
                  <stat.icon className="h-5 w-5 text-violet-300" />
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  live
                </span>
              </div>
              <div className="text-3xl font-black text-gradient">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-white/86">{stat.label}</div>
              <div className="mt-2 text-xs text-white/45">{stat.detail}</div>
            </motion.div>
          ))}
        </motion.div>

        <div ref={featuresRef as React.RefObject<HTMLDivElement>} className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78 + index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => scrollToBlock('cta')}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${feature.color} p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-purple shadow-[0_18px_40px_rgba(124,58,237,0.35)]">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <ChevronRight className="h-4 w-4 text-white/35" />
              </div>
              <p className="text-sm leading-relaxed text-white/62">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section ref={creatorsRef} className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-white">
            Comunidade <span className="text-gradient">real</span>
          </h2>
          <p className="text-white/50">
            Nesta fase, so aparecem contas, posts e conexoes criadas por usuarios reais do teste.
          </p>
        </motion.div>

        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">
            <Users className="h-5 w-5 text-violet-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Convide pessoas e teste como rede social</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Cada pessoa cria uma conta com e-mail e senha, depois pode buscar outras contas pelo nome ou @username.
          </p>
        </div>
      </section>

      <section ref={ctaRef} className="px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl rounded-[32px] border border-violet-300/14 bg-white/[0.05] p-10 shadow-[0_26px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 glow-pulse ring-1 ring-white/10">
            <BrandLogo size={64} />
          </div>
          <h2 className="mb-3 text-3xl font-black text-white">
            Pronto para <span className="text-gradient">dominar?</span>
          </h2>
          <p className="mb-6 text-white/55">
            Entre com uma narrativa mais forte, uma interface premium e caminhos claros de monetizacao.
          </p>
          <motion.button
            onClick={openSignUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-2xl btn-primary py-4 text-lg font-bold text-white shadow-[0_20px_50px_rgba(124,58,237,0.35)]"
          >
            Criar minha conta gratuita
          </motion.button>
        </motion.div>
      </section>

      <footer className="border-t border-white/6 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 text-sm text-white/45 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="mb-3">
              <BrandLockup subtitle="premium social commerce" subtitleClassName="text-[11px] uppercase tracking-[0.18em] text-white/28" />
            </div>
            <p className="leading-relaxed">
              Plataforma brasileira de social commerce premium para criadores, fãs e operações de monetização com mais contexto, exclusividade e recorrência.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/28">Produto</div>
              <div className="space-y-2">
                <Link href="/precos" className="block transition hover:text-white">Preços</Link>
                <Link href="/faq" className="block transition hover:text-white">FAQ</Link>
                <Link href="/contato" className="block transition hover:text-white">Contato</Link>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/28">Legal</div>
              <div className="space-y-2">
                <Link href="/termos" className="block transition hover:text-white">Termos de Uso</Link>
                <Link href="/privacidade" className="block transition hover:text-white">Privacidade</Link>
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/28">Lançamento</div>
              <div className="space-y-2">
                <button type="button" onClick={openSignUp} className="block text-left transition hover:text-white">Criar conta</button>
                <button type="button" onClick={openSignIn} className="block text-left transition hover:text-white">Entrar</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/6 pt-5 text-xs text-white/28">
          © 2026 OnlyDay. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
