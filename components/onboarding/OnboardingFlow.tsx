'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, CheckCircle, User, Lock, Crown, ChevronRight, ChevronLeft, Sparkles, Shield, Eye } from 'lucide-react'
import { useUser } from '@/components/providers/AppProviders'

interface OnboardingFlowProps {
  onBack?: () => void
  onComplete?: () => void
}

const STEP_INFO = [
  { title: 'Bem-vindo ao OnlyDay', subtitle: 'Crie sua conta premium', icon: Sparkles },
  { title: 'Verificação Elite', subtitle: 'Selfie em tempo real', icon: Camera },
  { title: 'Documentos', subtitle: 'Confirme sua identidade', icon: Shield },
  { title: 'Perfil Premium', subtitle: 'Personalize sua presença', icon: Crown },
]

export function OnboardingFlow({ onBack, onComplete }: OnboardingFlowProps) {
  const { login } = useUser()
  const [step, setStep] = useState(0)
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
  const [cameraActive, setCameraActive] = useState(false)
  const [selfieCapture, setSelfieCapture] = useState(false)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
      }
    } catch (e) {
      // Demo mode - simulate camera
      setCameraActive(true)
    }
  }, [])

  const captureSelfie = useCallback(() => {
    setSelfieCapture(true)
    setTimeout(() => {
      setFormData(prev => ({ 
        ...prev, 
        selfie: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now() + '&backgroundColor=7C3AED'
      }))
      setSelfieCapture(false)
    }, 2000)
  }, [])

  const handleNext = useCallback(async () => {
    if (step < 3) {
      setStep(s => s + 1)
    } else {
      setLoading(true)
      await new Promise(r => setTimeout(r, 1500))
      login({
        id: 'user-' + Date.now(),
        name: formData.name || 'Usuário Premium',
        username: '@' + (formData.username || 'usuario' + Date.now()),
        avatar: formData.selfie || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now() + '&backgroundColor=7C3AED',
        bio: formData.bio || 'Novo no OnlyDay ✨',
        isCreator: formData.isCreator,
        isVerified: !!formData.selfie,
        isPremium: false,
        followers: 0,
        following: 0,
        posts: 0,
        balance: 0,
        plan: 'free',
        joinedAt: new Date().toISOString(),
      })
      onComplete?.()
      setLoading(false)
    }
  }, [formData, login, onComplete, step])

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="p-2 glass rounded-xl border border-white/10 hover:border-violet-500/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button onClick={onBack} className="p-2 glass rounded-xl border border-white/10 text-white/60 text-sm px-4">
              Voltar
            </button>
          )}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-gradient">OnlyDay</span>
          </div>
          <div className="text-xs text-white/40">{step + 1}/4</div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 neon-purple">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Criar conta premium</h2>
                  <p className="text-white/50">Junte-se à plataforma mais exclusiva do Brasil</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400">@</span>
                      <input
                        type="text"
                        placeholder="seuusername"
                        value={formData.username}
                        onChange={e => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        className="w-full glass rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">E-mail</label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Senha</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 outline-none transition-colors"
                    />
                  </div>

                  <div
                    onClick={() => setFormData(prev => ({ ...prev, isCreator: !prev.isCreator }))}
                    className={`glass rounded-xl p-4 border cursor-pointer transition-all ${formData.isCreator ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className={`w-5 h-5 ${formData.isCreator ? 'text-violet-400' : 'text-white/40'}`} />
                        <div>
                          <div className="text-sm font-semibold text-white">Sou criador de conteúdo</div>
                          <div className="text-xs text-white/40">Monetize sua audiência</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.isCreator ? 'border-violet-500 bg-violet-500' : 'border-white/30'}`}>
                        {formData.isCreator && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Selfie/Biometry */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 neon-purple">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Verificação Biométrica</h2>
                  <p className="text-white/50">Tire uma selfie em tempo real para confirmar sua identidade</p>
                </div>

                {!formData.selfie ? (
                  <div>
                    <div className="relative rounded-3xl overflow-hidden bg-dark-200 border border-violet-500/20 mb-6" style={{ aspectRatio: '1' }}>
                      {cameraActive ? (
                        <div className="w-full h-full relative">
                          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {/* Face guide overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-56 rounded-full border-2 border-violet-500 border-dashed opacity-60" />
                          </div>

                          {selfieCapture && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.5 }}
                              className="absolute inset-0 bg-white/30"
                            />
                          )}

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={captureSelfie}
                              disabled={selfieCapture}
                              className="w-16 h-16 rounded-full bg-white border-4 border-violet-500 flex items-center justify-center shadow-lg"
                            >
                              {selfieCapture ? (
                                <div className="w-6 h-6 rounded-full bg-violet-500 animate-ping" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-violet-600" />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          <Camera className="w-12 h-12 text-violet-400" />
                          <p className="text-white/50 text-sm text-center px-8">
                            Precisamos verificar sua identidade com uma selfie ao vivo
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startCamera}
                            className="btn-primary px-6 py-3 rounded-xl text-white font-semibold"
                          >
                            Ativar Câmera
                          </motion.button>
                        </div>
                      )}
                    </div>

                    <div className="glass rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Shield className="w-4 h-4 text-violet-400" />
                        <span>Sua selfie é processada localmente e nunca compartilhada</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="relative inline-block mb-6">
                      <img
                        src={formData.selfie}
                        alt="Selfie"
                        className="w-32 h-32 rounded-full border-4 border-violet-500 mx-auto"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Verificado! ✅</h3>
                    <p className="text-white/50 text-sm">Identidade biométrica confirmada com sucesso</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: Documents */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 neon-purple">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Upload de Documentos</h2>
                  <p className="text-white/50">Envie frente e verso do seu documento oficial</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'docFront', label: 'Frente do Documento', desc: 'RG, CNH ou Passaporte (frente)' },
                    { key: 'docBack', label: 'Verso do Documento', desc: 'RG, CNH ou Passaporte (verso)' },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      onClick={() => {
                        // Simulate document upload
                        setFormData(prev => ({
                          ...prev,
                          [key]: 'https://picsum.photos/seed/' + key + '/400/250'
                        }))
                      }}
                      className={`glass rounded-2xl p-5 border cursor-pointer transition-all ${
                        formData[key as keyof typeof formData] 
                          ? 'border-green-500/50 bg-green-500/5' 
                          : 'border-white/10 hover:border-violet-500/30'
                      }`}
                    >
                      {formData[key as keyof typeof formData] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded-lg bg-violet-500/20 overflow-hidden">
                            <img src={formData[key as keyof typeof formData] as string} alt={label} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{label}</div>
                            <div className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Enviado com sucesso
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{label}</div>
                            <div className="text-xs text-white/40">{desc}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {!formData.docFront && !formData.docBack && (
                    <div className="glass rounded-2xl p-4 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-sm text-amber-400/80">
                        <Eye className="w-4 h-4" />
                        <span>Toque nos campos acima para fazer upload do documento</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Profile */}
            {step === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 neon-purple">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Perfil Premium</h2>
                  <p className="text-white/50">Personalize como o mundo vai te ver</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/60 mb-1 block">Bio</label>
                    <textarea
                      placeholder="Conte um pouco sobre você..."
                      value={formData.bio}
                      onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/50 outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Plan selection */}
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Plano de Acesso</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Free', desc: 'Explorar a plataforma', color: 'border-white/20', active: true },
                        { name: 'Diamond', desc: 'Acesso total premium', color: 'border-violet-500/50 bg-violet-500/10', active: false, badge: 'Popular' },
                      ].map(plan => (
                        <div
                          key={plan.name}
                          className={`glass rounded-2xl p-4 border cursor-pointer ${plan.color}`}
                        >
                          {plan.badge && (
                            <div className="text-xs text-violet-400 font-semibold mb-1">{plan.badge} ⭐</div>
                          )}
                          <div className="font-bold text-white">{plan.name}</div>
                          <div className="text-xs text-white/40 mt-1">{plan.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="glass rounded-2xl p-5 border border-violet-500/20">
                    <h4 className="font-semibold text-white mb-3">Resumo da conta</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Nome', value: formData.name || 'Não informado' },
                        { label: 'Username', value: '@' + (formData.username || 'usuario') },
                        { label: 'Biometria', value: formData.selfie ? '✅ Verificada' : '⚠️ Pendente' },
                        { label: 'Documentos', value: formData.docFront ? '✅ Enviados' : '⚠️ Pendentes' },
                        { label: 'Tipo', value: formData.isCreator ? '👑 Criador' : '👤 Fan' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-xs text-white/40">{label}</span>
                          <span className="text-xs text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={loading}
          className="w-full btn-primary py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mt-8"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando sua conta...
            </>
          ) : step === 3 ? (
            <>
              <Sparkles className="w-5 h-5" />
              Entrar no OnlyDay
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
