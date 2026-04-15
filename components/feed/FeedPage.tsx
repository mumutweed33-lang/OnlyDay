'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Search, Sparkles, TrendingUp } from 'lucide-react'
import { MomentoViewer } from '@/components/momentos/MomentoViewer'
import { MomentosBar } from '@/components/momentos/MomentosBar'
import { PostCard } from '@/components/feed/PostCard'
import { useMomentos } from '@/components/providers/MomentoContext'
import { usePosts } from '@/components/providers/PostContext'

export function FeedPage() {
  const { posts } = usePosts()
  const { activeMomento } = useMomentos()
  const [showNotification, setShowNotification] = useState(false)

  return (
    <div className="min-h-screen bg-dark pb-28">
      <AnimatePresence>{activeMomento && <MomentoViewer />}</AnimatePresence>

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,4,12,0.84)] px-4 py-3 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 ring-1 ring-violet-300/15">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <span className="text-lg font-black text-gradient">OnlyDay</span>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">feed premium</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotification(!showNotification)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6"
            >
              <Bell className="h-4 w-4 text-white/70" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-dark bg-violet-600" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6"
            >
              <Search className="h-4 w-4 text-white/70" />
            </motion.button>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-white/[0.045] p-3 shadow-[0_14px_50px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/30">Hoje para voce</p>
              <p className="mt-1 text-sm text-white/70">
                Conteudos com maior resposta e proximidade da sua rede.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/15">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </div>
      </div>

      <MomentosBar />

      <div className="flex items-center gap-3 px-4 py-4">
        <div className="h-px flex-1 bg-white/5" />
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Para voce
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="space-y-0">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 px-4 py-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-full animate-pulse rounded-3xl border border-white/8 bg-white/[0.04] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.2)]"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/5" />
              <div className="flex-1">
                <div className="mb-1 h-3 w-24 rounded bg-white/5" />
                <div className="h-2 w-16 rounded bg-white/5" />
              </div>
            </div>
            <div className="mb-1 h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-3/4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
