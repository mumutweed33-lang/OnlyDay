'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Sparkles } from 'lucide-react'
import { MomentosBar } from '@/components/momentos/MomentosBar'
import { MomentoViewer } from '@/components/momentos/MomentoViewer'
import { PostCard } from '@/components/feed/PostCard'
import { usePosts } from '@/components/providers/PostContext'
import { useMomentos } from '@/components/providers/MomentoContext'

export function FeedPage() {
  const { posts } = usePosts()
  const { activeMomento } = useMomentos()
  const [showNotification, setShowNotification] = useState(false)

  return (
    <div className="min-h-screen bg-dark">
      {/* Momento Viewer overlay */}
      <AnimatePresence>
        {activeMomento && <MomentoViewer />}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-30 glass border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span className="text-lg font-black text-gradient">OnlyDay</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotification(!showNotification)}
              className="relative w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/10"
            >
              <Bell className="w-4 h-4 text-white/70" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-violet-600 rounded-full border-2 border-dark" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/10"
            >
              <Search className="w-4 h-4 text-white/70" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Momentos Bar */}
      <MomentosBar />

      {/* Feed divider */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-white/30 font-medium">Para Você</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Posts */}
      <div className="space-y-0">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </div>

      {/* Load more skeleton */}
      <div className="px-4 py-8 flex flex-col items-center gap-4">
        {[1, 2].map(i => (
          <div key={i} className="w-full glass rounded-2xl p-4 border border-white/5 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/5" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-white/5 rounded mb-1" />
                <div className="h-2 w-16 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-3 w-full bg-white/5 rounded mb-1" />
            <div className="h-3 w-3/4 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}