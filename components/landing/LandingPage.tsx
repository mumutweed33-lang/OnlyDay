'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronRight,
  Crown,
  Gem,
  Lock,
  Menu,
  MessageCircle,
  Search,
  Shield,
  Sparkles,
  Star,
  Wallet,
  Zap,
} from 'lucide-react'
import { MainApp } from '@/components/app/MainApp'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useUser } from '@/components/providers/AppProviders'
import { BrandLogo } from '@/components/ui/BrandLogo'
import type { LoginMode } from '@/components/providers/UserContext'

const creatorTools = [
  {
    icon: Lock,
    title: 'Conteudo exclusivo',
    text: 'Publique posts, fotos e momentos para quem realmente acompanha seu trabalho.',
  },
  {
    icon: MessageCircle,
    title: 'Chat com contexto',
    text: 'Converse com seguidores, responda interesses reais e receba notificacoes das interacoes.',
  },
  {
    icon: Wallet,
    title: 'Operacao premium',
    text: 'Centralize crescimento, planos, saldo e movimentos importantes em uma experiencia simples.',
  },
]

const reasons = [
  'Perfil com identidade premium',
  'Busca real por @username',
  'Feed, mensagens e notificacoes',
  'Ambiente pronto para monetizacao',
]

const plans = [
  {
    name: 'Gratis',
    price: 'R$0',
    note: 'Para testar a plataforma e montar presenca.',
    features: ['Criar perfil', 'Buscar usuarios reais', 'Publicar conteudo publico'],
    cta: 'Comecar Gratis',
    featured: false,
  },
  {
    name: 'Creator Pro',
    price: 'R$29',
    note: 'Para criadores que querem monetizar melhor.',
    features: ['Tudo do Gratis', 'Conteudo exclusivo', 'Dashboard financeiro', 'Momentos premium'],
    cta: 'Comecar como Creator',
    featured: true,
  },
]

const faqs = [
  {
    question: 'O que e o OnlyDay?',
    answer: 'Uma rede social premium para criadores, influenciadores e comunidades que querem publicar, conversar e monetizar com mais clareza.',
  },
  {
    question: 'Ja funciona entre dispositivos?',
    answer: 'Sim. As contas, buscas, mensagens e notificacoes usam Supabase, entao usuarios reais conseguem se encontrar em celulares diferentes.',
  },
  {
    question: 'Precisa confirmar e-mail?',
    answer: 'Sim. Cada conta passa por verificacao de e-mail antes de entrar, para manter a comunidade mais confiavel.',
  },
]

function PhonePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: 0.2, duration: 0.7 }}
      className="relative mx-auto w-full max-w-[310px]"
    >
      <div className="absolute -inset-8 rounded-[56px] bg-violet-600/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[42px] border border-white/12 bg-[#07070b] p-3 shadow-[0_34px_110px_rgba(0,0,0,0.55)]">
        <div className="rounded-[32px] border border-white/8 bg-black">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-4">
            <div className="flex items-center gap-2">
              <BrandLogo size={28} />
              <span className="text-sm font-black">OnlyDay</span>
            </div>
            <div className="flex items-center gap-3 text-white/55">
              <Search className="h-4 w-4" />
              <Bell className="h-4 w-4 text-violet-300" />
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex gap-3 overflow-hidden">
              {['Ana', 'Bia', 'Leo', 'Nina'].map((name, index) => (
                <div key={name} className="flex-shrink-0 text-center">
                  <div className="mb-1 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-300 p-[2px]">
                    <div className="h-12 w-12 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.7),rgba(124,58,237,0.3)_38%,rgba(8,8,12,1)_75%)]" />
                  </div>
                  <span className="text-[10px] text-white/45">{name}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,#e9d5ff,#7c3aed_52%,#111)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm font-bold">
                    Camila Vox <BadgeCheck className="h-3.5 w-3.5 text-violet-300" />
                  </div>
                  <div className="text-xs text-white/35">@camilavox</div>
                </div>
              </div>
              <div className="mb-3 h-44 rounded-[24px] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.55),transparent_18%),linear-gradient(135deg,#29124b,#08080d_48%,#6d28d9)]" />
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>128 curtidas</span>
                <span>24 mensagens</span>
              </div>
            </div>

            <div className="rounded-3xl border border-violet-400/20 bg-violet-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Gem className="h-4 w-4 text-violet-200" />
                Notificacao nova
              </div>
              <p className="text-xs leading-5 text-white/55">
                Lucas Silva comecou a seguir voce e enviou uma mensagem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function LandingPage() {
  const { isLoggedIn } = useUser()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingMode, setOnboardingMode] = useState<LoginMode>('signUp')
  const [openFaq, setOpenFaq] = useState(0)

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

  return (
    <main className="min-h-screen overflow-hidden bg-[#030306] font-poppins text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,0.13),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_28%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/6 bg-black/55 px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <BrandLogo size={30} />
            <span className="text-lg font-black tracking-tight">OnlyDay</span>
          </button>

          <nav className="hidden items-center gap-8 text-sm text-white/50 md:flex">
            <a href="#recursos" className="transition hover:text-white">Recursos</a>
            <a href="#planos" className="transition hover:text-white">Planos</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openSignIn}
              className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-violet-300/30 hover:text-white sm:block"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={openSignUp}
              className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-[0_16px_40px_rgba(124,58,237,0.32)] transition hover:bg-violet-500"
            >
              Criar conta
            </button>
            <Menu className="h-5 w-5 text-white/35 md:hidden" />
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 pb-20 pt-28 lg:grid-cols-[1.02fr_0.98fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/18 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/80"
          >
            <Sparkles className="h-3.5 w-3.5" />
            feito para criadores influentes
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-7xl"
          >
            Compartilhe.
            <br />
            Conecte.
            <br />
            <span className="text-gradient">Monetize.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-6 max-w-xl text-base leading-7 text-white/62 sm:text-lg"
          >
            Uma rede social premium onde criadores transformam audiencia em comunidade,
            conversas em relacionamento e conteudo em uma operacao mais profissional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <button
              type="button"
              onClick={openSignUp}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 text-sm font-black text-white shadow-[0_22px_55px_rgba(124,58,237,0.36)] transition hover:bg-violet-500"
            >
              Comece como Criador
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={openSignIn}
              className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-bold text-white/80 transition hover:border-violet-300/30 hover:text-white"
            >
              Ja tenho conta
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {reasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2 text-sm text-white/58">
                <Star className="h-4 w-4 fill-violet-400/30 text-violet-300" />
                {reason}
              </div>
            ))}
          </motion.div>
        </div>

        <PhonePreview />
      </section>

      <section id="recursos" className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">estrutura clara</p>
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Tudo que voce precisa para <span className="text-gradient">brilhar</span>.
          </h2>
          <p className="mt-4 text-white/52">
            Menos confusao na entrada. Mais foco no que importa: perfil, conteudo, relacionamento e dinheiro.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {creatorTools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[28px] border border-white/8 bg-white/[0.035] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.22)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12 ring-1 ring-violet-300/15">
                <tool.icon className="h-5 w-5 text-violet-200" />
              </div>
              <h3 className="mb-2 text-lg font-black">{tool.title}</h3>
              <p className="text-sm leading-6 text-white/50">{tool.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[34px] border border-white/8 bg-[linear-gradient(145deg,rgba(124,58,237,0.16),rgba(255,255,255,0.03)_45%,rgba(0,0,0,0.35))] p-7">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-black/35 ring-1 ring-white/10">
              <Shield className="h-6 w-6 text-violet-200" />
            </div>
            <h2 className="mb-3 text-3xl font-black tracking-[-0.04em]">Sem deixar duvida.</h2>
            <p className="text-sm leading-7 text-white/55">
              A pessoa entra e entende rapido: criar perfil, explorar conteudo, conversar e acompanhar notificacoes.
              O visual passa seguranca sem parecer complicado.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Verificacao', 'Cadastro com e-mail confirmado antes de entrar.'],
              ['Descoberta', 'Usuarios reais encontrados por nome ou @username.'],
              ['Interacao', 'Seguir, mensagem, curtida e comentario com notificacao.'],
              ['Premium', 'Caminho natural para conteudo exclusivo e planos.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-2 text-sm font-black text-white">{title}</div>
                <p className="text-sm leading-6 text-white/45">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Planos para cada <span className="text-gradient">momento</span>
          </h2>
          <p className="mt-3 text-white/50">Comece simples. Evolua quando sua comunidade pedir mais.</p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                'relative rounded-[32px] border p-6 ' +
                (plan.featured
                  ? 'border-violet-400/40 bg-violet-500/10 shadow-[0_24px_80px_rgba(124,58,237,0.18)]'
                  : 'border-white/8 bg-white/[0.035]')
              }
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-4 py-1 text-xs font-black">
                  Mais popular
                </div>
              )}
              <h3 className="text-xl font-black">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/45">{plan.note}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="text-5xl font-black tracking-[-0.06em]">{plan.price}</span>
                {plan.price !== 'R$0' && <span className="pb-2 text-sm text-white/45">/mes</span>}
              </div>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-white/62">
                    <BadgeCheck className="h-4 w-4 text-violet-300" />
                    {feature}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={openSignUp}
                className={
                  'mt-7 w-full rounded-2xl px-5 py-3 text-sm font-black transition ' +
                  (plan.featured
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'border border-white/12 text-white/80 hover:border-violet-300/35 hover:text-white')
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="relative mx-auto max-w-4xl px-5 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Perguntas <span className="text-gradient">frequentes</span>
          </h2>
          <p className="mt-3 text-white/50">Tudo que precisa ficar claro antes da pessoa criar conta.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <button
              key={faq.question}
              type="button"
              onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              className="w-full rounded-[24px] border border-white/8 bg-white/[0.035] p-5 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-black">{faq.question}</span>
                <ChevronDown className={'h-4 w-4 text-violet-300 transition ' + (openFaq === index ? 'rotate-180' : '')} />
              </div>
              {openFaq === index && <p className="mt-3 text-sm leading-6 text-white/48">{faq.answer}</p>}
            </button>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-5 py-16 text-center">
        <div className="rounded-[38px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),rgba(255,255,255,0.035)_45%,rgba(0,0,0,0.34))] p-8 shadow-[0_28px_100px_rgba(0,0,0,0.32)] sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-black/35 ring-1 ring-white/10">
            <Crown className="h-7 w-7 text-violet-200" />
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Sua comunidade merece uma entrada premium.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/52">
            Crie sua conta, confirme seu e-mail e comece a construir uma presenca mais forte dentro do OnlyDay.
          </p>
          <button
            type="button"
            onClick={openSignUp}
            className="mt-7 rounded-2xl bg-violet-600 px-8 py-4 text-sm font-black text-white shadow-[0_22px_55px_rgba(124,58,237,0.34)] transition hover:bg-violet-500"
          >
            Criar conta agora
          </button>
        </div>
      </section>

      <footer className="relative border-t border-white/6 px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 text-sm text-white/42 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <BrandLogo size={30} />
              <span className="text-lg font-black text-white">OnlyDay</span>
            </div>
            <p className="max-w-sm leading-6">Rede social premium para criadores, influenciadores e comunidades com relacionamento real.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/24">Plataforma</div>
              <button type="button" onClick={openSignUp} className="block transition hover:text-white">Criar conta</button>
              <button type="button" onClick={openSignIn} className="block transition hover:text-white">Entrar</button>
            </div>
            <div className="space-y-2">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/24">Suporte</div>
              <Link href="/faq" className="block transition hover:text-white">FAQ</Link>
              <Link href="/contato" className="block transition hover:text-white">Contato</Link>
            </div>
            <div className="space-y-2">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/24">Legal</div>
              <Link href="/termos" className="block transition hover:text-white">Termos</Link>
              <Link href="/privacidade" className="block transition hover:text-white">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
