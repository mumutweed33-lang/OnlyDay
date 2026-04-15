'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Crown,
  Edit3,
  Grid3X3,
  Heart,
  Lock,
  LogOut,
  Sparkles,
  Star,
} from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'

export function ProfilePage() {
  const { user, logout } = useUser()
  const { posts } = usePosts()
  const [activeTab, setActiveTab] = useState('posts')

  const userPosts = posts.filter((p) => p.userId === (user?.id || 'user-001'))

  if (!user) return null

  return (
    <div className="min-h-screen bg-dark pb-28">
      <div className="relative">
        <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,#1a0938_0%,#34125f_38%,#18122f_100%)]">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
          <div className="absolute -right-8 top-6 h-28 w-28 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="px-4 pb-4">
          <div className="mb-4 flex items-end justify-between -mt-12">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 rounded-[28px] border-4 border-dark object-cover shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-dark bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.45)]">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/70 backdrop-blur-xl"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/40 transition-colors hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <div className="mb-4 rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{user.name}</h2>
              {user.isCreator && <Crown className="h-5 w-5 text-violet-400" />}
            </div>
            <p className="mb-2 text-sm text-violet-400">{user.username}</p>
            <p className="text-sm leading-relaxed text-white/60">{user.bio}</p>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Posts', value: user.posts || userPosts.length },
              { label: 'Seguidores', value: user.followers.toLocaleString('pt-BR') },
              { label: 'Seguindo', value: user.following.toLocaleString('pt-BR') },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-4 text-center">
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div
              className={
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ' +
                (user.plan === 'diamond'
                  ? 'border border-violet-500/30 bg-violet-500/20 text-violet-300'
                  : 'border border-white/10 bg-white/6 text-white/45')
              }
            >
              {user.plan === 'diamond' ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
              {user.plan === 'free' ? 'Plano Free' : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
            </div>
            {user.isVerified && (
              <div className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                <BadgeCheck className="h-3 w-3" />
                Verificado
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-white/5">
        <div className="flex">
          {[
            { id: 'posts', icon: Grid3X3, label: 'Posts' },
            { id: 'locked', icon: Lock, label: 'Premium' },
            { id: 'liked', icon: Heart, label: 'Curtidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                'relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors ' +
                (activeTab === tab.id ? 'text-violet-300' : 'text-white/30')
              }
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {userPosts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-500/20 bg-white/6">
              <Sparkles className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-sm text-white/50">Nenhum post ainda</p>
            <p className="mt-1 text-xs text-white/30">Comece a compartilhar seu conteudo</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square overflow-hidden rounded-2xl bg-violet-900/20 ring-1 ring-white/6"
              >
                {post.media?.[0] ? (
                  <img src={post.media[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2">
                    <p className="line-clamp-3 text-center text-[10px] text-white/50">{post.content}</p>
                  </div>
                )}
                {post.isLocked && (
                  <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-dark/80">
                    <Lock className="h-3 w-3 text-violet-400" />
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
