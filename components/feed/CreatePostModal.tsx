'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, DollarSign, Hash, Image, Lock, Send, Smile, X } from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'

interface CreatePostModalProps {
  onClose: () => void
}

const EMOJIS = [':)', 'fire', 'love', 'spark', 'moon', 'crown', 'gem', 'rocket']

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const normalizedPrice = price.replace(',', '.').trim()
  const parsedPrice = normalizedPrice ? Number(normalizedPrice) : NaN
  const hasValidPremiumPrice = !isLocked || (Number.isFinite(parsedPrice) && parsedPrice >= 1)
  const canPublish = (!!content.trim() || !!mediaPreview) && !posting && hasValidPremiumPrice

  const handlePost = async () => {
    if (!content.trim() && !mediaPreview) return
    if (isLocked && !hasValidPremiumPrice) {
      setSubmitError('Defina um preço mínimo de R$ 1,00 para publicar conteúdo premium.')
      return
    }

    setSubmitError(null)
    setPosting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))

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

    setPosting(false)
    onClose()
  }

  const addEmoji = (emoji: string) => {
    setContent((prev) => `${prev}${emoji}`)
    setShowEmojis(false)
    textareaRef.current?.focus()
  }

  const handleImageUpload = () => {
    setMediaPreview(`https://picsum.photos/seed/post-${Date.now()}/800/600`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-dark/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
          <button onClick={onClose} aria-label="Fechar criação de post" className="rounded-xl border border-white/10 p-2 glass">
          <X className="h-5 w-5 text-white" />
        </button>
        <span className="font-bold text-white">Novo Post</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          disabled={!canPublish}
          className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition-all ${
            canPublish
              ? 'btn-primary text-white'
              : 'border border-white/10 text-white/30 glass'
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

      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-3">
          <img
            src={user?.avatar}
            alt=""
            className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-violet-500/40"
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(event) => {
                setContent(event.target.value)
                if (submitError) setSubmitError(null)
              }}
              placeholder="O que esta acontecendo? Compartilhe com seus fas..."
              rows={5}
              autoFocus
              className="w-full resize-none bg-transparent text-base leading-relaxed text-white outline-none placeholder:text-white/30"
            />

            {mediaPreview && (
              <div className="relative mt-3 overflow-hidden rounded-2xl">
                <img src={mediaPreview} alt="" className="max-h-64 w-full object-cover" />
                <button
                  onClick={() => setMediaPreview(null)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-dark/80"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {['#OnlyDay', '#Exclusivo', '#Premium', '#Criador'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setContent((prev) => `${prev} ${tag}`)}
                  className="rounded-full border border-violet-500/20 px-3 py-1 text-xs text-violet-400 glass transition-colors hover:border-violet-500/50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 p-4 glass">
          <div
            onClick={() => setIsLocked(!isLocked)}
            className="flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isLocked ? 'bg-violet-500/20' : 'border border-white/10 glass'
                }`}
              >
                <Lock className={`h-5 w-5 ${isLocked ? 'text-violet-400' : 'text-white/40'}`} />
              </div>
              <div>
                  <div className="text-sm font-semibold text-white">Conteúdo Premium</div>
                <div className="text-xs text-white/40">Exige pagamento via Pix para visualizar</div>
              </div>
            </div>
            <div className={`relative h-6 w-12 rounded-full ${isLocked ? 'bg-violet-600' : 'bg-white/10'}`}>
              <motion.div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                animate={{ left: isLocked ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </div>
          </div>

          {isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 border-t border-white/5 pt-3"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 flex-shrink-0 text-violet-400" />
                <span className="text-xs text-white/60">Preco em R$:</span>
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
                  className="flex-1 border-b border-white/20 bg-transparent pb-1 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
              <p className="mt-2 text-[11px] text-white/45">
                Mínimo de R$ 1,00 para posts premium.
              </p>
            </motion.div>
          )}
        </div>

        {submitError && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
            {submitError}
          </div>
        )}
      </div>

      <div className="border-t border-white/5 px-4 py-3 glass">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleImageUpload}
            className="p-2 text-violet-400 transition-colors hover:text-violet-300"
          >
            <Image className="h-6 w-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleImageUpload}
            className="p-2 text-violet-400 transition-colors hover:text-violet-300"
          >
            <Camera className="h-6 w-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowEmojis(!showEmojis)}
            className={`p-2 transition-colors ${
              showEmojis ? 'text-violet-400' : 'text-white/40 hover:text-violet-400'
            }`}
          >
            <Smile className="h-6 w-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setContent((prev) => `${prev}#`)}
            className="p-2 text-white/40 transition-colors hover:text-violet-400"
          >
            <Hash className="h-6 w-6" />
          </motion.button>
          <div className="flex-1" />
          <span
            className={`text-xs ${
              content.length > 470 ? 'text-red-400' : content.length > 430 ? 'text-amber-300' : 'text-white/30'
            }`}
          >
            {500 - content.length}
          </span>
        </div>

        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-wrap gap-2 border-t border-white/5 pt-3"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/75 transition-transform hover:scale-105"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
