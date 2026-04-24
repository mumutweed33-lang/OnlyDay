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
  Reply,
  Sun,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import type { FeedPost, PublicProfile } from '@/types/domain'

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

function openProfileFromPost(post: FeedPost, onOpenProfile?: (profile: PublicProfile) => void) {
  onOpenProfile?.({
    id: post.userId,
    name: post.userName,
    username: post.userUsername,
    avatar: post.userAvatar,
    isVerified: post.isVerified,
    isCreator: true,
  })
}

export function TrendPage({ tag, onBack, onOpenProfile, onOpenTag, onCreatePost }: TrendPageProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>('Em alta')
  const { posts, likePost, savePost } = usePosts()
  const { getComments, getShareCount, isFollowing, toggleFollow, getKnownProfiles } = useSocial()

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

    return Array.from(profileMap.values()).slice(0, 4)
  }, [knownProfiles, trendPosts])

  const trendGrowth = useMemo(() => {
    const rawGrowth = trendPosts.reduce((acc, post) => acc + post.likes * 2 + post.comments * 3 + post.shares * 4 + 8, 0)
    return Math.max(24, Math.min(120, rawGrowth))
  }, [trendPosts])

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

  const trendHeaderPostsCount = trendPosts.length
  const listPosts = activeTab === 'Pessoas' ? [] : orderedPosts.slice(0, 6)

  return (
    <div className="relative min-h-screen bg-[#050508] pb-28 md:pb-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-[radial-gradient(circle_at_40%_10%,rgba(139,92,246,0.22),transparent_38%),radial-gradient(circle_at_52%_0%,rgba(99,64,255,0.1),transparent_22%)]" />

      <div className="relative px-4 pb-4 pt-6 md:mx-auto md:max-w-[1080px] md:px-8 md:pt-7">
        <div className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/12 bg-transparent text-white/88"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/12 bg-transparent text-white/86"
              aria-label="Compartilhar trend"
            >
              <Reply className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/12 bg-transparent text-white/86"
              aria-label="Mais opções"
            >
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 md:gap-6">
          <div className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center rounded-[30px] border border-violet-500/28 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.22),transparent_62%),#151022] shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
            <Hash className="h-14 w-14 text-violet-400" strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-black tracking-[-0.055em] text-white md:text-[34px]">#{tag.replace(/^#/, '')}</h1>
            <div className="mt-2 flex items-center gap-2 text-[12.5px]">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              <span className="font-medium text-violet-300">Em alta no Brasil</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-white/56">
              <span>{trendHeaderPostsCount} posts</span>
              <span>•</span>
              <span className="font-semibold text-emerald-400">+{trendGrowth}%</span>
              <span>nas últimas 24h</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[11.5px] text-white/44">
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
            className="flex h-[58px] flex-shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-7 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.24)]"
          >
            <UserPlus className="h-4.5 w-4.5" />
            Seguir
          </button>
        </div>
      </div>

      <div className="relative border-t border-white/[0.06] px-4 pt-4 md:mx-auto md:max-w-[1080px] md:px-8">
        <section className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-[-0.03em] text-white/76">
              Criadores em destaque nessa trend
            </h2>
            <button type="button" className="text-[13px] font-semibold text-violet-400">
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
            {creatorsInTrend.map((creator) => (
              <button
                key={creator.id}
                type="button"
                onClick={() => onOpenProfile?.(creator)}
                className="flex min-w-0 flex-col items-center text-center"
              >
                <div className="relative mb-2">
                  <div className="rounded-full border border-violet-500/70 p-[2px]">
                    <img src={creator.avatar} alt={creator.name} className="h-[84px] w-[84px] rounded-full object-cover" />
                  </div>
                  {creator.isVerified ? (
                    <div className="absolute bottom-[2px] right-[2px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#050508] bg-violet-500">
                      <BadgeCheck className="h-3.5 w-3.5 text-white" fill="currentColor" />
                    </div>
                  ) : null}
                </div>
                <div className="w-full truncate text-[12px] font-semibold text-white">{creator.name}</div>
                <div className="mt-0.5 w-full truncate text-[11px] text-white/40">{creator.username}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 border-b border-white/[0.06]">
          <div className="grid grid-cols-4 items-center">
            {TREND_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative h-[52px] text-center text-[13px] font-semibold transition-colors ${
                  activeTab === tab ? 'text-violet-400' : 'text-white/46'
                }`}
              >
                {tab}
                {activeTab === tab ? (
                  <motion.div
                    layoutId="trend-tab-indicator"
                    className="absolute bottom-0 left-[10px] right-[10px] h-[2px] rounded-full bg-violet-500"
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
                className="flex items-center gap-3 rounded-[22px] border border-white/[0.08] bg-[#101018] px-4 py-3.5 shadow-[0_16px_38px_rgba(0,0,0,0.18)]"
              >
                <button type="button" onClick={() => onOpenProfile?.(creator)}>
                  <img src={creator.avatar} alt={creator.name} className="h-10 w-10 rounded-full object-cover" />
                </button>
                <button type="button" onClick={() => onOpenProfile?.(creator)} className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-semibold text-white">{creator.name}</span>
                    {creator.isVerified ? <BadgeCheck className="h-4 w-4 text-violet-400" fill="currentColor" /> : null}
                  </div>
                  <div className="text-[12px] text-white/42">{creator.username}</div>
                </button>
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
          <div className="space-y-4">
            {listPosts.map((post, index) => {
              const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })
              const comments = getComments(post.id)
              const totalComments = Math.max(post.comments, comments.length)
              const totalShares = getShareCount(post.id, post.shares)
              const showLargeMedia = index === 0

              return (
                <div
                  key={post.id}
                  className="rounded-[24px] border border-white/[0.08] bg-[#101018] px-4 py-4 shadow-[0_16px_38px_rgba(0,0,0,0.18)]"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <button type="button" onClick={() => openProfileFromPost(post, onOpenProfile)}>
                        <img src={post.userAvatar} alt={post.userName} className="h-10 w-10 rounded-full object-cover" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-[15px] font-semibold text-white">{post.userName}</span>
                          {post.isVerified ? <BadgeCheck className="h-4 w-4 text-violet-400" fill="currentColor" /> : null}
                          <span className="truncate text-[12px] text-white/42">{post.userUsername}</span>
                          <span className="text-[12px] text-white/28">•</span>
                          <span className="text-[12px] text-white/42">{timeAgo}</span>
                        </div>
                        <div className="mt-1.5 text-[14px] leading-[1.38] text-white">
                          {post.content.split(/#(\w+)/g).map((part, partIndex) =>
                            partIndex % 2 === 1 ? (
                              <button
                                key={`${post.id}-${part}-${partIndex}`}
                                type="button"
                                onClick={() => onOpenTag?.(part)}
                                className="font-medium text-violet-400"
                              >
                                #{part}
                              </button>
                            ) : (
                              <React.Fragment key={`${post.id}-${partIndex}`}>{part}</React.Fragment>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <button type="button" className="text-white/40">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  {showLargeMedia ? (
                    <div className="mb-4 overflow-hidden rounded-[22px] border border-white/6 bg-[radial-gradient(circle_at_72%_35%,rgba(110,46,255,0.18),transparent_24%),linear-gradient(180deg,#1b1431_0%,#140f24_100%)]">
                      {post.media?.[0] ? (
                        <img src={post.media[0].url} alt="" className="h-[250px] w-full object-cover" />
                      ) : (
                        <div className="relative flex h-[250px] items-center justify-center">
                          <div className="text-[42px] font-black tracking-[-0.06em] text-violet-400/95">#{tag.replace(/^#/, '')}</div>
                          <div className="absolute bottom-5 left-5 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-md">
                            <Reply className="h-5 w-5 rotate-180 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
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
                    <div className="flex items-center gap-9">
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
        className="fixed bottom-[126px] right-[max(1rem,calc(50%-198px+0.7rem))] z-30 rounded-[22px] border border-white/8 bg-[rgba(18,18,24,0.92)] p-2 shadow-[0_16px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#a65eff_0%,#7C3AED_60%,#5b2be0_100%)] shadow-[0_0_24px_rgba(124,58,237,0.34)]">
            <Pencil className="h-6 w-6 text-white" />
          </div>
          <div className="rounded-[14px] bg-black/18 px-2.5 pb-1.5 pt-1 text-center">
            <div className="text-[10px] font-semibold text-white">Criar post</div>
            <div className="text-[10px] text-white/56">
              com <span className="font-semibold text-violet-300">#{tag.replace(/^#/, '')}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
