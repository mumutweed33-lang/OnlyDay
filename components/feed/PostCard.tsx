'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  MessageCircle,
  Share2,
  Bookmark,
  Lock,
  MoreHorizontal,
  BadgeCheck,
  DollarSign,
  Eye,
  Copy,
  Flag,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { Post, usePosts } from '@/components/providers/PostContext'
import { useMessages } from '@/components/providers/MessageContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import { queueOdRefresh, trackOdEvent } from '@/lib/od-core/signal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PublicProfile } from '@/types/domain'

interface PostCardProps {
  post: Post
  onOpenProfile?: (profile: PublicProfile) => void
  onOpenTag?: (tag: string) => void
  onOpenPost?: (post: Post) => void
}

export function PostCard({ post, onOpenProfile, onOpenTag, onOpenPost }: PostCardProps) {
  const { likePost, savePost, deletePost } = usePosts()
  const { user } = useUser()
  const { conversations } = useMessages()
  const { getComments, addComment, sharePost, getShareCount, notifyPostLiked } = useSocial()
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showUnlockDemoModal, setShowUnlockDemoModal] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })
  const comments = getComments(post.id)
  const totalComments = post.comments + comments.length
  const totalShares = getShareCount(post.id, post.shares)
  const isOwnPost = user?.id === post.userId || user?.username === post.userUsername

  const pushFeedback = (message: string) => {
    setActionFeedback(message)
    window.setTimeout(() => {
      setActionFeedback((current) => (current === message ? null : current))
    }, 2200)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!post.isLiked) {
      notifyPostLiked(post)
    }
    void likePost(post.id)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (user?.id) {
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'feed',
        eventType: 'post_save',
      })
      queueOdRefresh(user.id)
    }
    void savePost(post.id)
    pushFeedback(post.isSaved ? 'Post removido dos seus salvos.' : 'Post salvo para ver depois.')
  }

  const handleUnlock = () => {
    if (user?.id) {
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'vault',
        eventType: 'vault_open',
      })
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'vault',
        eventType: 'vault_unlock_click',
      })
      queueOdRefresh(user.id)
    }
    setShowUnlockDemoModal(true)
  }

  const simulateUnlock = () => {
    setShowUnlock(true)
    if (user?.id) {
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'vault',
        eventType: 'vault_unlock_paid',
        metadata: { mode: 'demo' },
      })
      queueOdRefresh(user.id)
    }
    window.setTimeout(() => {
      setUnlocked(true)
      setShowUnlock(false)
      setShowUnlockDemoModal(false)
    pushFeedback('Conteúdo premium liberado no modo demo.')
    }, 900)
  }

  const openProfile = () => {
    if (user?.id) {
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'feed',
        eventType: 'profile_view',
      })
      queueOdRefresh(user.id)
    }
    onOpenProfile?.({
      id: post.userId,
      name: post.userName,
      username: post.userUsername,
      avatar: post.userAvatar,
      isVerified: post.isVerified,
      isCreator: true,
    })
  }

  const handleCommentSubmit = () => {
    if (!commentDraft.trim()) return
    addComment(post, commentDraft)
    setCommentDraft('')
    pushFeedback('Comentario enviado com sucesso.')
  }

  const handleShare = (targetLabel?: string) => {
    sharePost(post, targetLabel)
    setShowShare(false)
    pushFeedback(
      targetLabel ? `Post compartilhado com ${targetLabel}.` : 'Post compartilhado com sucesso.'
    )
  }

  return (
    <motion.div
      className="border-b border-white/5 px-4 py-4"
      whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.02)' }}
    >
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100"
          >
            {actionFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <button className="relative" onClick={openProfile} aria-label={`Abrir perfil de ${post.userName}`}>
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
          </button>
          <button className="text-left" onClick={openProfile} aria-label={`Ver perfil de ${post.userName}`}>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white text-sm">{post.userName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <span>{post.userUsername}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMenu(!showMenu)}
          aria-label={showMenu ? 'Fechar menu do post' : 'Abrir menu do post'}
          className="p-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="mb-3 rounded-2xl border border-white/10 bg-[#120d1d] p-2 shadow-[0_18px_55px_rgba(0,0,0,0.35)]"
          >
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${post.userName}: ${post.content}`)
                setShowMenu(false)
                pushFeedback('Texto copiado.')
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              <Copy className="h-4 w-4" />
              Copiar texto
            </button>
            <button
              onClick={() => {
                setShowShare(true)
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
            {isOwnPost ? (
              <button
                onClick={() => {
                  void deletePost(post.id)
                  setShowMenu(false)
                  pushFeedback('Post excluido com sucesso.')
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Excluir post
              </button>
            ) : (
              <button
                onClick={() => {
                  if (user?.id) {
                    void trackOdEvent({
                      actorProfileId: user.id,
                      targetProfileId: post.userId,
                      postId: post.id,
                      surface: 'feed',
                      eventType: 'report_content',
                    })
                    queueOdRefresh(user.id)
                  }
                  setShowMenu(false)
                  pushFeedback('Denuncia enviada para revisao.')
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                <Flag className="h-4 w-4" />
                Reportar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div
        className="mb-3 block w-full cursor-pointer text-left"
        onClick={() => onOpenPost?.(post)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenPost?.(post)
          }
        }}
      >
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content.split(/#(\w+)/g).map((part, i) =>
            i % 2 === 1 ? (
              <button
                key={i}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenTag?.(part)
                }}
                className="text-violet-400"
              >
                #{part}
              </button>
            ) : part
          )}
        </p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div
          className="mb-3 block w-full cursor-pointer overflow-hidden rounded-2xl relative text-left"
          onClick={() => onOpenPost?.(post)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpenPost?.(post)
            }
          }}
        >
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
                <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                  Demo de desbloqueio
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUnlock}
                  aria-label="Desbloquear conteúdo premium via Pix"
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
            aria-label={post.isLiked ? 'Descurtir post' : 'Curtir post'}
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
            onClick={() => setShowComments(true)}
            aria-label="Abrir comentários"
            className="flex items-center gap-1.5 text-white/40 hover:text-violet-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{totalComments.toLocaleString('pt-BR')}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setShowShare(true)}
            aria-label="Compartilhar post"
            className="flex items-center gap-1.5 text-white/40 hover:text-green-400 transition-colors"
          >
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">{totalShares.toLocaleString('pt-BR')}</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          {!post.isLocked && post.media && (
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => onOpenPost?.(post)}
              aria-label="Ver detalhes do post"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <Eye className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleSave}
            aria-label={post.isSaved ? 'Remover post dos salvos' : 'Salvar post'}
            className={`transition-colors ${post.isSaved ? 'text-violet-400' : 'text-white/40 hover:text-violet-400'}`}
          >
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-violet-400' : ''}`} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showUnlockDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Desbloqueio em demo</h3>
                <p className="text-xs text-white/40">Pagamento real ainda não foi ligado neste post.</p>
                </div>
                <button onClick={() => setShowUnlockDemoModal(false)} aria-label="Fechar desbloqueio em demo" className="text-white/40">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
                Para testes, você pode simular o pagamento. Em produção, aqui entra QR Code, status e confirmação real.
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => setShowUnlockDemoModal(false)}
                  className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/70"
                >
                  Voltar
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={simulateUnlock}
                  className="rounded-2xl btn-primary py-3 text-sm font-bold text-white"
                >
                  Simular pagamento demo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
              <h3 className="text-lg font-black text-white">Comentários</h3>
                  <p className="text-xs text-white/40">Conversa em torno desse post</p>
                </div>
                <button onClick={() => setShowComments(false)} aria-label="Fechar comentários" className="text-white/40">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 max-h-72 space-y-3 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">
                    {post.comments > 0
                  ? `Este post já mostra ${post.comments.toLocaleString('pt-BR')} comentários no feed, mas os detalhes ainda não foram carregados nesta sessão.`
                  : 'Ainda não tem comentários aqui. Seja a primeira pessoa a comentar.'}
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <img src={comment.userAvatar} alt={comment.userName} className="h-8 w-8 rounded-full border border-violet-500/30" />
                        <div>
                          <div className="text-sm font-semibold text-white">{comment.userName}</div>
                          <div className="text-[11px] text-white/35">{comment.userUsername}</div>
                        </div>
                      </div>
                      <p className="text-sm text-white/70">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 p-2">
                <input
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Escreva seu comentario..."
                  className="flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/30"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCommentSubmit}
                  className="rounded-xl btn-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  Enviar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Compartilhar post</h3>
              <p className="text-xs text-white/40">Envie para conversas e perfis que você acompanha</p>
                </div>
                <button onClick={() => setShowShare(false)} aria-label="Fechar compartilhamento" className="text-white/40">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleShare(conversation.userName)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left"
                  >
                    <img src={conversation.userAvatar} alt={conversation.userName} className="h-10 w-10 rounded-full border border-violet-500/30" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white">{conversation.userName}</div>
                      <div className="truncate text-xs text-white/35">{conversation.userUsername}</div>
                    </div>
                    <Send className="h-4 w-4 text-violet-300" />
                  </button>
                ))}
                {conversations.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">
                    Suas conversas vão aparecer aqui para compartilhar.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}



