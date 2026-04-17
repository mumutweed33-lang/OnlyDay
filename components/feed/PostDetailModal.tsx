'use client'

import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Lock, X } from 'lucide-react'
import { queueOdRefresh, trackOdEvent } from '@/lib/od-core/signal'
import type { FeedPost } from '@/types/domain'

interface PostDetailModalProps {
  post: FeedPost | null
  viewerId?: string
  onClose: () => void
  onOpenTag?: (tag: string) => void
}

export function PostDetailModal({
  post,
  viewerId,
  onClose,
  onOpenTag,
}: PostDetailModalProps) {
  useEffect(() => {
    if (!post || !viewerId) return

    void trackOdEvent({
      actorProfileId: viewerId,
      targetProfileId: post.userId,
      postId: post.id,
      surface: 'feed',
      eventType: 'post_view',
      metadata: { source: 'post_detail_modal' },
    })
    queueOdRefresh(viewerId)
  }, [post, viewerId])

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0a18] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black text-white">{post.userName}</h3>
                  {post.isVerified && <BadgeCheck className="h-4 w-4 text-violet-400" />}
                </div>
                <p className="text-xs text-white/35">{post.userUsername}</p>
              </div>
        <button onClick={onClose} aria-label="Fechar detalhes do post" className="text-white/40">
                <X className="h-5 w-5" />
              </button>
            </div>

            {post.media?.[0] && (
              <div className="relative">
                <img src={post.media[0].url} alt="" className="max-h-[360px] w-full object-cover" />
                {post.isLocked && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-dark/80 px-2 py-1">
                    <Lock className="h-3 w-3 text-violet-400" />
                    <span className="text-[10px] font-bold text-violet-100">
                      {post.price ? `R$ ${post.price.toFixed(2)}` : 'Premium'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 px-5 py-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{post.content}</p>

              {(post.hashtags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(post.hashtags ?? []).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        onOpenTag?.(tag)
                        onClose()
                      }}
                      className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-200"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 text-center">
                <div>
                  <div className="text-base font-black text-white">{post.likes.toLocaleString('pt-BR')}</div>
                  <div className="text-[11px] text-white/35">Curtidas</div>
                </div>
                <div>
                  <div className="text-base font-black text-white">{post.comments.toLocaleString('pt-BR')}</div>
            <div className="text-[11px] text-white/35">Comentários</div>
                </div>
                <div>
                  <div className="text-base font-black text-white">{post.shares.toLocaleString('pt-BR')}</div>
                  <div className="text-[11px] text-white/35">Compart.</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
