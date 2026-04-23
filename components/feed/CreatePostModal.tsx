'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, ChevronDown, DollarSign, Hash, Image, Lock, Plus, Send, Smile, X } from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'

interface CreatePostModalProps {
  onClose: () => void
}

const EMOJIS = [':)', 'fire', 'love', 'spark', 'moon', 'crown', 'gem', 'rocket']
const SUGGESTED_TAGS = ['#OnlyDay', '#Exclusivo', '#Premium', '#Criador']

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { user } = useUser()
  const { addPost } = usePosts()
  const [content, setContent] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [price, setPrice] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const normalizedPrice = price.replace(',', '.').trim()
  const parsedPrice = normalizedPrice ? Number(normalizedPrice) : NaN
  const hasValidPremiumPrice = !isLocked || (Number.isFinite(parsedPrice) && parsedPrice >= 1)
  const canPublish = (!!content.trim() || !!mediaPreview) && !posting && hasValidPremiumPrice
  const remainingChars = 500 - content.length

  const handlePost = async () => {
    if (!content.trim() && !mediaPreview) return
    if (isLocked && !hasValidPremiumPrice) {
      setSubmitError('Defina um preço mínimo de R$ 1,00 para publicar conteúdo premium.')
      return
    }

    setSubmitError(null)
    setPosting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))

    try {
      await addPost({
        userId: user?.id || 'user-001',
        userName: user?.name || 'Usuario',
        userAvatar: user?.avatar || '',
        userUsername: user?.username || '@usuario',
        isVerified: user?.isVerified || false,
        content: content.trim(),
        media: mediaPreview ? [{ type: 'image', url: mediaPreview }] : undefined,
        isLocked,
        price: isLocked ? parsedPrice : undefined,
        hashtags: content.match(/#(\w+)/g)?.map((hashtag) => hashtag.slice(1)) || [],
      })
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel publicar agora.'
      setSubmitError(`Nao consegui salvar esse post na comunidade. ${message}`)
    } finally {
      setPosting(false)
    }
  }

  const addEmoji = (emoji: string) => {
    setContent((prev) => `${prev}${emoji}`)
    setShowEmojis(false)
    textareaRef.current?.focus()
  }

  const handleSelectedImage = (file?: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSubmitError('Escolha um arquivo de imagem para publicar.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaPreview(reader.result)
        setSubmitError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#050508]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
        <button
          onClick={onClose}
          aria-label="Fechar criação de post"
          className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.02] text-white/90"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="text-[18px] font-bold tracking-[-0.03em] text-white">Novo post</span>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePost}
          disabled={!canPublish}
          className={`flex h-11 items-center gap-2 rounded-[16px] px-5 text-[14px] font-semibold transition-all ${
            canPublish
              ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)]'
              : 'border border-white/10 bg-white/[0.03] text-white/30'
          }`}
        >
          {posting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Publicar
            </>
          )}
        </motion.button>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-6 pt-5">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            handleSelectedImage(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            handleSelectedImage(event.target.files?.[0])
            event.target.value = ''
          }}
        />

        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex gap-3">
            <img
              src={user?.avatar}
              alt=""
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="text-[14px] text-white/34">O que você quer compartilhar hoje?</div>
              <div className="mt-1.5 text-[12px] text-white/24">Texto, foto, vídeo ou conteúdo exclusivo</div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => {
                  setContent(event.target.value)
                  if (submitError) setSubmitError(null)
                }}
                placeholder=""
                rows={4}
                autoFocus
                className="mt-5 min-h-[120px] w-full resize-none bg-transparent text-[14px] leading-[1.4] text-white outline-none placeholder:text-white/24"
              />

              <div className="mt-2 flex justify-end text-[11px] text-white/34">{content.length}/500</div>

              {mediaPreview ? (
                <div className="relative mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black">
                  <img src={mediaPreview} alt="" className="h-[220px] w-full object-cover" />
                  <button
                    onClick={() => setMediaPreview(null)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/72"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-b border-white/[0.06] py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] text-white/74">Sugestões de tags</span>
            <button
              type="button"
              onClick={() => setContent((prev) => `${prev}${prev ? ' ' : ''}#`)}
              className="flex items-center gap-1 text-[12px] font-medium text-violet-400"
            >
              Adicionar tag
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setContent((prev) => `${prev}${prev ? ' ' : ''}${tag}`)}
                className="rounded-full border border-violet-500/18 bg-white/[0.02] px-3 py-1.5 text-[12px] text-violet-300"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-white/[0.06] py-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
            <div
              onClick={() => setIsLocked(!isLocked)}
              className="flex cursor-pointer items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.03]">
                  <Lock className={`h-5 w-5 ${isLocked ? 'text-violet-400' : 'text-white/42'}`} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white">Conteúdo premium</div>
                  <div className="mt-0.5 text-[12px] text-white/42">Exige pagamento via Pix para visualizar</div>
                </div>
              </div>

              <div className={`relative h-7 w-12 rounded-full transition-colors ${isLocked ? 'bg-violet-600' : 'bg-white/10'}`}>
                <motion.div
                  className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                  animate={{ left: isLocked ? '26px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                />
              </div>
            </div>

            {isLocked ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 border-t border-white/[0.06] pt-3"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 flex-shrink-0 text-violet-400" />
                  <span className="text-[12px] text-white/60">Preço em R$</span>
                </div>
                <input
                  type="number"
                  placeholder="Ex: 29,90"
                  value={price}
                  inputMode="decimal"
                  min="1"
                  step="0.01"
                  onChange={(event) => {
                    setPrice(event.target.value)
                    if (submitError) setSubmitError(null)
                  }}
                  className="mt-2 w-full border-b border-white/12 bg-transparent pb-2 text-[14px] text-white outline-none placeholder:text-white/26"
                />
                <p className="mt-2 text-[11px] text-white/42">Mínimo de R$ 1,00 para posts premium.</p>
              </motion.div>
            ) : null}
          </div>
        </div>

        <div className="border-b border-white/[0.06] py-4">
          <button
            type="button"
            onClick={() => setShowMoreOptions((prev) => !prev)}
            className="flex items-center gap-2 text-[12px] text-white/56"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
            Mais opções (visibilidade, prévia, prazo)
          </button>

          {showMoreOptions ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-3 text-[12px] text-white/42"
            >
              Em breve você poderá controlar visibilidade, prévia pública e prazo do conteúdo.
            </motion.div>
          ) : null}
        </div>

        {submitError ? (
          <div className="mt-4 rounded-[18px] border border-rose-500/20 bg-rose-500/10 p-3 text-[13px] text-rose-100">
            {submitError}
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/[0.06] bg-[rgba(10,10,16,0.92)] px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            className="flex min-w-[64px] flex-col items-center gap-1.5 rounded-[14px] px-2 py-2 text-violet-400"
            aria-label="Escolher foto da galeria"
          >
            <Image className="h-5 w-5" />
            <span className="text-[11px] text-white/72">Foto</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex min-w-[64px] flex-col items-center gap-1.5 rounded-[14px] px-2 py-2 text-violet-400"
            aria-label="Abrir câmera para foto"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[11px] text-white/72">Câmera</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmojis((prev) => !prev)}
            className={`flex min-w-[64px] flex-col items-center gap-1.5 rounded-[14px] px-2 py-2 ${
              showEmojis ? 'text-violet-400' : 'text-violet-400'
            }`}
          >
            <Smile className="h-5 w-5" />
            <span className="text-[11px] text-white/72">Emoji</span>
          </button>

          <button
            type="button"
            onClick={() => setContent((prev) => `${prev}${prev ? ' ' : ''}#`)}
            className="flex min-w-[64px] flex-col items-center gap-1.5 rounded-[14px] px-2 py-2 text-violet-400"
          >
            <Hash className="h-5 w-5" />
            <span className="text-[11px] text-white/72">Hashtag</span>
          </button>

          <div className="ml-auto flex items-center gap-4 pl-3">
            <div className="h-10 w-px bg-white/[0.08]" />
            <span
              className={`text-[11px] ${
                remainingChars < 0 ? 'text-rose-400' : remainingChars < 30 ? 'text-amber-300' : 'text-white/44'
              }`}
            >
              {content.length}/500
            </span>
          </div>
        </div>

        {showEmojis ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-white/78"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  )
}
