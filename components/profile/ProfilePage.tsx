'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Settings, Edit3, Grid3X3, Lock, Crown, LogOut, Star, Users, Heart, Sparkles } from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'
import { usePosts } from '@/components/providers/PostContext'

export function ProfilePage() {
  const { user, logout } = useUser()
  const { posts } = usePosts()
  const [activeTab, setActiveTab] = useState('posts')

  const userPosts = posts.filter(p => p.userId === (user?.id || 'user-001'))

  if (!user) return null

  return (
    <div className='min-h-screen bg-dark'>
      <div className='relative'>
        <div className='h-32 bg-gradient-to-r from-violet-900 via-purple-800 to-violet-900 relative overflow-hidden'>
          <div className='absolute inset-0 opacity-20' style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <div className='absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent' />
        </div>

        <div className='px-4 pb-4'>
          <div className='flex items-end justify-between -mt-10 mb-4'>
            <div className='relative'>
              <img
                src={user.avatar}
                alt={user.name}
                className='w-20 h-20 rounded-3xl border-4 border-dark object-cover'
              />
              {user.isVerified && (
                <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center border-2 border-dark'>
                  <BadgeCheck className='w-4 h-4 text-white' />
                </div>
              )}
            </div>
            <div className='flex gap-2'>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className='flex items-center gap-1.5 glass rounded-xl px-3 py-2 border border-white/10 text-sm text-white/70'
              >
                <Edit3 className='w-4 h-4' />
                Editar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className='w-9 h-9 glass rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors'
              >
                <LogOut className='w-4 h-4' />
              </motion.button>
            </div>
          </div>

          <div className='mb-4'>
            <div className='flex items-center gap-2 mb-1'>
              <h2 className='text-xl font-black text-white'>{user.name}</h2>
              {user.isCreator && <Crown className='w-5 h-5 text-violet-400' />}
            </div>
            <p className='text-sm text-violet-400 mb-2'>{user.username}</p>
            <p className='text-sm text-white/60 leading-relaxed'>{user.bio}</p>
          </div>

          <div className='grid grid-cols-3 gap-4 mb-4'>
            {[
              { label: 'Posts', value: user.posts || userPosts.length },
              { label: 'Seguidores', value: user.followers.toLocaleString('pt-BR') },
              { label: 'Seguindo', value: user.following.toLocaleString('pt-BR') },
            ].map((stat) => (
              <div key={stat.label} className='text-center'>
                <div className='text-xl font-black text-white'>{stat.value}</div>
                <div className='text-xs text-white/40'>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className='flex items-center gap-2 mb-4'>
            <div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ' + (user.plan === 'diamond' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'glass border border-white/10 text-white/40')}>
              {user.plan === 'diamond' ? <Crown className='w-3 h-3' /> : <Star className='w-3 h-3' />}
              {user.plan === 'free' ? 'Plano Free' : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
            </div>
            {user.isVerified && (
              <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20'>
                <BadgeCheck className='w-3 h-3' />
                Verificado
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='border-b border-white/5'>
        <div className='flex'>
          {[
            { id: 'posts', icon: Grid3X3, label: 'Posts' },
            { id: 'locked', icon: Lock, label: 'Premium' },
            { id: 'liked', icon: Heart, label: 'Curtidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ' + (activeTab === tab.id ? 'text-violet-400' : 'text-white/30')}
            >
              <tab.icon className='w-5 h-5' />
              <span className='text-xs'>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId='profile-tab'
                  className='absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500'
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className='p-4'>
        {userPosts.length === 0 ? (
          <div className='text-center py-16'>
            <div className='w-16 h-16 glass rounded-3xl flex items-center justify-center mx-auto mb-4 border border-violet-500/20'>
              <Sparkles className='w-8 h-8 text-violet-400' />
            </div>
            <p className='text-white/50 text-sm'>Nenhum post ainda</p>
            <p className='text-white/30 text-xs mt-1'>Comece a compartilhar seu conteúdo</p>
          </div>
        ) : (
          <div className='grid grid-cols-3 gap-1'>
            {userPosts.map((post) => (
              <div key={post.id} className='aspect-square rounded-xl overflow-hidden relative bg-violet-900/20'>
                {post.media?.[0] ? (
                  <img src={post.media[0].url} alt='' className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center p-2'>
                    <p className='text-[10px] text-white/50 text-center line-clamp-3'>{post.content}</p>
                  </div>
                )}
                {post.isLocked && (
                  <div className='absolute top-1 right-1 w-5 h-5 bg-dark/80 rounded-full flex items-center justify-center'>
                    <Lock className='w-3 h-3 text-violet-400' />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}