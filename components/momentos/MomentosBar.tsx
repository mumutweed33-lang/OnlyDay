'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  ChevronDown,
  Crown,
  DollarSign,
  ImagePlus,
  Lock,
  Plus,
  RefreshCcw,
  Settings,
  Sparkles,
  Video,
  Wand2,
  X,
} from 'lucide-react'
import { useMomentos } from '@/components/providers/MomentoContext'
import { useUser } from '@/components/providers/UserContext'
import type { MediaType, PublicProfile } from '@/types/domain'

interface MomentosBarProps {
  onOpenProfile?: (profile: PublicProfile) => void
}

const MOMENTO_DURATION_MS = 7000
const MOMENTO_TTL_MS = 24 * 60 * 60 * 1000
const CAMERA_EFFECTS = [
  { id: 'soft', label: 'Soft', filter: 'saturate(1.08) contrast(1.04) brightness(1.02)' },
  { id: 'glow', label: 'Glow', filter: 'saturate(1.18) contrast(1.1) brightness(1.06) hue-rotate(-4deg)' },
  { id: 'bronze', label: 'Bronze', filter: 'sepia(0.22) saturate(1.15) contrast(1.04)' },
  { id: 'night', label: 'Night', filter: 'contrast(1.14) saturate(0.86) brightness(0.92)' },
  { id: 'cinema', label: 'Cinema', filter: 'contrast(1.08) saturate(0.92) brightness(0.98)' },
  { id: 'ultra', label: '4K', filter: 'saturate(1.22) contrast(1.16) brightness(1.03)' },
] as const
const CAMERA_MODES = [
  { id: 'boomerang', label: 'Bumerangue' },
  { id: 'handsfree', label: 'Mãos livres' },
] as const

export function MomentosBar({ onOpenProfile }: MomentosBarProps) {
  const { creatorMomentos, openCreatorMomentos, addMomento } = useMomentos()
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recorderChunksRef = useRef<Blob[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [mediaPreview, setMediaPreview] = useState('')
  const [mediaType, setMediaType] = useState<MediaType>('image')
  const [isPremium, setIsPremium] = useState(true)
  const [price, setPrice] = useState('19.90')
  const [freeViews, setFreeViews] = useState('1')
  const [caption, setCaption] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [selectedEffect, setSelectedEffect] = useState<(typeof CAMERA_EFFECTS)[number]['id']>('soft')
  const [showCameraOptions, setShowCameraOptions] = useState(false)
  const [cameraMode, setCameraMode] = useState<(typeof CAMERA_MODES)[number]['id'] | 'standard'>('standard')
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const ownSummary = useMemo(
    () => creatorMomentos.find((creator) => creator.userId === user?.id),
    [creatorMomentos, user?.id]
  )

  const selectedEffectConfig =
    CAMERA_EFFECTS.find((effect) => effect.id === selectedEffect) ?? CAMERA_EFFECTS[0]

  const stopCameraStream = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null
    }
    setCameraReady(false)
  }

  const resetComposer = () => {
    if (mediaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview)
    }
    setMediaPreview('')
    setMediaType('image')
    setIsPremium(true)
    setPrice('19.90')
    setFreeViews('1')
    setCaption('')
    setCreateError(null)
    setShowCameraOptions(false)
    setCameraMode('standard')
    setCountdown(null)
  }

  const closeComposer = () => {
    stopCameraStream()
    setShowCreateModal(false)
    resetComposer()
  }

  const readMomentFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setCreateError('Escolha uma imagem ou video para publicar no Momento.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaPreview(reader.result)
        setMediaType(file.type.startsWith('video/') ? 'video' : 'image')
        setCreateError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      if (!showCreateModal || !user?.isCreator || mediaPreview) return
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return

      setCameraLoading(true)
      setCreateError(null)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        cameraStreamRef.current = stream

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream
          void videoPreviewRef.current.play().catch(() => undefined)
        }

        setCameraReady(true)
      } catch (error) {
        if (!cancelled) {
          setCreateError(
            error instanceof Error
              ? 'Nao consegui abrir a camera agora. Voce ainda pode usar a galeria.'
              : 'Nao consegui abrir a camera agora. Voce ainda pode usar a galeria.'
          )
        }
      } finally {
        if (!cancelled) setCameraLoading(false)
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopCameraStream()
    }
  }, [cameraFacingMode, mediaPreview, showCreateModal, user?.isCreator])

  const capturePhotoFromCamera = () => {
    const video = videoPreviewRef.current
    if (!video) {
      cameraInputRef.current?.click()
      return
    }

    const canvas = document.createElement('canvas')
    const width = video.videoWidth || 1080
    const height = video.videoHeight || 1920
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      cameraInputRef.current?.click()
      return
    }

    context.filter = selectedEffectConfig.filter
    context.drawImage(video, 0, 0, width, height)
    const imageData = canvas.toDataURL('image/jpeg', 0.96)
    setMediaPreview(imageData)
    setMediaType('image')
    setCreateError(null)
    stopCameraStream()
  }

  const captureBoomerang = async () => {
    const stream = cameraStreamRef.current
    if (!stream || typeof MediaRecorder === 'undefined') {
      capturePhotoFromCamera()
      return
    }

    recorderChunksRef.current = []
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    })

    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recorderChunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(recorderChunksRef.current, { type: recorder.mimeType || 'video/webm' })
      const url = URL.createObjectURL(blob)
      setMediaPreview(url)
      setMediaType('video')
      setCreateError(null)
      stopCameraStream()
    }

    recorder.start()
    window.setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop()
    }, 1200)
  }

  const handleCameraCapture = () => {
    if (cameraMode === 'handsfree') {
      setCountdown(3)
      const timeout = window.setInterval(() => {
        setCountdown((current) => {
          if (current === null) return current
          if (current <= 1) {
            window.clearInterval(timeout)
            capturePhotoFromCamera()
            return null
          }
          return current - 1
        })
      }, 1000)
      return
    }

    if (cameraMode === 'boomerang') {
      void captureBoomerang()
      return
    }

    capturePhotoFromCamera()
  }

  const handleCreateMoment = async () => {
    if (!user) return

    if (!user.isCreator) {
      setCreateError('Ative o modo criador no seu perfil antes de publicar Momentos premium.')
      return
    }

    if (!mediaPreview) {
      setCreateError('Adicione uma foto ou video para publicar um Momento premium.')
      return
    }

    const parsedPrice = Number(price.replace(',', '.'))
    const parsedFreeViews = Number.parseInt(freeViews, 10)

    if (isPremium && (!Number.isFinite(parsedPrice) || parsedPrice < 1)) {
      setCreateError('Defina um valor premium de pelo menos R$ 1,00.')
      return
    }

    if (!Number.isFinite(parsedFreeViews) || parsedFreeViews < 0 || parsedFreeViews > 3) {
      setCreateError('Escolha entre 0 e 3 visualizacoes gratis antes do paywall.')
      return
    }

    setCreating(true)
    setCreateError(null)

    try {
      await addMomento({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userUsername: user.username,
        userBio: caption.trim() || user.bio,
        isVerified: user.isCreator && user.isVerified,
        isCreator: true,
        media: mediaPreview,
        mediaType,
        isLocked: isPremium,
        price: isPremium ? parsedPrice : undefined,
        dailyFreeCount: isPremium ? parsedFreeViews : 3,
        duration: mediaType === 'video' ? 12000 : MOMENTO_DURATION_MS,
        expiresAt: new Date(Date.now() + MOMENTO_TTL_MS).toISOString(),
      })
      closeComposer()
      window.setTimeout(() => openCreatorMomentos(user.id, 0), 350)
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel publicar esse Momento agora.'
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-5 pt-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[17px] font-bold tracking-[-0.04em] text-white">
          Momentos
          <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_18px_rgba(139,92,246,0.8)]" />
        </div>
        <button className="text-[13px] font-medium text-[#9CA3AF]">Ver todos</button>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateModal(true)}
            aria-label="Criar Momento premium"
            className={
              'relative flex h-[120px] w-[74px] flex-col items-center justify-center gap-2 rounded-[18px] border transition-colors shadow-[0_16px_40px_rgba(0,0,0,0.28)] ' +
              'border-[#8B5CF6] bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(139,92,246,0.18))] hover:border-violet-400'
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#A855F7] bg-black/20">
              <Plus className="h-6 w-6 text-white" strokeWidth={1.8} />
            </span>
            <span className="px-2 text-center text-[12.5px] font-medium leading-tight text-white">
              Criar<br />Momento
            </span>
            {ownSummary && (
              <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                {ownSummary.momentos.length}
              </span>
            )}
          </motion.button>
        </div>

        {creatorMomentos.map((creator, index) => (
          <motion.div
            key={creator.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openCreatorMomentos(creator.userId, 0)}
              aria-label={`Abrir momentos de ${creator.userName}`}
              className="relative block h-[120px] w-[80px] overflow-hidden rounded-[18px] border border-white/10 bg-[#101018] shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
            >
              <img
                src={creator.momentos[0]?.media || creator.userAvatar}
                alt={creator.userName}
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/82" />
              <span className="absolute left-2 top-2 rounded-md bg-[#7C3AED]/90 px-1.5 py-1 text-[8px] font-black uppercase tracking-[-0.02em] text-white">
                {index === 0 ? 'AO VIVO' : creator.price ? 'PREMIUM' : '24H'}
              </span>

              {!creator.hasViewed && !(creator.price && !creator.isUnlocked) && (
                <div className="absolute right-2.5 top-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#8B5CF6] bg-[#101018]">
                  <div className="h-1 w-1 rounded-full bg-[#8B5CF6]" />
                </div>
              )}

              {creator.price && !creator.isUnlocked && (
                <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black/55">
                  <Lock className="h-2.5 w-2.5 text-white/80" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="mb-1 flex items-center gap-1">
                  <img src={creator.userAvatar} alt="" className="h-6 w-6 rounded-full border border-white/20 object-cover" />
                  <span className="truncate text-[10px] font-bold text-white">{creator.userName.split(' ')[0]}</span>
                </div>
                <div className="truncate text-[9px] text-white/55">
                  {index === 0
                    ? '1,2k assistindo'
                    : creator.price
                      ? 'Novo momento'
                      : 'Hoje, 20:00'}
                </div>
              </div>
            </motion.button>
            <div className="hidden max-w-[76px] flex-col items-center">
              <button
                onClick={() =>
                  onOpenProfile?.({
                    id: creator.userId,
                    name: creator.userName,
                    username: creator.userUsername,
                    avatar: creator.userAvatar,
                    bio: creator.userBio,
                    isVerified: creator.isCreator && creator.isVerified,
                    isCreator: creator.isCreator,
                  })
                }
                aria-label={`Abrir perfil de ${creator.userName}`}
                className="max-w-[60px] truncate text-center text-[10px] text-white/60"
              >
                {creator.userName.split(' ')[0]}
              </button>
              <span className="text-[9px] text-white/30">
                {creator.isUnlocked
                  ? '24h liberado'
                  : creator.price
                    ? `${creator.remainingFreeViews} gratis`
                    : 'Livre'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#050508]">
          {!user?.isCreator ? (
            <div className="flex h-full items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Momento premium</h3>
                    <p className="text-xs text-white/40">Publique em 24h com paywall confortavel.</p>
                  </div>
                  <button onClick={closeComposer} aria-label="Fechar publicacao de momento" className="text-white/40">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="rounded-3xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                    <Crown className="h-4 w-4 text-violet-300" />
                    Momentos premium sao para criadores
                  </div>
                  <p className="text-xs leading-relaxed text-white/55">
                    Ative o modo criador no seu perfil para publicar Momentos monetizados, liberar dashboard e vender acesso 24h.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) readMomentFile(file)
                  event.target.value = ''
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) readMomentFile(file)
                  event.target.value = ''
                }}
              />

              <div className="absolute inset-0 overflow-hidden">
                {mediaPreview ? (
                  mediaType === 'video' ? (
                    <video
                      src={mediaPreview}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      autoPlay
                      loop
                      style={{ filter: selectedEffectConfig.filter }}
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ filter: selectedEffectConfig.filter }}
                    />
                  )
                ) : (
                  <>
                    <video
                      ref={videoPreviewRef}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      autoPlay
                      style={{ filter: selectedEffectConfig.filter }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.12),transparent_26%),linear-gradient(180deg,rgba(5,5,8,0.62),transparent_24%,transparent_76%,rgba(5,5,8,0.82))]" />
                  </>
                )}

                {!mediaPreview && (
                  <div className="absolute inset-0 bg-[#050508]/58" />
                )}
              </div>

              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-6">
                <button onClick={closeComposer} aria-label="Fechar publicacao de momento" className="text-white/90">
                  <X className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedEffect((current) => {
                      const currentIndex = CAMERA_EFFECTS.findIndex((effect) => effect.id === current)
                      const next = CAMERA_EFFECTS[(currentIndex + 1) % CAMERA_EFFECTS.length]
                      return next.id
                    })
                  }
                  className="text-violet-300"
                  aria-label="Alternar efeito"
                >
                  <Wand2 className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => setCameraFacingMode((current) => (current === 'environment' ? 'user' : 'environment'))}
                  className="text-white/92"
                  aria-label="Trocar camera"
                >
                  <Settings className="h-7 w-7" />
                </button>
              </div>

              {!mediaPreview && (
                <div className="absolute right-4 top-[40%] z-10 flex -translate-y-1/2 flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCameraOptions((current) => !current)}
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/28 text-violet-300 backdrop-blur-xl"
                  >
                    <ChevronDown className={`h-7 w-7 transition-transform ${showCameraOptions ? 'rotate-180' : ''}`} />
                  </button>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold text-white">Mais opções</div>
                    <div className="text-[11px] text-white/50">Toque para ver</div>
                  </div>

                  {showCameraOptions && (
                    <div className="w-[152px] rounded-[24px] border border-white/10 bg-black/38 p-2 backdrop-blur-xl">
                      {CAMERA_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCameraMode((current) => (current === mode.id ? 'standard' : mode.id))}
                          className={
                            'mb-2 flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-sm ' +
                            (cameraMode === mode.id
                              ? 'bg-violet-500/18 text-white'
                              : 'bg-white/[0.03] text-white/64')
                          }
                        >
                          <span>{mode.label}</span>
                          <span className="text-[10px] uppercase tracking-[0.16em] text-violet-300">
                            {cameraMode === mode.id ? 'ativo' : 'off'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!mediaPreview && countdown !== null && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-black/32 text-[42px] font-black text-white backdrop-blur-xl">
                    {countdown}
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 z-10">
                {!mediaPreview ? (
                  <>
                    <div className="mb-4 flex items-center justify-between px-5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-black/22 text-violet-300 backdrop-blur-xl"
                      >
                        <Plus className="h-6 w-6" />
                      </button>

                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-black/22 text-amber-300 backdrop-blur-xl">
                        <span className="text-[12px] font-black tracking-[0.02em]">4K</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center justify-center">
                      <div className="flex max-w-full items-center gap-3 overflow-x-auto px-4 scrollbar-hide">
                        {CAMERA_EFFECTS.slice(0, 2).map((effect) => (
                          <button
                            key={effect.id}
                            type="button"
                            onClick={() => setSelectedEffect(effect.id)}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className={
                                'h-[48px] w-[48px] rounded-full border object-cover ' +
                                (selectedEffect === effect.id ? 'border-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.28)]' : 'border-white/12')
                              }
                              style={{
                                backgroundImage:
                                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), transparent 45%), linear-gradient(135deg, rgba(147,51,234,0.26), rgba(12,12,18,0.88))',
                                filter: effect.filter,
                              }}
                            />
                            <span className={`text-[9px] ${selectedEffect === effect.id ? 'text-violet-300' : 'text-white/44'}`}>
                              {effect.label}
                            </span>
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={handleCameraCapture}
                          disabled={cameraLoading}
                          className="relative mx-1 flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center rounded-full border-[3px] border-violet-400/90 bg-white shadow-[0_0_22px_rgba(139,92,246,0.32)] disabled:opacity-60"
                        >
                          <span className="absolute inset-[-5px] rounded-full border border-violet-400/22" />
                          {cameraLoading ? (
                            <RefreshCcw className="h-6 w-6 animate-spin text-violet-500" />
                          ) : (
                            <span className="h-[60px] w-[60px] rounded-full border border-white/15 bg-white" />
                          )}
                        </button>

                        {CAMERA_EFFECTS.slice(2).map((effect) => (
                          <button
                            key={effect.id}
                            type="button"
                            onClick={() => setSelectedEffect(effect.id)}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className={
                                'h-[48px] w-[48px] rounded-full border object-cover ' +
                                (selectedEffect === effect.id ? 'border-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.28)]' : 'border-white/12')
                              }
                              style={{
                                backgroundImage:
                                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), transparent 45%), linear-gradient(135deg, rgba(147,51,234,0.26), rgba(12,12,18,0.88))',
                                filter: effect.filter,
                              }}
                            />
                            <span className={`text-[9px] ${selectedEffect === effect.id ? 'text-violet-300' : 'text-white/44'}`}>
                              {effect.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-t-[30px] border-t border-white/8 bg-[rgba(18,18,24,0.92)] px-6 pb-5 pt-3 backdrop-blur-2xl">
                      <div className="flex items-center justify-center gap-7 text-[13px] uppercase tracking-[0.22em] text-white/42">
                        <span>Post</span>
                        <span className="relative font-semibold text-violet-300">
                          Momento
                          <span className="absolute -bottom-2 left-1/2 h-[2px] w-[64px] -translate-x-1/2 rounded-full bg-violet-400" />
                        </span>
                        <span>Live</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-t-[30px] border-t border-white/8 bg-[rgba(14,12,22,0.94)] px-4 pb-6 pt-4 backdrop-blur-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-[16px] font-black text-white">Finalizar Momento</h3>
                        <p className="text-[11px] text-white/42">Ajuste monetização, legenda e publique.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaPreview('')
                          setMediaType('image')
                          setCreateError(null)
                        }}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70"
                      >
                        Refazer
                      </button>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPremium(false)}
                        className={
                          'rounded-2xl border px-3 py-3 text-left text-sm font-semibold ' +
                          (!isPremium
                            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/10 bg-white/5 text-white/45')
                        }
                      >
                        Livre
                        <span className="mt-1 block text-[10px] font-normal text-white/35">Alcance aberto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPremium(true)}
                        className={
                          'rounded-2xl border px-3 py-3 text-left text-sm font-semibold ' +
                          (isPremium
                            ? 'border-violet-400/30 bg-violet-500/15 text-violet-100'
                            : 'border-white/10 bg-white/5 text-white/45')
                        }
                      >
                        Premium
                        <span className="mt-1 block text-[10px] font-normal text-white/35">Venda 24h</span>
                      </button>
                    </div>

                    {isPremium && (
                      <div className="mb-3 grid grid-cols-2 gap-3">
                        <label className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3">
                          <span className="mb-1 flex items-center gap-1 text-[11px] text-white/45">
                            <DollarSign className="h-3 w-3" />
                            Preco 24h
                          </span>
                          <input
                            value={price}
                            onChange={(event) => setPrice(event.target.value)}
                            inputMode="decimal"
                            className="w-full bg-transparent text-sm font-bold text-white outline-none"
                            placeholder="19.90"
                          />
                        </label>
                        <label className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3">
                          <span className="mb-1 block text-[11px] text-white/45">Gratis antes do paywall</span>
                          <select
                            value={freeViews}
                            onChange={(event) => setFreeViews(event.target.value)}
                            className="w-full bg-transparent text-sm font-bold text-white outline-none"
                          >
                            <option className="bg-[#0f0a18]" value="0">0</option>
                            <option className="bg-[#0f0a18]" value="1">1</option>
                            <option className="bg-[#0f0a18]" value="2">2</option>
                            <option className="bg-[#0f0a18]" value="3">3</option>
                          </select>
                        </label>
                      </div>
                    )}

                    <label className="mb-3 block rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
                      <span className="mb-1 block text-[11px] text-white/45">Mensagem curta para esse Momento</span>
                      <textarea
                        value={caption}
                        onChange={(event) => setCaption(event.target.value)}
                        rows={2}
                        maxLength={120}
                        className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                        placeholder="Algo exclusivo, direto e com energia..."
                      />
                    </label>

                    <div className="mb-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        {mediaType === 'video' ? <Video className="h-4 w-4 text-violet-300" /> : <Sparkles className="h-4 w-4 text-violet-300" />}
                        Camera premium para momento
                      </div>
                      <p className="text-xs leading-relaxed text-white/55">
                        Efeito {selectedEffectConfig.label.toLowerCase()}, visual mais limpo e captura pronta para uma experiência mais forte no app.
                      </p>
                    </div>

                    {createError && (
                      <div className="mb-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                        {createError}
                      </div>
                    )}

                    <div className="grid gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/70"
                      >
                        Trocar mídia
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => void handleCreateMoment()}
                        disabled={creating}
                        className="rounded-2xl btn-primary py-3 text-sm font-bold text-white disabled:opacity-60"
                      >
                        {creating ? 'Publicando...' : isPremium ? 'Publicar Momento premium' : 'Publicar Momento livre'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
