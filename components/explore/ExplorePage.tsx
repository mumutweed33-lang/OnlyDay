'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, Sparkles, Users, Hash, Star, BadgeCheck, Flame } from 'lucide-react'

const TRENDING_TOPICS = [
  { tag: 'OnlyDay', posts: '12.4K', trend: 'up', hot: true },
  { tag: 'CriadorBR', posts: '8.9K', trend: 'up', hot: true },
  { tag: 'PremiumLife', posts: '6.2K', trend: 'up', hot: false },
  { tag: 'EmpireBuilder', posts: '5.1K', trend: 'up', hot: false },
  { tag: 'MomentosVault', posts: '4.7K', trend: 'up', hot: true },
  { tag: 'ChatVIP', posts: '3.8K', trend: 'up', hot: false },
  { tag: 'AuctionBR', posts: '3.2K', trend: 'stable', hot: false },
  { tag: 'DiamondCreator', posts: '2.9K', trend: 'up', hot: false },
]

const RISING_CREATORS = [
  { id: '1', name: 'Luna Estrela', username: '@lunaestela', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=7C3AED', followers: '124K', growth: '+2.3K', verified: true, category: 'Lifestyle' },
  { id: '2', name: 'Sofia Dark', username: '@sofiadark', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=5B21B6', followers: '89K', growth: '+1.8K', verified: true, category: 'Arte' },
  { id: '3', name: 'Viktor Elite', username: '@viktrelite', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viktor&backgroundColor=4C1D95', followers: '203K', growth: '+4.1K', verified: true, category: 'Business' },
  { id: '4', name: 'Aria Mystic', username: '@ariamystic', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aria&backgroundColor=7C3AED', followers: '45K', growth: '+890', verified: false, category: 'Música' },
  { id: '5', name: 'Marco Vibe', username: '@marcovibe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco&backgroundColor=6D28D9', followers: '31K', growth: '+650', verified: false, category: 'Fitness' },
]

const CATEGORIES = ['Tudo', 'Lifestyle', 'Arte', 'Música', 'Fitness', 'Business', 'Games', 'Culinária']

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tudo')
  const [searching, setSearching] = useState(false)

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length > 2) {
      setSearching(true)
      await new Promise(r => setTimeout(r, 500))
      setSearching(false)
    }
  }

  const filteredCreators = activeCategory === 'Tudo'
    ? RISING_CREATORS
    : RISING_CREATORS.filter(c => c.category === activeCategory)

  return (
    <div className='min-h-screen bg-dark'>
      <div className='sticky top-0 z-30 glass border-b border-white/5 px-4 py-4'>
        <h1 className='text-xl font-black text-white mb-3'>Explorar</h1>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30' />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder='Buscar criadores, tópicos, tendências...'
            className='w-full glass rounded-2xl pl-10 pr-4 py-3 text-white placeholder-white/30 border border-white/10 focus:border-violet-500/40 outline-none text-sm transition-all'
          />
          {searching && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin' />
          )}
        </div>
      </div>

      <div className='p-4 space-y-6'>
        {!searchQuery && (
          <>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Flame className='w-5 h-5 text-orange-400' />
                <h2 className='font-bold text-white'>Tendências no Brasil</h2>
                <div className='ml-auto text-xs text-violet-400 flex items-center gap-1'>
                  <Sparkles className='w-3 h-3' /> IA
                </div>
              </div>
              <div className='space-y-2'>
                {TRENDING_TOPICS.map((topic, i) => (
                  <motion.div
                    key={topic.tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className='flex items-center justify-between glass rounded-xl px-4 py-3 border border-white/5 hover:border-violet-500/20 cursor-pointer transition-all'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-xs text-white/30 w-4'>#{i + 1}</span>
                      <div>
                        <div className='flex items-center gap-1.5'>
                          <Hash className='w-3 h-3 text-violet-400' />
                          <span className='text-sm font-semibold text-white'>{topic.tag}</span>
                          {topic.hot && <Flame className='w-3 h-3 text-orange-400 fill-orange-400' />}
                        </div>
                        <div className='text-xs text-white/30'>{topic.posts} posts</div>
                      </div>
                    </div>
                    <TrendingUp className='w-4 h-4 text-green-400' />
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Users className='w-5 h-5 text-violet-400' />
                <h2 className='font-bold text-white'>Criadores em Ascensão</h2>
              </div>
              <div className='flex gap-2 overflow-x-auto pb-2 mb-4'>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ' + (activeCategory === cat ? 'btn-primary text-white' : 'glass border border-white/10 text-white/50')}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className='space-y-3'>
                {filteredCreators.map((creator, i) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className='flex items-center gap-3 glass rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 cursor-pointer transition-all'
                  >
                    <div className='relative'>
                      <img src={creator.avatar} alt={creator.name} className='w-12 h-12 rounded-2xl border-2 border-violet-500/30' />
                      {creator.verified && (
                        <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center border-2 border-dark'>
                          <BadgeCheck className='w-3 h-3 text-white' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-1.5'>
                        <span className='font-semibold text-white text-sm'>{creator.name}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-white/40'>{creator.username}</span>
                        <span className='text-[10px] text-violet-400 glass px-1.5 py-0.5 rounded-full border border-violet-500/20'>{creator.category}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-bold text-white'>{creator.followers}</div>
                      <div className='text-xs text-green-400 font-semibold'>{creator.growth}</div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className='ml-1 btn-primary px-3 py-1.5 rounded-xl text-xs font-semibold text-white'
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
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-semibold text-white/60 mb-3'>Usuários</h3>
              {RISING_CREATORS.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.username.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((creator) => (
                <div key={creator.id} className='flex items-center gap-3 glass rounded-2xl p-3 border border-white/5 mb-2'>
                  <img src={creator.avatar} alt='' className='w-10 h-10 rounded-full border border-violet-500/30' />
                  <div className='flex-1'>
                    <div className='font-semibold text-white text-sm'>{creator.name}</div>
                    <div className='text-xs text-white/40'>{creator.username} · {creator.followers} seguidores</div>
                  </div>
                  {creator.verified && <BadgeCheck className='w-4 h-4 text-violet-400' />}
                </div>
              ))}
            </div>
            <div>
              <h3 className='text-sm font-semibold text-white/60 mb-3'>Tópicos</h3>
              {TRENDING_TOPICS.filter(t =>
                t.tag.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((topic) => (
                <div key={topic.tag} className='flex items-center gap-3 glass rounded-xl px-4 py-3 border border-white/5 mb-2'>
                  <Hash className='w-4 h-4 text-violet-400' />
                  <div>
                    <div className='text-sm font-semibold text-white'>#{topic.tag}</div>
                    <div className='text-xs text-white/40'>{topic.posts} posts</div>
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