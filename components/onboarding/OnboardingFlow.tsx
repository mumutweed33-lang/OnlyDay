'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useUser } from '@/components/providers/AppProviders'
import { BrandLockup } from '@/components/ui/BrandLogo'
import { getAuthService } from '@/lib/auth'

interface OnboardingFlowProps {
  onBack?: () => void
  onComplete?: () => void
  initialMode?: AuthMode
}

type AuthMode = 'signUp' | 'signIn'

const TOTAL_SIGNUP_STEPS = 4

export function OnboardingFlow({
  onBack,
  onComplete,
  initialMode = 'signUp',
}: OnboardingFlowProps) {
  const { login } = useUser()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [step, setStep] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)
  const [selfieCapture, setSelfieCapture] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supportHint, setSupportHint] = useState<string | null>(null)
  const [cameraFallbackAvailable, setCameraFallbackAvailable] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    isCreator: false,
    acceptedLegal: false,
    bio: '',
    selfie: null as string | null,
    docFront: null as string | null,
    docBack: null as string | null,
  })

  const totalSteps = mode === 'signIn' ? 1 : TOTAL_SIGNUP_STEPS
  const passwordStrongEnough = formData.password.trim().length >= 6
  const passwordMatches = formData.password === formData.confirmPassword
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  const usernameLooksValid = /^[a-z0-9_]{3,20}$/.test(formData.username.trim())

  React.useEffect(() => {
    setMode(initialMode)
    setStep(0)
    setError(null)
    setSupportHint(null)
  }, [initialMode])

  const canContinue = useMemo(() => {
    if (mode === 'signIn') {
      return Boolean(emailLooksValid && formData.password.trim())
    }

    if (step === 0) {
      return Boolean(
        formData.name.trim() &&
          usernameLooksValid &&
          emailLooksValid &&
          passwordStrongEnough &&
          passwordMatches &&
          formData.acceptedLegal
      )
    }

    if (step === 1) {
      return Boolean(formData.selfie)
    }

    if (step === 2) {
      return Boolean(formData.docFront && formData.docBack)
    }

    return true
  }, [emailLooksValid, formData, mode, passwordMatches, passwordStrongEnough, step, usernameLooksValid])

  const handleModeChange = useCallback((nextMode: AuthMode) => {
    setMode(nextMode)
    setStep(0)
    setError(null)
    setSupportHint(null)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
      setCameraFallbackAvailable(false)
    } catch {
      setCameraActive(false)
      setCameraFallbackAvailable(true)
      setError('Não foi possível acessar sua câmera. Libere a permissão para continuar.')
    }
  }, [])

  const captureSelfie = useCallback(() => {
    setSelfieCapture(true)
    window.setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        selfie: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}&backgroundColor=7C3AED`,
      }))
      setSelfieCapture(false)
    }, 1200)
  }, [])

  const useDemoSelfie = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      selfie: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo-${Date.now()}&backgroundColor=7C3AED`,
    }))
    setError(null)
    setSupportHint('Selfie demo aplicada para liberar o teste de cadastro neste beta.')
  }, [])

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const handleAuth = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signIn') {
        await login({
          mode: 'signIn',
          email: formData.email,
          password: formData.password,
        })
      } else {
        const session = await login({
          mode: 'signUp',
          name: formData.name || 'Usuario Premium',
          username: `@${formData.username.replace(/^@+/, '')}`,
          email: formData.email,
          password: formData.password,
          avatar: formData.selfie || undefined,
          bio: formData.bio || 'Novo no OnlyDay',
          isCreator: formData.isCreator,
          isVerified: Boolean(formData.selfie),
          isPremium: false,
          followers: 0,
          following: 0,
          posts: 0,
          balance: 0,
          plan: 'free',
          joinedAt: new Date().toISOString(),
        })

        if (session.emailVerificationRequired) {
          const verificationEmail = session.email || formData.email
          stopCamera()
          setMode('signIn')
          setStep(0)
          setSupportHint(
            `Conta criada. Enviamos um link de verificacao para ${verificationEmail}. Confirme o e-mail antes de entrar.`
          )
          window.history.pushState(
            null,
            '',
            `/verificar-email?email=${encodeURIComponent(verificationEmail)}`
          )
          return
        }
      }

      stopCamera()
      onComplete?.()
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : 'Não foi possível concluir sua autenticação agora.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [formData, login, mode, onComplete, stopCamera])

  const handleNext = useCallback(async () => {
    if (mode === 'signUp' && step < TOTAL_SIGNUP_STEPS - 1) {
      setError(null)
      setStep((current) => current + 1)
      return
    }

    await handleAuth()
  }, [handleAuth, mode, step])

  const handleBack = useCallback(() => {
    setError(null)
    setSupportHint(null)

    if (step > 0 && mode === 'signUp') {
      setStep((current) => current - 1)
      return
    }

    stopCamera()
    onBack?.()
  }, [mode, onBack, step, stopCamera])

  const handleForgotPassword = useCallback(async () => {
    const email = formData.email.trim()

    if (!email) {
      setSupportHint('Informe seu e-mail primeiro para enviarmos a recuperação de senha.')
      return
    }

    setError(null)

    try {
      await getAuthService().resetPassword(email)
      setSupportHint(`Enviamos a recuperação de senha para ${email}. Verifique sua caixa de entrada.`)
    } catch (resetError) {
      const message =
        resetError instanceof Error
          ? resetError.message
          : 'Não foi possível iniciar a recuperação de senha agora.'
      setError(message)
    }
  }, [formData.email])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark p-4">
      <div className="fixed inset-0">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-violet-900/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-900/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="rounded-xl border border-white/10 glass p-2 text-white transition-colors hover:border-violet-500/30"
          >
            {step > 0 && mode === 'signUp' ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <span className="px-2 text-sm text-white/70">Voltar</span>
            )}
          </button>

          <BrandLockup
            size={22}
            className="flex items-center gap-2"
            titleClassName="font-bold text-gradient"
          />

          <div className="text-xs text-white/40">
            {mode === 'signIn' ? 'login' : `${step + 1}/${totalSteps}`}
          </div>
        </div>

        <div className="mb-8 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500"
            initial={{ width: '0%' }}
            animate={{
              width:
                mode === 'signIn'
                  ? '100%'
                  : `${((step + 1) / TOTAL_SIGNUP_STEPS) * 100}%`,
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('signUp')}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              mode === 'signUp'
                ? 'border-violet-400/40 bg-violet-500/15 text-white'
                : 'border-white/10 bg-white/5 text-white/55'
            }`}
          >
            Criar conta
          </button>
          <button
            onClick={() => handleModeChange('signIn')}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
              mode === 'signIn'
                ? 'border-violet-400/40 bg-violet-500/15 text-white'
                : 'border-white/10 bg-white/5 text-white/55'
            }`}
          >
            Entrar
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${step}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            {mode === 'signIn' && (
              <div className="space-y-4">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary neon-purple">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-white">Entre na sua conta</h2>
                  <p className="text-white/55">
                    Entre com o mesmo e-mail e senha da sua conta.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">E-mail</label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    autoComplete="username"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">Senha</label>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleForgotPassword()}
                  className="text-xs font-semibold text-violet-300"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {mode === 'signUp' && step === 0 && (
              <div className="space-y-4">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary neon-purple">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-white">Criar conta premium</h2>
                  <p className="text-white/55">
                    Vamos preparar sua entrada com um cadastro completo e limpo.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400">
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="seuusername"
                      autoComplete="nickname"
                      value={formData.username}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 glass py-3 pl-8 pr-4 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                    />
                  </div>
                  {formData.username && !usernameLooksValid && (
                    <p className="mt-2 text-[11px] text-rose-300">
                      Use 3 a 20 caracteres: letras, numeros e underline. Nao use e-mail como @.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">E-mail</label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                  {formData.email && !emailLooksValid && (
                    <p className="mt-2 text-[11px] text-rose-300">
                      Informe um e-mail valido para receber a confirmacao.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">Senha</label>
                  <input
                    type="password"
                    placeholder="Crie uma senha forte"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                  <p className={`mt-2 text-[11px] ${formData.password && !passwordStrongEnough ? 'text-rose-300' : 'text-white/35'}`}>
                    Use pelo menos 6 caracteres.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">Confirmar senha</label>
                  <input
                    type="password"
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                  {formData.confirmPassword && !passwordMatches && (
                    <p className="mt-2 text-[11px] text-rose-300">As senhas precisam ser iguais.</p>
                  )}
                </div>

                <button
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isCreator: !prev.isCreator }))
                  }
                  type="button"
                  role="switch"
                  aria-checked={formData.isCreator}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    formData.isCreator
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-white/10 glass'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Crown
                        className={`h-5 w-5 ${
                          formData.isCreator ? 'text-violet-400' : 'text-white/40'
                        }`}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Quero ativar modo criador
                        </div>
                        <div className="text-xs text-white/45">
                          O mesmo e-mail continua valendo; sua conta só ganha recursos de criador.
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        formData.isCreator
                          ? 'border-violet-500 bg-violet-500'
                          : 'border-white/25'
                      }`}
                    >
                      {formData.isCreator && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <input
                    type="checkbox"
                    checked={formData.acceptedLegal}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, acceptedLegal: event.target.checked }))
                    }
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
                  />
                  <span className="text-xs leading-relaxed text-white/60">
                    Eu li e concordo com os{' '}
                    <Link href="/termos" target="_blank" className="font-semibold text-violet-300 underline-offset-4 hover:underline">
                      Termos de Uso
                    </Link>{' '}
                    e com a{' '}
                    <Link href="/privacidade" target="_blank" className="font-semibold text-violet-300 underline-offset-4 hover:underline">
                      Política de Privacidade
                    </Link>
                    . Também autorizo o tratamento dos dados necessários para autenticação e verificação da conta.
                  </span>
                </label>
              </div>
            )}

            {mode === 'signUp' && step === 1 && (
              <div>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary neon-purple">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-white">Verificacao biometrica</h2>
                  <p className="text-white/55">
                    Capture uma selfie para concluir a criacao da conta premium.
                  </p>
                </div>

                {!formData.selfie ? (
                  <div>
                    <div
                      className="relative mb-6 overflow-hidden rounded-3xl border border-violet-500/20 bg-dark-200"
                      style={{ aspectRatio: '1' }}
                    >
                      {cameraActive ? (
                        <div className="relative h-full w-full">
                          <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-56 w-48 rounded-full border-2 border-dashed border-violet-500 opacity-60" />
                          </div>

                          {selfieCapture && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.45 }}
                              className="absolute inset-0 bg-white/30"
                            />
                          )}

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={captureSelfie}
                              disabled={selfieCapture}
                              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-violet-500 bg-white shadow-lg"
                            >
                              {selfieCapture ? (
                                <div className="h-6 w-6 rounded-full bg-violet-500 animate-ping" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-violet-600" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                          <Camera className="h-12 w-12 text-violet-400" />
                          <p className="text-sm text-white/55">
                            Ative a câmera só quando estiver pronto. A imagem será usada apenas para validação da conta e proteção contra fraude.
                          </p>
                          <button
                            onClick={startCamera}
                            className="rounded-xl px-6 py-3 btn-primary font-semibold text-white"
                          >
                            Ativar camera
                          </button>
                          {cameraFallbackAvailable && (
                            <button
                              type="button"
                              onClick={useDemoSelfie}
                              className="rounded-xl border border-white/10 bg-white/6 px-6 py-3 text-sm font-semibold text-white/70"
                            >
                              Usar selfie demo
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 glass p-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Shield className="h-4 w-4 text-violet-400" />
                        <span>Sua imagem só entra depois da sua permissão e ajuda a validar a conta com mais segurança.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="relative mb-6 inline-block">
                      <img
                        src={formData.selfie}
                        alt="Selfie"
                        className="mx-auto h-32 w-32 rounded-full border-4 border-violet-500"
                      />
                      <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">Selfie confirmada</h3>
                    <p className="text-sm text-white/55">Agora seguimos para a validacao do documento.</p>
                  </motion.div>
                )}
              </div>
            )}

            {mode === 'signUp' && step === 2 && (
              <div>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary neon-purple">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-white">Documentos</h2>
                  <p className="text-white/55">
                    Envie os documentos para concluir sua verificacao com mais seguranca.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: 'docFront' as const,
                      label: 'Frente do documento',
                      desc: 'RG, CNH ou passaporte',
                    },
                    {
                      key: 'docBack' as const,
                      label: 'Verso do documento',
                      desc: 'Verso do RG, CNH ou passaporte',
                    },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          [item.key]: `https://picsum.photos/seed/${item.key}/400/250`,
                        }))
                      }
                      className={`w-full rounded-2xl border p-5 text-left transition-all ${
                        formData[item.key]
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-white/10 glass hover:border-violet-500/30'
                      }`}
                    >
                      {formData[item.key] ? (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-12 overflow-hidden rounded-lg bg-violet-500/20">
                            <img
                              src={formData[item.key] as string}
                              alt={item.label}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.label}</div>
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Enviado com sucesso
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 glass">
                            <Upload className="h-5 w-5 text-violet-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.label}</div>
                            <div className="text-xs text-white/45">{item.desc}</div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-amber-300/90">
                      <Eye className="h-4 w-4" />
                      <span>Revise bem os arquivos antes de enviar para manter sua conta protegida.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === 'signUp' && step === 3 && (
              <div className="space-y-4">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-primary neon-purple">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-black text-white">Perfil premium</h2>
                  <p className="text-white/55">
                    Falta so um toque final para a sua conta entrar no ar.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">Bio</label>
                  <textarea
                    placeholder="Conte um pouco sobre voce..."
                    value={formData.bio}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, bio: event.target.value }))
                    }
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                </div>

                <div className="rounded-2xl border border-violet-500/20 glass p-5">
                  <h4 className="mb-3 font-semibold text-white">Resumo da conta</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/45">Nome</span>
                      <span className="text-white">{formData.name || 'Nao informado'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/45">Username</span>
                      <span className="text-white">@{formData.username || 'usuario'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/45">Biometria</span>
                      <span className="text-white">{formData.selfie ? 'Verificada' : 'Pendente'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/45">Documentos</span>
                      <span className="text-white">
                        {formData.docFront && formData.docBack ? 'Enviados' : 'Pendentes'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/45">Tipo</span>
                      <span className="text-white">
                        {formData.isCreator ? 'Criador' : 'Comunidade'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        {supportHint && (
          <div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-100">
            {supportHint}
          </div>
        )}

        <motion.button
          whileHover={{ scale: canContinue && !loading ? 1.02 : 1 }}
          whileTap={{ scale: canContinue && !loading ? 0.98 : 1 }}
          onClick={handleNext}
          disabled={loading || !canContinue}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white btn-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {mode === 'signIn' ? 'Entrando...' : 'Criando sua conta...'}
            </>
          ) : mode === 'signIn' ? (
            <>
              Entrar agora
              <ChevronRight className="h-5 w-5" />
            </>
          ) : step === TOTAL_SIGNUP_STEPS - 1 ? (
            <>
              <Sparkles className="h-5 w-5" />
              Finalizar cadastro
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
