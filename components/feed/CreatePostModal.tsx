'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Image, Camera, Smile, Lock, DollarSign, Send, Hash } from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'

interface CreatePostModalProps {
  onClose: () => void
}

const EMOJIS = ['😊', '🔥', '💜', '✨', '🌙', '👑', '💎', '🚀', '🎯', '💫', '❤️', '🌟', '👏', '🎉', '💪']

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { user } = useUser()
  const { addPost } = usePosts()
  const [content, setContent] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [price, setPrice] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePost = async () => {
    if (!content.trim() && !mediaPreview) return
    setPosting(true)
    await new Promise(r => setTimeout(r, 800))
    
    addPost({
      userId: user?.id || 'user-001',
      userName: user?.name || 'Usuário',
      userAvatar: user?.avatar || '',
      userUsername: user?.username || '@usuario',
      isVerified: user?.isVerified || false,
      content: content.trim(),
      media: mediaPreview ? [{ type: 'image', url: mediaPreview }] : undefined,
      isLocked,
      price: isLocked && price ? parseFloat(price) : undefined,
      hashtags: content.match(/#(\w+)/g)?.map(h => h.slice(1)) || [],
    })
    
    setPosting(false)
    onClose()
  }

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji)
    setShowEmojis(false)
    textareaRef.current?.focus()
  }

  const handleImageUpload = () => {
    const mockImages = [
      'https://picsum.photos/seed/post' + Date.now() + '/800/600',
    ]
    setMediaPreview(mockImages[0])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <button
          onClick={onClose}
          className="p-2 glass rounded-xl border border-white/10"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <span className="font-bold text-white">Novo Post</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          disabled={(!content.trim() && !mediaPreview) || posting}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            content.trim() || mediaPreview
              ? 'btn-primary text-white'
              : 'glass border border-white/10 text-white/30'
          }`}
        >
          {posting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publicar
            </>
          )}
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-3">
          <img
            src={user?.avatar}
            alt=""
            className="w-10 h-10 rounded-full border-2 border-violet-500/40 flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="O que está acontecendo? Compartilhe com seus fãs..."
              rows={5}
              autoFocus
              className="w-full bg-transparent text-white placeholder-white/30 outline-none resize-none text-base leading-relaxed"
            />

            {mediaPreview && (
              <div className="relative mt-3 rounded-2xl overflow-hidden">
                <img src={mediaPreview} alt="" className="w-full max-h-64 object-cover" />
                <button
                  onClick={() => setMediaPreview(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-dark/80 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Hashtag suggestion */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['#OnlyDay', '#Exclusivo', '#Premium', '#Criador'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setContent(prev => prev + ' ' + tag)}
                  className="text-xs px-3 py-1 glass rounded-full border border-violet-500/20 text-violet-400 hover:border-violet-500/50 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lock content toggle */}
        <div className="mt-6 glass rounded-2xl p-4 border border-white/10">
          <div
            onClick={() => setIsLocked(!isLocked)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-violet-500/20' : 'glass border border-white/10'}`}>
                <Lock className={`w-5 h-5 ${isLocked ? 'text-violet-400' : 'text-white/40'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Conteúdo Premium</div>
                <div className="text-xs text-white/40">Exige pagamento via Pix para visualizar</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all ${isLocked ? 'bg-violet-600' : 'bg-white/10'} relative`}>
              <motion.div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                animate={{ left: isLocked ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            </div>
          </div>

          {isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-white/5"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span className="text-xs text-white/60">Preço em R$:</span>
                <input
                  type="number"
                  placeholder="Ex: 29,90"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm border-b border-white/20 pb-1"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-t border-white/5 px-4 py-3 glass">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleImageUpload}
            className="p-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Image className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleImageUpload}
            className="p-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Camera className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setShowEmojis(!showEmojis)}
            className={`p-2 transition-colors ${showEmojis ? 'text-violet-400' : 'text-white/40 hover:text-violet-400'}`}
          >
            <Smile className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setContent(prev => prev + '#')}
            className="p-2 text-white/40 hover:text-violet-400 transition-colors"
          >
            <Hash className="w-6 h-6" />
          </motion.button>
          <div className="flex-1" />
          <span className={`text-xs ${content.length > 400 ? 'text-red-400' : 'text-white/30'}`}>
            {500 - content.length}
          </span>
        </div>

        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-white/5"
          >
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-xl hover:scale-125 transition-transform"
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