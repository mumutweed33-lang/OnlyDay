'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Clock3,
  Hash,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Send,
  Sun,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import type { PublicProfile } from '@/types/domain'

type TrendPageProps = {
  tag: string
  onBack: () => void
  onOpenProfile?: (profile: PublicProfile) => void
  onOpenTag?: (tag: string) => void
  onCreatePost?: () => void
}

const TREND_TABS = ['Em alta', 'Recentes', 'Pessoas', 'Mídia'] as const
type TrendTab = (typeof TREND_TABS)[number]

function normalizeTag(tag: string) {
  return tag.replace(/^#/, '').trim().toLowerCase()
}

export function TrendPage({ tag, onBack, onOpenProfile, onOpenTag, onCreatePost }: TrendPageProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>('Em alta')
  const { posts, likePost, savePost } = usePosts()
  const { getComments, getShareCount, getFollowerCount, isFollowing, toggleFollow, getKnownProfiles } = useSocial()

  const normalizedTag = normalizeTag(tag)
  const knownProfiles = getKnownProfiles()

  const trendPosts = useMemo(() => {
    return posts.filter((post) => (post.hashtags ?? []).some((item) => normalizeTag(item) === normalizedTag))
  }, [normalizedTag, posts])

  const creatorsInTrend = useMemo(() => {
    const profileMap = new Map<string, PublicProfile>()

    trendPosts.forEach((post) => {
      const known = knownProfiles.find((profile) => profile.id === post.userId || profile.username === post.userUsername)
      profileMap.set(post.userId, {
        id: post.userId,
        name: post.userName,
        username: post.userUsername,
        avatar: post.userAvatar,
        coverImage: known?.coverImage,
        bio: known?.bio,
        niche: known?.niche,
        isVerified: post.isVerified || known?.isVerified || false,
        isCreator: known?.isCreator ?? true,
      })
    })

    return Array.from(profileMap.values()).slice(0, 8)
  }, [knownProfiles, trendPosts])

  const trendGrowth = useMemo(() => {
    const rawGrowth = trendPosts.reduce((acc, post) => acc + post.likes * 2 + post.comments * 3 + post.shares * 4 + 8, 0)
    return Math.max(24, Math.min(120, rawGrowth))
  }, [trendPosts])

  const trendPostsCount = trendPosts.length

  const orderedPosts = useMemo(() => {
    const ranked = [...trendPosts]

    if (activeTab === 'Recentes') {
      return ranked.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    }

    if (activeTab === 'Mídia') {
      return ranked
        .filter((post) => (post.media?.length ?? 0) > 0)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    }

    return ranked.sort((left, right) => {
      const leftScore = left.likes * 1.8 + left.comments * 2.2 + left.shares * 2.4
      const rightScore = right.likes * 1.8 + right.comments * 2.2 + right.shares * 2.4
      return rightScore - leftScore
    })
  }, [activeTab, trendPosts])

  const listPosts = activeTab === 'Pessoas' ? [] : orderedPosts

  const handleOpenProfile = (profile: PublicProfile) => {
    onOpenProfile?.(profile)
  }

  return (
    <div className="min-h-screen bg-[#050508] pb-28">
      <div className="sticky top-0 z-30 bg-[rgba(5,5,8,0.95)] px-4 pb-4 pt-6 backdrop-blur-2xl">
        <div className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.02] text-white/82"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.02] text-white/82"
              aria-label="Compartilhar trend"
            >
              <Send className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.02] text-white/82"
              aria-label="Mais opções"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-[96px] w-[96px] flex-shrink-0 items-center justify-center rounded-[28px] border border-violet-500/30 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.22),transparent_60%),#120d1c] shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
            <Hash className="h-12 w-12 text-violet-400" strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-black tracking-[-0.05em] text-white sm:text-[20px]">#{tag.replace(/^#/, '')}</div>
            <div className="mt-1.5 flex items-center gap-2 text-[12px] text-white/72">
              <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-violet-300">Em alta no Brasil</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-white/58">
              <span>{trendPostsCount} posts</span>
              <span>•</span>
              <span className="font-semibold text-emerald-400">+{trendGrowth}%</span>
              <span>nas últimas 24h</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-white/46">
              <Clock3 className="h-3.5 w-3.5 text-violet-400" />
              <span>Atualizando agora</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const firstCreator = creatorsInTrend[0]
              if (firstCreator) void toggleFollow(firstCreator)
            }}
            className="flex h-11 flex-shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-5 text-[13px] font-semibold text-white shadow-[0_12px_22px_rgba(124,58,237,0.24)]"
          >
            <UserPlus className="h-4 w-4" />
            Seguir
          </button>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <section className="border-t border-white/[0.06] pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold tracking-[-0.03em] text-white/78">
              Criadores em destaque nessa trend
            </h2>
            <button type="button" className="text-[13px] font-medium text-violet-400">
              Ver todos
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-1">
            {creatorsInTrend.map((creator) => (
              <button
                key={creator.id}
                type="button"
                onClick={() => handleOpenProfile(creator)}
                className="flex w-[84px] flex-shrink-0 flex-col items-center text-center"
              >
                <div className="relative mb-2">
                  <div className="rounded-full border border-violet-500/70 p-[2px]">
                    <img src={creator.avatar} alt={creator.name} className="h-[76px] w-[76px] rounded-full object-cover" />
                  </div>
                  {creator.isVerified ? (
                    <div className="absolute bottom-[2px] right-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                      <BadgeCheck className="h-3 w-3 text-white" fill="currentColor" />
                    </div>
                  ) : null}
                </div>
                <div className="w-full truncate text-[12px] font-semibold text-white">{creator.name}</div>
                <div className="mt-0.5 w-full truncate text-[11px] text-white/42">{creator.username}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="border-b border-white/[0.06]">
          <div className="flex items-center gap-6 overflow-x-auto">
            {TREND_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative h-12 text-[13px] font-semibold transition-colors ${
                  activeTab === tab ? 'text-violet-400' : 'text-white/52'
                }`}
              >
                {tab}
                {activeTab === tab ? (
                  <motion.div
                    layoutId="trend-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-violet-500"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'Pessoas' ? (
          <div className="space-y-3">
            {creatorsInTrend.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-[#101018] px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
              >
                <button type="button" onClick={() => handleOpenProfile(creator)}>
                  <img src={creator.avatar} alt={creator.name} className="h-10 w-10 rounded-full object-cover" />
                </button>
                <button type="button" onClick={() => handleOpenProfile(creator)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-semibold text-white">{creator.name}</span>
                    {creator.isVerified ? <BadgeCheck className="h-4 w-4 text-violet-400" fill="currentColor" /> : null}
                  </div>
                  <div className="text-[12px] text-white/42">{creator.username}</div>
                </button>
                <div className="text-right">
                  <div className="text-[14px] font-semibold text-white">{getFollowerCount(creator.id)}</div>
                  <div className="text-[11px] text-white/40">seguidores</div>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleFollow(creator)}
                  className={`rounded-[14px] px-4 py-2 text-[12px] font-semibold ${
                    isFollowing(creator.id)
                      ? 'border border-white/10 bg-white/6 text-white/70'
                      : 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white'
                  }`}
                >
                  {isFollowing(creator.id) ? 'Seguindo' : 'Seguir'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {listPosts.map((post) => {
              const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })
              const comments = getComments(post.id)
              const totalComments = Math.max(post.comments, comments.length)
              const totalShares = getShareCount(post.id, post.shares)

              return (
                <div
                  key={post.id}
                  className="rounded-[24px] border border-white/[0.08] bg-[#101018] px-4 py-4 shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <button type="button" onClick={() => handleOpenProfile({
                        id: post.userId,
                        name: post.userName,
                        username: post.userUsername,
                        avatar: post.userAvatar,
                        isVerified: post.isVerified,
                        isCreator: true,
                      })}>
                        <img src={post.userAvatar} alt={post.userName} className="h-10 w-10 rounded-full object-cover" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[14px] font-semibold text-white">{post.userName}</span>
                          {post.isVerified ? <BadgeCheck className="h-4 w-4 text-violet-400" fill="currentColor" /> : null}
                          <span className="truncate text-[12px] text-white/42">{post.userUsername}</span>
                          <span className="text-[12px] text-white/28">•</span>
                          <span className="text-[12px] text-white/42">{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" className="text-white/40">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="text-[14px] leading-[1.4] text-white">
                    {post.content.split(/#(\w+)/g).map((part, index) =>
                      index % 2 === 1 ? (
                        <button
                          key={`${post.id}-${part}-${index}`}
                          type="button"
                          onClick={() => onOpenTag?.(part)}
                          className="font-medium text-violet-400"
                        >
                          #{part}
                        </button>
                      ) : (
                        <React.Fragment key={`${post.id}-${index}`}>{part}</React.Fragment>
                      )
                    )}
                  </div>

                  {post.media?.[0] ? (
                    <div className="mt-3 overflow-hidden rounded-[20px] border border-white/6">
                      <img src={post.media[0].url} alt="" className="h-[196px] w-full object-cover" />
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-500/18 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-300">
                      Subindo agora
                    </span>
                    {post.isLocked ? (
                      <span className="rounded-full border border-amber-500/18 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-300">
                        Conteúdo premium
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-7">
                      <button
                        type="button"
                        onClick={() => void likePost(post.id)}
                        className={`flex items-center gap-2 ${post.isLiked ? 'text-amber-400' : 'text-white/52'}`}
                      >
                        <Sun className={`h-5 w-5 ${post.isLiked ? 'fill-amber-400' : ''}`} strokeWidth={1.8} />
                        <span className="text-[13px] font-medium">{post.likes}</span>
                      </button>

                      <button type="button" className="flex items-center gap-2 text-white/52">
                        <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
                        <span className="text-[13px] font-medium">{totalComments}</span>
                      </button>

                      <button type="button" className="flex items-center gap-2 text-white/52">
                        <Repeat2 className="h-5 w-5" strokeWidth={1.8} />
                        <span className="text-[13px] font-medium">{totalShares}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => void savePost(post.id)}
                      className={post.isSaved ? 'text-violet-400' : 'text-white/52'}
                    >
                      <Bookmark className={`h-6 w-6 ${post.isSaved ? 'fill-violet-400' : ''}`} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onCreatePost}
        className="fixed bottom-28 right-[max(1rem,calc(50%-198px+1rem))] z-30 rounded-[28px] border border-white/8 bg-[rgba(18,18,24,0.94)] p-3 shadow-[0_20px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] shadow-[0_0_26px_rgba(124,58,237,0.32)]">
            <Pencil className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <div className="text-[11px] font-semibold text-white">Criar post</div>
            <div className="text-[11px] text-violet-300">com #{tag.replace(/^#/, '')}</div>
          </div>
        </div>
      </button>
    </div>
  )
}
