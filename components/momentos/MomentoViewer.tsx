'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Heart, Send, Lock, BadgeCheck, DollarSign, QrCode, CheckCircle2 } from 'lucide-react'
import { useMomentos } from '@/components/providers/MomentoContext'
import { useUser } from '@/components/providers/UserContext'
import { queueOdRefresh, trackOdEvent } from '@/lib/od-core/signal'
import type { PixPaymentData } from '@/lib/payments/contracts'
import type { PublicProfile } from '@/types/domain'

interface MomentoViewerProps {
  onOpenProfile?: (profile: PublicProfile) => void
}

type PaymentState = 'idle' | 'creating' | 'pending' | 'approved' | 'error'

export function MomentoViewer({ onOpenProfile }: MomentoViewerProps) {
  const {
    activeMomento,
    activeIndex,
    activeMomentos,
    currentCreatorId,
    currentCreatorPosition,
    totalCreators,
    setActiveMomento,
    nextMomento,
    prevMomento,
    markAsViewed,
    canViewMomento,
    getRemainingFreeViews,
    unlockCreatorMomentos,
    isCreatorUnlocked,
  } = useMomentos()
  const { user } = useUser()
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [payerEmail, setPayerEmail] = useState(user?.email || '')
  const [payerCpf, setPayerCpf] = useState('')
  const [paymentState, setPaymentState] = useState<PaymentState>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null)
  const remainingFreeViews = currentCreatorId ? getRemainingFreeViews(currentCreatorId) : 0
  const creatorUnlocked = currentCreatorId ? isCreatorUnlocked(currentCreatorId) : false

  useEffect(() => {
    setPayerEmail(user?.email || '')
  }, [user?.email])

  useEffect(() => {
    if (!activeMomento || !user?.id) return

    void trackOdEvent({
      actorProfileId: user.id,
      targetProfileId: activeMomento.userId,
      momentoId: activeMomento.id,
      surface: 'vault',
      eventType: 'story_open',
    })
    queueOdRefresh(user.id)
  }, [activeMomento?.id, activeMomento?.userId, user?.id])

  const canViewActiveMomento = useMemo(() => {
    if (!activeMomento) return false
    return canViewMomento(activeMomento, activeIndex)
  }, [activeIndex, activeMomento, canViewMomento])

  useEffect(() => {
    if (!activeMomento || paused) return

    if (!canViewActiveMomento) {
      setShowPaywall(true)
      return
    }

    setShowPaywall(false)
    if (!activeMomento.hasViewed) {
      void markAsViewed(activeMomento.id)
    }
    setProgress(0)
    const duration = activeMomento.duration || 5000
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextValue = prev + step
        return nextValue >= 100 ? 100 : nextValue
      })
    }, interval)

    return () => clearInterval(timer)
  }, [activeMomento?.id, activeMomento?.hasViewed, activeMomento?.duration, canViewActiveMomento, markAsViewed, paused])

  useEffect(() => {
    if (!activeMomento || paused || !canViewActiveMomento || progress < 100) return

    const timeoutId = window.setTimeout(() => {
      if (user?.id) {
        void trackOdEvent({
          actorProfileId: user.id,
          targetProfileId: activeMomento.userId,
          momentoId: activeMomento.id,
          surface: 'vault',
          eventType: 'story_complete',
        })
        queueOdRefresh(user.id)
      }
      nextMomento()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [activeMomento?.id, activeMomento?.userId, canViewActiveMomento, nextMomento, paused, progress, user?.id])

  useEffect(() => {
    if (!paymentData?.paymentId || paymentState !== 'pending') return

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/pix/${paymentData.paymentId}`)
        const data = await response.json()

        if (!response.ok) {
          setPaymentState('error')
      setPaymentError(data.error || 'Não foi possível consultar o status do PIX.')
          return
        }

        if (data.status === 'approved') {
          if (activeMomento) {
            unlockCreatorMomentos(activeMomento.userId)
          }
          setPaymentState('approved')
          setShowPaywall(false)
          if (activeMomento && user?.id) {
            void trackOdEvent({
              actorProfileId: user.id,
              targetProfileId: activeMomento.userId,
              momentoId: activeMomento.id,
              surface: 'vault',
              eventType: 'story_unlock_paid',
              metadata: { provider: data.provider ?? 'unknown', flow: 'polling' },
            })
            queueOdRefresh(user.id)
          }
        }
      } catch (error) {
        console.error('[pix] failed to refresh payment status', error)
      }
    }, 5000)

    return () => clearInterval(timer)
  }, [activeMomento, paymentData?.paymentId, paymentState, unlockCreatorMomentos])

  const handleClose = useCallback(() => {
    setActiveMomento(null, 0)
    setShowPaywall(false)
    setShowPixModal(false)
    setPaymentState('idle')
    setPaymentError(null)
    setPaymentData(null)
  }, [setActiveMomento])

  if (!activeMomento) return null

  const openProfile = () => {
    onOpenProfile?.({
      id: activeMomento.userId,
      name: activeMomento.userName,
      username: activeMomento.userUsername,
      avatar: activeMomento.userAvatar,
      bio: activeMomento.userBio,
      isVerified: activeMomento.isVerified,
      isCreator: activeMomento.isCreator !== false,
    })
  }

  const createPixPayment = async () => {
    if (!activeMomento?.price) {
      setPaymentError('Esse criador ainda não definiu um valor para o desbloqueio.')
      setPaymentState('error')
      return
    }

    setPaymentState('creating')
    setPaymentError(null)

    try {
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeMomento.price,
          description: `Desbloqueio 24h dos momentos de ${activeMomento.userName}`,
          payerEmail,
          payerName: user?.name || 'Comprador OnlyDay',
          payerCpf,
          externalReference: `${activeMomento.userId}-${Date.now()}`,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setPaymentState('error')
      setPaymentError(data.error || 'Não foi possível gerar o PIX.')
        return
      }

      setPaymentData(data)
      setPaymentState(data.status === 'approved' ? 'approved' : 'pending')

      if (data.status === 'approved') {
        unlockCreatorMomentos(activeMomento.userId)
        setShowPaywall(false)
        if (user?.id) {
          void trackOdEvent({
            actorProfileId: user.id,
            targetProfileId: activeMomento.userId,
            momentoId: activeMomento.id,
            surface: 'vault',
            eventType: 'story_unlock_paid',
            metadata: { provider: data.provider ?? 'unknown', flow: 'instant' },
          })
          queueOdRefresh(user.id)
        }
      }
    } catch (error) {
      console.error('[pix] failed to create payment', error)
      setPaymentState('error')
      setPaymentError('Erro ao gerar o PIX. Tente novamente.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-dark"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-3">
        {activeMomentos.map((momento, index) => (
          <div key={momento.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: index < activeIndex ? '100%' : '0%' }}
              animate={{
                width: index < activeIndex ? '100%' : index === activeIndex ? `${progress}%` : '0%',
              }}
              transition={{ duration: 0 }}
            />
          </div>
        ))}
      </div>

      <button aria-label="Ver momento anterior" className="absolute bottom-0 left-0 top-0 z-10 w-1/3" onClick={(event) => { event.stopPropagation(); prevMomento() }} />
      <button aria-label="Ver próximo momento" className="absolute bottom-0 right-0 top-0 z-10 w-1/3" onClick={(event) => { event.stopPropagation(); nextMomento() }} />

      <div className="absolute inset-0">
        {activeMomento.mediaType === 'video' ? (
          <video
            src={activeMomento.media}
            className="h-full w-full object-cover"
            style={{ filter: !canViewActiveMomento ? 'blur(28px)' : 'none' }}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={activeMomento.media}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: !canViewActiveMomento ? 'blur(28px)' : 'none' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      <div className="absolute inset-0 scale-110 opacity-20 blur-3xl" style={{ backgroundImage: `url(${activeMomento.media})`, backgroundSize: 'cover' }} />

      <div className="relative z-10 flex items-center justify-between px-4 pt-12">
        <div className="flex items-center gap-3">
          <button className="relative text-left" aria-label={`Abrir perfil de ${activeMomento.userName}`} onClick={openProfile}>
            <img src={activeMomento.userAvatar} alt={activeMomento.userName} className="h-10 w-10 rounded-full border-2 border-white/60" />
            {activeMomento.isCreator !== false && activeMomento.isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600">
                <BadgeCheck className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </button>
          <button className="text-left" aria-label={`Ver perfil de ${activeMomento.userName}`} onClick={openProfile}>
            <div className="text-sm font-semibold text-white">{activeMomento.userName}</div>
            <div className="text-xs text-white/60">{activeMomento.userUsername}</div>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Momento {activeIndex + 1}/{activeMomentos.length}
          </div>
          <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Criador {Math.max(currentCreatorPosition + 1, 1)}/{Math.max(totalCreators, 1)}
          </div>
          <button onClick={handleClose} aria-label="Fechar momentos" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 glass">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-dark/70 p-8 backdrop-blur-sm"
          >
            <Lock className="mb-4 h-16 w-16 text-violet-400" />
            <h3 className="mb-2 text-2xl font-black text-white">Momentos Premium</h3>
            <p className="mb-3 text-center text-sm text-white/60">
                Você já usou os 3 momentos grátis desse criador. Pagando agora, você libera
              todos os momentos dele por 24 horas.
            </p>
            {activeMomento.price && (
              <div className="mb-2 text-3xl font-black text-violet-400">
                R$ {activeMomento.price.toFixed(2)}
              </div>
            )}
            <div className="mb-6 text-xs text-white/35">
              {creatorUnlocked ? 'Acesso liberado' : `${remainingFreeViews} gratuitos restantes`}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (activeMomento && user?.id) {
                  void trackOdEvent({
                    actorProfileId: user.id,
                    targetProfileId: activeMomento.userId,
                    momentoId: activeMomento.id,
                    surface: 'vault',
                    eventType: 'story_unlock_click',
                  })
                  queueOdRefresh(user.id)
                }
                setShowPixModal(true)
              }}
              className="mb-3 flex items-center gap-2 rounded-2xl btn-primary px-8 py-3 font-bold text-white"
            >
              <DollarSign className="h-5 w-5" />
              Liberar 24h desse criador
            </motion.button>
            <button onClick={handleClose} aria-label="Voltar ao feed" className="text-sm text-white/40">
              Voltar ao feed
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPixModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0d0917] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-white">PIX 24h do criador</h4>
                  <p className="text-xs text-white/40">Fluxo real pronto, mas ainda em modo demo controlado</p>
                </div>
                <button onClick={() => setShowPixModal(false)} aria-label="Fechar PIX do criador" className="text-white/35">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/45">E-mail do pagador</label>
                  <input
                    value={payerEmail}
                    onChange={(event) => setPayerEmail(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
                    placeholder="voce@email.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/45">CPF do pagador</label>
                  <input
                    value={payerCpf}
                    onChange={(event) => setPayerCpf(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
                    placeholder="00000000000"
                  />
                </div>
              </div>

              {paymentState === 'pending' && paymentData && (
                <div className="mb-4 rounded-2xl border border-violet-500/20 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center gap-2 text-white">
                    <QrCode className="h-4 w-4 text-violet-300" />
                    <span className="text-sm font-semibold">PIX gerado</span>
                  </div>
                  {paymentData.qrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="mx-auto mb-3 h-44 w-44 rounded-2xl bg-white p-3"
                    />
                  )}
                  {paymentData.qrCode && (
                    <textarea
                      readOnly
                      value={paymentData.qrCode}
                      className="mb-3 h-24 w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-[11px] text-white/65 outline-none"
                    />
                  )}
                  {paymentData.ticketUrl && (
                    <a
                      href={paymentData.ticketUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-center text-sm font-semibold text-violet-200"
                    >
                      Abrir cobrança do Mercado Pago
                    </a>
                  )}
                </div>
              )}

              {paymentState === 'approved' && (
                <div className="mb-4 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
                  <div className="font-semibold text-white">Pagamento aprovado</div>
                  <p className="mt-1 text-xs text-white/55">
                    O acesso de 24h deste criador foi liberado.
                  </p>
                </div>
              )}

              {paymentError && (
                <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                  {paymentError}
                </div>
              )}

              {paymentState === 'idle' && (
                <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
                  Demo segura: o acesso só é liberado depois de um retorno aprovado. Sem provider ativo,
                  o app não desbloqueia sozinho.
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={createPixPayment}
                disabled={paymentState === 'creating' || paymentState === 'pending'}
                className="w-full rounded-2xl btn-primary py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {paymentState === 'creating'
                  ? 'Gerando PIX...'
                  : paymentState === 'pending'
                    ? 'Aguardando pagamento'
                    : paymentState === 'approved'
                      ? 'Liberado'
                      : 'Gerar PIX real'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.8 }} aria-label="Curtir momento" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 glass">
              <Heart className="h-5 w-5 text-white" />
            </motion.button>
            <div className="flex flex-1 items-center gap-2">
              <input
                placeholder="Responder..."
                className="flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/90 outline-none placeholder:text-white/30 glass"
              />
              <motion.button whileTap={{ scale: 0.8 }} aria-label="Enviar resposta do momento" className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                <Send className="h-4 w-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40">
          <span>{activeMomento.viewCount.toLocaleString('pt-BR')} visualizações</span>
          <span>-</span>
          <span>{creatorUnlocked ? 'Acesso 24h ativo' : `${remainingFreeViews} grátis restantes`}</span>
          <span>-</span>
          <span>
            {currentCreatorPosition + 1 < totalCreators
              ? 'Avance para ver o próximo criador'
              : 'Fim da sequência de criadores'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
