'use client'

import React, { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, DollarSign, ImagePlus, Lock, Plus, Sparkles, Video, X } from 'lucide-react'
import { useMomentos } from '@/components/providers/MomentoContext'
import { useUser } from '@/components/providers/UserContext'
import type { MediaType, PublicProfile } from '@/types/domain'

interface MomentosBarProps {
  onOpenProfile?: (profile: PublicProfile) => void
}

const MOMENTO_DURATION_MS = 7000
const MOMENTO_TTL_MS = 24 * 60 * 60 * 1000

export function MomentosBar({ onOpenProfile }: MomentosBarProps) {
  const { creatorMomentos, openCreatorMomentos, addMomento } = useMomentos()
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [mediaPreview, setMediaPreview] = useState('')
  const [mediaType, setMediaType] = useState<MediaType>('image')
  const [isPremium, setIsPremium] = useState(true)
  const [price, setPrice] = useState('19.90')
  const [freeViews, setFreeViews] = useState('1')
  const [caption, setCaption] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const ownSummary = useMemo(
    () => creatorMomentos.find((creator) => creator.userId === user?.id),
    [creatorMomentos, user?.id]
  )

  const resetComposer = () => {
    setMediaPreview('')
    setMediaType('image')
    setIsPremium(true)
    setPrice('19.90')
    setFreeViews('1')
    setCaption('')
    setCreateError(null)
  }

  const closeComposer = () => {
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
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateModal(true)}
            aria-label="Criar Momento premium"
            className={
              'relative flex h-16 w-16 items-center justify-center rounded-[22px] border transition-colors ' +
              (user?.isCreator
                ? 'border-dashed border-violet-500/45 bg-violet-500/10 hover:border-violet-400'
                : 'border-white/10 bg-white/[0.035]')
            }
          >
            <Plus className="h-6 w-6 text-violet-300" />
            {ownSummary && (
              <span className="absolute -right-1 -top-1 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {ownSummary.momentos.length}
              </span>
            )}
          </motion.button>
          <span className="text-[10px] text-white/40">
            {user?.isCreator ? 'Criar premium' : 'Virar criador'}
          </span>
        </div>

        {creatorMomentos.map((creator, index) => (
          <motion.div
            key={creator.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openCreatorMomentos(creator.userId, 0)}
              aria-label={`Abrir momentos de ${creator.userName}`}
              className="relative"
            >
              <div
                className={`h-16 w-16 rounded-[22px] p-[2px] ${
                  creator.hasViewed
                    ? 'bg-white/10'
                    : 'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500'
                }`}
              >
                <div className="h-full w-full overflow-hidden rounded-[19px] bg-dark-200">
                  <img
                    src={creator.momentos[0]?.media || creator.userAvatar}
                    alt={creator.userName}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {!creator.hasViewed && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-dark bg-violet-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
              )}

              {creator.price && !creator.isUnlocked && (
                <div className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-dark/85">
                  <Lock className="h-2.5 w-2.5 text-violet-300" />
                </div>
              )}
            </motion.button>
            <div className="flex max-w-[76px] flex-col items-center">
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Momento premium</h3>
                <p className="text-xs text-white/40">Publique em 24h com paywall confortavel.</p>
              </div>
              <button onClick={closeComposer} aria-label="Fechar publicacao de momento" className="text-white/40">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!user?.isCreator ? (
              <div className="rounded-3xl border border-violet-500/20 bg-violet-500/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <Crown className="h-4 w-4 text-violet-300" />
                  Momentos premium sao para criadores
                </div>
                <p className="text-xs leading-relaxed text-white/55">
                  Ative o modo criador no seu perfil para publicar Momentos monetizados, liberar dashboard e vender acesso 24h.
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-4 flex aspect-[9/12] w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045]"
                >
                  {mediaPreview ? (
                    mediaType === 'video' ? (
                      <video src={mediaPreview} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={mediaPreview} alt="" className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="px-6 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
                        <ImagePlus className="h-6 w-6 text-violet-300" />
                      </div>
                      <div className="text-sm font-bold text-white">Adicionar foto ou video</div>
                      <p className="mt-1 text-xs text-white/40">
                        Preview vertical para uma experiencia premium no celular.
                      </p>
                    </div>
                  )}
                </button>
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

                <div className="mb-4 grid grid-cols-2 gap-3">
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
                  <div className="mb-4 grid grid-cols-2 gap-3">
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

                <label className="mb-4 block rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
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

                <div className="mb-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    {mediaType === 'video' ? <Video className="h-4 w-4 text-violet-300" /> : <Sparkles className="h-4 w-4 text-violet-300" />}
                    Experiencia de alto valor
                  </div>
                  <p className="text-xs leading-relaxed text-white/55">
                    O Momento expira em 24h, abre em tela cheia e, quando premium, cria paywall por criador para monetizar sem atrito.
                  </p>
                </div>

                {createError && (
                  <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                    {createError}
                  </div>
                )}

                <div className="grid gap-3">
                  <button
                    onClick={closeComposer}
                    className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/70"
                  >
                    Voltar
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
