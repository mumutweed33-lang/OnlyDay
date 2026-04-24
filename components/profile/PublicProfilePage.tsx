'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Crown,
  Grid3X3,
  Lock,
  MessageCircle,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react'
import { PostDetailModal } from '@/components/feed/PostDetailModal'
import { useSocial } from '@/components/providers/SocialContext'
import type { FeedPost, PublicProfile } from '@/types/domain'

interface PublicProfilePageProps {
  profile: PublicProfile
  posts: FeedPost[]
  onMessage?: (profile: PublicProfile) => void
  onBack: () => void
  onOpenTag?: (tag: string) => void
  viewerId?: string
}

export function PublicProfilePage({
  profile,
  posts,
  onMessage,
  onBack,
  onOpenTag,
  viewerId,
}: PublicProfilePageProps) {
  const { isFollowing, toggleFollow, getFollowerCount } = useSocial()
  const [activeTab, setActiveTab] = useState<'posts' | 'premium'>('posts')
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null)

  const publicPosts = posts.filter((post) => post.userId === profile.id)
  const premiumPosts = publicPosts.filter((post) => post.isLocked)
  const visiblePosts = useMemo(
    () => (activeTab === 'premium' ? premiumPosts : publicPosts),
    [activeTab, premiumPosts, publicPosts]
  )

  return (
    <div className="min-h-screen bg-[#050508] pb-28 md:pb-32">
      <PostDetailModal
        post={selectedPost}
        viewerId={viewerId}
        onClose={() => setSelectedPost(null)}
        onOpenTag={onOpenTag}
      />

      <div className="relative md:mx-auto md:max-w-[1080px]">
        <div className="relative h-52 overflow-hidden bg-[linear-gradient(180deg,#13081f_0%,#261243_44%,#050508_100%)]">
          {profile.coverImage && (
            <img
              src={profile.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(139,92,246,0.3),transparent_22%),linear-gradient(180deg,rgba(5,5,8,0.08),rgba(5,5,8,0.94))]" />

          <button
            onClick={onBack}
            aria-label="Voltar para a tela anterior"
            className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/18 text-white/92 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/18 text-white/88 backdrop-blur-md">
            <MoreHorizontal className="h-5 w-5" />
          </div>
        </div>

        <div className="px-4 pb-4 md:px-8">
          <div className="-mt-10 mb-4 flex items-end justify-between gap-3">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-[80px] w-[80px] rounded-[24px] border-[3px] border-[#050508] object-cover shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
              />
              {profile.isCreator && profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050508] bg-violet-600">
                  <BadgeCheck className="h-4 w-4 text-white" fill="currentColor" />
                </div>
              )}
            </div>

            <div className="flex flex-1 items-center justify-end gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onMessage?.(profile)}
                className="flex h-10 items-center gap-2 rounded-[18px] border border-white/10 bg-transparent px-4 text-[13px] font-semibold text-white/78"
              >
                <MessageCircle className="h-4 w-4" />
                Mensagem
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleFollow(profile)}
                className="flex h-10 items-center gap-2 rounded-[18px] bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#5b34e6_100%)] px-5 text-[13px] font-semibold text-white shadow-[0_12px_28px_rgba(124,58,237,0.24)]"
              >
                <UserPlus className="h-4 w-4" />
                {isFollowing(profile.id) ? 'Seguindo criador' : 'Seguir criador'}
              </motion.button>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-white">{profile.name}</h2>
              {profile.isCreator && <Crown className="h-5 w-5 text-violet-400" />}
            </div>
            <p className="mb-2 text-[13px] font-semibold text-violet-400">{profile.username}</p>
            <p className="max-w-[330px] text-[13px] leading-[1.5] text-white/64">
              {profile.bio || 'Criador premium com conteudo exclusivo, momentos e experiencias desbloqueaveis.'}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-500/18 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-300">
                {profile.niche || 'Lifestyle'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-medium text-white/48">
                Comunidade real
              </span>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-0 border-y border-white/[0.06] py-4">
            {[
              { label: 'posts', value: publicPosts.length },
              { label: 'premium', value: premiumPosts.length },
              { label: 'seguidores', value: getFollowerCount(profile.id).toLocaleString('pt-BR') },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${index !== 2 ? 'border-r border-white/[0.08]' : ''}`}
              >
                <div className="text-[17px] font-black text-white">{stat.value}</div>
                <div className="mt-1 text-[11px] text-white/42">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-y border-white/5 px-4 md:mx-auto md:max-w-[1080px] md:px-8">
        <div className="flex">
          {[
            { id: 'posts', icon: Grid3X3, label: 'Publicacoes' },
            { id: 'premium', icon: Lock, label: 'Premium' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'posts' | 'premium')}
              className={
                'relative flex flex-1 items-center justify-center gap-2 py-3 text-[12px] font-medium transition-colors ' +
                (activeTab === tab.id ? 'text-violet-300' : 'text-white/38')
              }
            >
              <tab.icon className="h-[17px] w-[17px]" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="public-profile-tab"
                  className="absolute bottom-0 left-8 right-8 h-[2px] rounded-full bg-violet-500"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 md:mx-auto md:max-w-[1080px] md:px-8">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={
              'rounded-full px-4 py-2 text-[12px] font-semibold transition-all ' +
              (activeTab === 'posts'
                ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white'
                : 'border border-white/10 bg-white/[0.04] text-white/52')
            }
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={
              'rounded-full px-4 py-2 text-[12px] font-semibold transition-all ' +
              (activeTab === 'premium'
                ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white'
                : 'border border-white/10 bg-white/[0.04] text-white/52')
            }
          >
            Premium
          </button>
        </div>
      </div>

      <div className="p-4 md:mx-auto md:max-w-[1080px] md:px-8">
        {visiblePosts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-white/50">
              {activeTab === 'premium'
                ? 'Esse criador ainda nao vendeu posts premium aqui'
                : 'Esse criador ainda nao publicou nada aqui'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {visiblePosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square overflow-hidden rounded-[22px] bg-violet-900/20 ring-1 ring-white/6"
              >
                {post.media?.[0] ? (
                  <img src={post.media[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-start justify-between p-4 text-left">
                    <div className="line-clamp-3 text-[10px] font-medium text-violet-300">
                      {(post.hashtags ?? []).length > 0 ? `#${post.hashtags?.[0]}` : post.content}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/42">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                )}

                <div className="absolute right-3 top-2 text-sm text-white/52">•••</div>

                {post.isLocked && (
                  <div className="absolute right-2 top-8 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-1">
                    <Lock className="h-3 w-3 text-violet-400" />
                    {post.price && (
                      <span className="text-[9px] font-bold text-violet-200">
                        R$ {post.price.toFixed(0)}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
