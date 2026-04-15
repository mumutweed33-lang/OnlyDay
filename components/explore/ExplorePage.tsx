'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Flame, Hash, Search, Sparkles, TrendingUp, Users } from 'lucide-react'

const TRENDING_TOPICS = [
  { tag: 'OnlyDay', posts: '12.4K', hot: true },
  { tag: 'CriadorBR', posts: '8.9K', hot: true },
  { tag: 'PremiumLife', posts: '6.2K', hot: false },
  { tag: 'EmpireBuilder', posts: '5.1K', hot: false },
  { tag: 'MomentosVault', posts: '4.7K', hot: true },
  { tag: 'ChatVIP', posts: '3.8K', hot: false },
]

const RISING_CREATORS = [
  { id: '1', name: 'Luna Estrela', username: '@lunaestela', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=7C3AED', followers: '124K', growth: '+2.3K', verified: true, category: 'Lifestyle' },
  { id: '2', name: 'Sofia Dark', username: '@sofiadark', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=5B21B6', followers: '89K', growth: '+1.8K', verified: true, category: 'Arte' },
  { id: '3', name: 'Viktor Elite', username: '@viktrelite', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viktor&backgroundColor=4C1D95', followers: '203K', growth: '+4.1K', verified: true, category: 'Business' },
  { id: '4', name: 'Aria Mystic', username: '@ariamystic', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aria&backgroundColor=7C3AED', followers: '45K', growth: '+890', verified: false, category: 'Musica' },
  { id: '5', name: 'Marco Vibe', username: '@marcovibe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco&backgroundColor=6D28D9', followers: '31K', growth: '+650', verified: false, category: 'Fitness' },
]

const CATEGORIES = ['Tudo', 'Lifestyle', 'Arte', 'Musica', 'Fitness', 'Business']

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tudo')
  const [searching, setSearching] = useState(false)

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length > 2) {
      setSearching(true)
      await new Promise((r) => setTimeout(r, 450))
      setSearching(false)
    }
  }

  const filteredCreators =
    activeCategory === 'Tudo'
      ? RISING_CREATORS
      : RISING_CREATORS.filter((creator) => creator.category === activeCategory)

  const matchingCreators = RISING_CREATORS.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const matchingTopics = TRENDING_TOPICS.filter((topic) =>
    topic.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark pb-28">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,4,12,0.84)] px-4 py-4 backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Explorar</h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">descoberta premium</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            <Sparkles className="h-3 w-3" />
            IA
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar criadores, topicos e movimentos..."
            className="w-full rounded-2xl border border-white/10 bg-white/6 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-violet-500/40"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          )}
        </div>
      </div>

      <div className="space-y-6 p-4">
        {!searchQuery && (
          <>
            <div className="rounded-[28px] border border-white/8 bg-white/[0.045] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/30">Radar do dia</p>
                  <p className="mt-1 text-sm text-white/72">
                    Assuntos, criadores e comportamentos com maior velocidade de crescimento.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/15">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <h2 className="font-bold text-white">Tendencias no Brasil</h2>
              </div>
              <div className="space-y-2">
                {TRENDING_TOPICS.map((topic, i) => (
                  <motion.div
                    key={topic.tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.16)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-xs text-white/30">#{i + 1}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-violet-400" />
                          <span className="text-sm font-semibold text-white">{topic.tag}</span>
                          {topic.hot && <Flame className="h-3 w-3 fill-orange-400 text-orange-400" />}
                        </div>
                        <div className="text-xs text-white/35">{topic.posts} posts</div>
                      </div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                <h2 className="font-bold text-white">Criadores em ascensao</h2>
              </div>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={
                      'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ' +
                      (activeCategory === category
                        ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_12px_26px_rgba(124,58,237,0.35)]'
                        : 'border border-white/10 bg-white/6 text-white/50')
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filteredCreators.map((creator, i) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.045] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                  >
                    <div className="relative">
                      <img src={creator.avatar} alt={creator.name} className="h-12 w-12 rounded-2xl border border-violet-500/30" />
                      {creator.verified && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-dark bg-violet-600">
                          <BadgeCheck className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">{creator.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{creator.username}</span>
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                          {creator.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{creator.followers}</div>
                      <div className="text-xs font-semibold text-emerald-400">{creator.growth}</div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="rounded-xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_12px_26px_rgba(124,58,237,0.35)]"
                    >
                      Seguir
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {searchQuery && (
          <div className="space-y-5">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/60">Usuarios</h3>
              {matchingCreators.map((creator) => (
                <div key={creator.id} className="mb-2 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                  <img src={creator.avatar} alt={creator.name} className="h-10 w-10 rounded-full border border-violet-500/30" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{creator.name}</div>
                    <div className="text-xs text-white/40">{creator.username} · {creator.followers} seguidores</div>
                  </div>
                  {creator.verified && <BadgeCheck className="h-4 w-4 text-violet-400" />}
                </div>
              ))}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/60">Topicos</h3>
              {matchingTopics.map((topic) => (
                <div key={topic.tag} className="mb-2 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
                  <Hash className="h-4 w-4 text-violet-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">#{topic.tag}</div>
                    <div className="text-xs text-white/40">{topic.posts} posts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
