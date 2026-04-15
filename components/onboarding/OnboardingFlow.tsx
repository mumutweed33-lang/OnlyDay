'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
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

interface OnboardingFlowProps {
  onBack?: () => void
  onComplete?: () => void
}

type AuthMode = 'signUp' | 'signIn'

const TOTAL_SIGNUP_STEPS = 4

export function OnboardingFlow({ onBack, onComplete }: OnboardingFlowProps) {
  const { login } = useUser()
  const [mode, setMode] = useState<AuthMode>('signUp')
  const [step, setStep] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)
  const [selfieCapture, setSelfieCapture] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    isCreator: false,
    bio: '',
    selfie: null as string | null,
    docFront: null as string | null,
    docBack: null as string | null,
  })

  const totalSteps = mode === 'signIn' ? 1 : TOTAL_SIGNUP_STEPS

  const canContinue = useMemo(() => {
    if (mode === 'signIn') {
      return Boolean(formData.email.trim() && formData.password.trim())
    }

    if (step === 0) {
      return Boolean(
        formData.name.trim() &&
          formData.username.trim() &&
          formData.email.trim() &&
          formData.password.trim()
      )
    }

    if (step === 1) {
      return Boolean(formData.selfie)
    }

    if (step === 2) {
      return Boolean(formData.docFront && formData.docBack)
    }

    return true
  }, [formData, mode, step])

  const handleModeChange = useCallback((nextMode: AuthMode) => {
    setMode(nextMode)
    setStep(0)
    setError(null)
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
    } catch {
      setCameraActive(true)
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
        await login({
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
      }

      stopCamera()
      onComplete?.()
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : 'Nao foi possivel concluir sua autenticacao agora.'
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

    if (step > 0 && mode === 'signUp') {
      setStep((current) => current - 1)
      return
    }

    stopCamera()
    onBack?.()
  }, [mode, onBack, step, stopCamera])

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

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <span className="font-bold text-gradient">OnlyDay</span>
          </div>

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
                    Use o mesmo e-mail e senha cadastrados no Supabase.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">E-mail</label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
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
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                </div>
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
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/60">E-mail</label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
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
                    placeholder="Crie uma senha forte"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, password: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 glass px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-violet-500/50"
                  />
                </div>

                <button
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isCreator: !prev.isCreator }))
                  }
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
                          Sou criador de conteudo
                        </div>
                        <div className="text-xs text-white/45">
                          Ative um perfil voltado para monetizacao
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
                            Precisamos confirmar que ha uma pessoa real por tras da conta.
                          </p>
                          <button
                            onClick={startCamera}
                            className="rounded-xl px-6 py-3 btn-primary font-semibold text-white"
                          >
                            Ativar camera
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 glass p-4">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Shield className="h-4 w-4 text-violet-400" />
                        <span>Seu cadastro usa validacao real, mas a interface continua no modo demo.</span>
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
                    Nesta demo, o envio e simulado. Depois vamos ligar isso a um bucket real.
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
                      <span>O upload esta simulado para a UX. A integracao do storage vem depois.</span>
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
