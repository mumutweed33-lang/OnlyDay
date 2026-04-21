'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Crown, Grid3X3, Lock, MessageCircle, Sparkles, Star, Zap } from 'lucide-react'
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
    <div className="min-h-screen bg-[#050508] pb-28">
      <PostDetailModal
        post={selectedPost}
        viewerId={viewerId}
        onClose={() => setSelectedPost(null)}
        onOpenTag={onOpenTag}
      />
      <div className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(3,3,6,0.88)] px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Voltar para a tela anterior"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Perfil</h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">criador</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,#120522_0%,#321151_42%,#050508_100%)]">
          {profile.coverImage && (
            <img
              src={profile.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
          <div className="absolute -right-8 top-8 h-32 w-32 rounded-full bg-fuchsia-400/15 blur-3xl" />
          <div className="absolute left-8 top-10 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="px-4 pb-4">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-24 w-24 rounded-[28px] border-4 border-dark object-cover shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              />
              {profile.isCreator && profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-dark bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.45)]">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onMessage?.(profile)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-white/75"
              >
                <MessageCircle className="h-4 w-4" />
                Mensagem
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleFollow(profile)}
                className="rounded-2xl border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200"
              >
                {isFollowing(profile.id) ? 'Seguindo criador' : 'Seguir criador'}
              </motion.button>
            </div>
          </div>

          <div className="mb-4 rounded-[28px] border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{profile.name}</h2>
              {profile.isCreator && <Crown className="h-5 w-5 text-violet-400" />}
            </div>
            <p className="mb-2 text-sm text-violet-400">{profile.username}</p>
            <p className="text-sm leading-relaxed text-white/60">
              {profile.bio || 'Criador premium com conteúdo exclusivo, momentos e experiências desbloqueáveis.'}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Posts', value: publicPosts.length },
              { label: 'Premium', value: premiumPosts.length },
              { label: 'Seguidores', value: getFollowerCount(profile.id).toLocaleString('pt-BR') },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-4 text-center">
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-violet-500/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(99,102,241,0.06))] p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <span className="text-sm font-semibold">Perfil premium do criador</span>
              </div>
              <p className="text-xs leading-relaxed text-white/60">
                Aqui você vê os posts públicos e os posts premium que esse criador colocou à venda.
                O dashboard financeiro continua privado e só aparece para o dono da conta.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Zap className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-semibold">Experiência do assinante</span>
              </div>
              <div className="space-y-2 text-xs text-white/55">
                <div className="flex items-center justify-between">
                  <span>Posts premium ativos</span>
                  <span className="font-semibold text-white">{premiumPosts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Momentos desbloqueáveis</span>
                  <span className="font-semibold text-white">24h por criador</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Posicionamento</span>
                  <span className="font-semibold text-violet-300">Premium</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-violet-300" />
                  <span className="text-sm font-semibold text-white">Vitrine premium</span>
                </div>
                <p className="mt-1 text-xs text-white/45">
                  Conteúdos em destaque para relacionamento, recorrência e desbloqueios.
                </p>
              </div>
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-violet-200">
                creator room
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Público</div>
                <div className="mt-1 text-sm text-white/65">
                  Feed aberto com sinais de prova social e descoberta.
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Exclusivo</div>
                <div className="mt-1 text-sm text-white/65">
                  Conteúdo premium com desbloqueio e acesso mais íntimo.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-white/5 px-4 pb-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Grid3X3 className="h-4 w-4 text-violet-400" />
          Publicações
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={
              'rounded-full px-4 py-2 text-xs font-semibold transition-all ' +
              (activeTab === 'posts'
                ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white'
                : 'border border-white/10 bg-white/6 text-white/45')
            }
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={
              'rounded-full px-4 py-2 text-xs font-semibold transition-all ' +
              (activeTab === 'premium'
                ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white'
                : 'border border-white/10 bg-white/6 text-white/45')
            }
          >
            Premium
          </button>
        </div>
      </div>

      <div className="p-4">
        {visiblePosts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-500/20 bg-white/6">
              <Sparkles className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-sm text-white/50">
              {activeTab === 'premium'
                ? 'Esse criador ainda não vendeu posts premium aqui'
                : 'Esse criador ainda não publicou nada aqui'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {visiblePosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
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
                  <div className="absolute right-1 top-1 flex items-center gap-1 rounded-full bg-dark/80 px-1.5 py-1">
                    <Lock className="h-3 w-3 text-violet-400" />
                    {post.price && <span className="text-[9px] font-bold text-violet-200">R$ {post.price.toFixed(0)}</span>}
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
