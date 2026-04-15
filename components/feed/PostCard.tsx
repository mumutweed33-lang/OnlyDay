'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, MessageCircle, Share2, Bookmark, Lock, MoreHorizontal, BadgeCheck, DollarSign, Eye } from 'lucide-react'
import { Post, usePosts } from '@/components/providers/PostContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { likePost, savePost } = usePosts()
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    likePost(post.id)
  }

  const handleUnlock = () => {
    setShowUnlock(true)
    setTimeout(() => {
      setUnlocked(true)
      setShowUnlock(false)
    }, 1500)
  }

  return (
    <motion.div
      className="border-b border-white/5 px-4 py-4"
      whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.02)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-10 h-10 rounded-full border-2 border-violet-500/40"
            />
            {post.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white text-sm">{post.userName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span>{post.userUsername}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content.split(/#(\w+)/g).map((part, i) =>
            i % 2 === 1 ? (
              <span key={i} className="text-violet-400">#{part}</span>
            ) : part
          )}
        </p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-2xl overflow-hidden relative">
          {post.isLocked && !unlocked ? (
            <div className="relative">
              <img
                src={post.media[0].url}
                alt=""
                className="w-full max-h-64 object-cover filter blur-xl scale-105"
              />
              <div className="absolute inset-0 bg-dark/60 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full glass border border-violet-500/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Conteúdo Premium</p>
                  {post.price && (
                    <p className="text-violet-400 text-xs font-bold mt-1">R$ {post.price.toFixed(2)}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUnlock}
                  className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
                >
                  {showUnlock ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Desbloquear via Pix
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={post.isLocked ? { opacity: 0, scale: 0.95 } : {}}
              animate={post.isLocked ? { opacity: 1, scale: 1 } : {}}
            >
              <img
                src={post.media[0].url}
                alt=""
                className="w-full max-h-80 object-cover"
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            className="flex items-center gap-1.5 group"
          >
            <div className={`relative ${post.isLiked ? 'text-amber-400' : 'text-white/40 group-hover:text-amber-400'} transition-colors`}>
              <Sun className={`w-5 h-5 ${post.isLiked ? 'fill-amber-400' : ''}`} strokeWidth={1.5} />
              {post.isLiked && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 rounded-full bg-amber-400"
                />
              )}
            </div>
            <span className={`text-xs ${post.isLiked ? 'text-amber-400' : 'text-white/40'}`}>
              {post.likes.toLocaleString('pt-BR')}
            </span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            className="flex items-center gap-1.5 text-white/40 hover:text-violet-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{post.comments.toLocaleString('pt-BR')}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            className="flex items-center gap-1.5 text-white/40 hover:text-green-400 transition-colors"
          >
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{post.shares.toLocaleString('pt-BR')}</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          {!post.isLocked && post.media && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Eye className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => savePost(post.id)}
            className={`transition-colors ${post.isSaved ? 'text-violet-400' : 'text-white/40 hover:text-violet-400'}`}
          >
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-violet-400' : ''}`} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}