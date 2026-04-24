'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Bell,
  Flame,
  Hash,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { getDatabaseProvider } from '@/lib/db'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PublicProfile } from '@/types/domain'

const CATEGORIES = ['Tudo', 'Comunidade', 'Lifestyle', 'Arte', 'Música', 'Fitness']

type ExploreCreatorCard = {
  id: string
  name: string
  username: string
  avatar: string
  coverImage?: string
  followers: string
  growth: string
  verified: boolean
  category: string
}

type OdExploreRankRow = {
  entity_id: string
  final_score: number | null
}

function inferCreatorCategory(profile?: PublicProfile) {
  if (profile && !profile.isCreator) return 'Comunidade'
  if (profile?.niche) return profile.niche

  const bio = profile?.bio?.toLowerCase() ?? ''

  if (bio.includes('fitness')) return 'Fitness'
  if (bio.includes('arte')) return 'Arte'
  if (bio.includes('mus')) return 'Música'
  return 'Lifestyle'
}

function formatCompactFollowers(value: number) {
  if (value >= 1000) {
    const compact = value / 1000
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}K`
  }

  return `${value}`
}

function mapProfileToCreatorCard(profile: PublicProfile, index = 0): ExploreCreatorCard {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    coverImage: profile.coverImage,
    followers: `${Math.max(18, 128 - index * 14)}K`,
    growth: 'seguidores',
    verified: profile.isVerified,
    category: inferCreatorCategory(profile),
  }
}

interface ExplorePageProps {
  onOpenProfile?: (profile: PublicProfile) => void
  onOpenTag?: (tag: string) => void
  initialQuery?: string
}

export function ExplorePage({ onOpenProfile, onOpenTag, initialQuery }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tudo')
  const [searching, setSearching] = useState(false)
  const [rankedCreators, setRankedCreators] = useState<ExploreCreatorCard[]>([])
  const [serverSearchCreators, setServerSearchCreators] = useState<ExploreCreatorCard[]>([])
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const { posts } = usePosts()
  const { user } = useUser()
  const { isFollowing, toggleFollow, getFollowerCount, trendingTopics, getKnownProfiles } = useSocial()

  const knownProfiles = getKnownProfiles()

  useEffect(() => {
    if (!initialQuery) return
    setSearchQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (!actionFeedback) return

    const timeout = window.setTimeout(() => setActionFeedback(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [actionFeedback])

  useEffect(() => {
    let cancelled = false

    async function loadRankedCreators() {
      if (!user?.id) {
        setRankedCreators([])
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_rank_scores')
          .select('entity_id, final_score')
          .eq('viewer_profile_id', user.id)
          .eq('surface', 'explore')
          .eq('entity_type', 'creator')
          .order('final_score', { ascending: false })
          .limit(24)

        if (error) {
          console.warn('[od-core] explore ranking unavailable, using local discovery', error.message)
          if (!cancelled) setRankedCreators([])
          return
        }

        const rankedIds = ((data as OdExploreRankRow[]) ?? []).map((row) => row.entity_id)
        const profileById = new Map(knownProfiles.map((profile) => [profile.id, profile]))

        const nextCreators = rankedIds
          .map((id, index) => {
            const knownProfile = profileById.get(id)
            if (!knownProfile) return null
            return mapProfileToCreatorCard(knownProfile, index)
          })
          .filter(Boolean) as ExploreCreatorCard[]

        if (!cancelled) setRankedCreators(nextCreators)
      } catch (error) {
        console.error('[od-core] failed to load ranked creators', error)
        if (!cancelled) setRankedCreators([])
      }
    }

    void loadRankedCreators()

    return () => {
      cancelled = true
    }
  }, [knownProfiles, user?.id])

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length > 2) {
      setSearching(true)
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSearching(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const query = searchQuery.trim()

    if (query.length < 2 || !user?.id) {
      setServerSearchCreators([])
      return
    }

    const timeout = window.setTimeout(() => {
      setSearching(true)
      getDatabaseProvider()
        .users.search(query, 20)
        .then((profiles) => {
          if (cancelled) return
          setServerSearchCreators(
            profiles
              .filter((profile) => profile.id !== user.id)
              .map((profile, index) =>
                mapProfileToCreatorCard(
                  {
                    id: profile.id,
                    name: profile.name,
                    username: profile.username,
                    avatar: profile.avatar,
                    coverImage: profile.coverImage,
                    bio: profile.bio,
                    niche: profile.niche,
                    isVerified: profile.isVerified,
                    isCreator: profile.isCreator,
                  },
                  index
                )
              )
          )
        })
        .catch((error) => {
          console.error('[explore] failed to search real profiles', error)
          if (!cancelled) setServerSearchCreators([])
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 220)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [searchQuery, user?.id])

  const handleFollowCreator = (creator: ExploreCreatorCard) => {
    const following = isFollowing(creator.id)

    toggleFollow({
      id: creator.id,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar,
      coverImage: creator.coverImage,
      bio:
        creator.category === 'Comunidade'
          ? 'Perfil da comunidade OnlyDay.'
          : `Criador de ${creator.category.toLowerCase()} com conteúdos premium, momentos exclusivos e relacionamento de alta conversão.`,
      niche: creator.category,
      isVerified: creator.verified,
      isCreator: creator.category !== 'Comunidade',
    })

    setActionFeedback(
      following ? `${creator.name} saiu da sua lista de seguindo` : `Agora você está seguindo ${creator.name}`
    )
  }

  const radarQuery = trendingTopics.slice(0, 3).map((topic) => topic.tag).join(' ')

  const openCreatorProfile = (creator: ExploreCreatorCard) => {
    onOpenProfile?.({
      id: creator.id,
      name: creator.name,
      username: creator.username,
      avatar: creator.avatar,
      coverImage: creator.coverImage,
      bio:
        creator.category === 'Comunidade'
          ? 'Perfil da comunidade OnlyDay.'
          : `Criador de ${creator.category.toLowerCase()} com conteúdos premium, momentos exclusivos e relacionamento de alta conversão.`,
      niche: creator.category,
      isVerified: creator.verified,
      isCreator: creator.category !== 'Comunidade',
    })
  }

  const discoveryCreators = useMemo(() => {
    const registry = new Map<string, ExploreCreatorCard>()

    rankedCreators.forEach((creator) => {
      registry.set(creator.id, creator)
    })

    knownProfiles
      .filter((profile) => profile.id !== user?.id)
      .forEach((profile, index) => {
        if (!registry.has(profile.id)) {
          registry.set(profile.id, mapProfileToCreatorCard(profile, index))
        }
      })

    return Array.from(registry.values())
  }, [knownProfiles, rankedCreators, user?.id])

  const filteredCreators =
    activeCategory === 'Tudo'
      ? discoveryCreators
      : discoveryCreators.filter((creator) => creator.category === activeCategory)

  const featuredCreators = filteredCreators.slice(0, 5)

  const localMatchingCreators = discoveryCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const matchingCreators = searchQuery
    ? Array.from(
        new Map(
          [...serverSearchCreators, ...localMatchingCreators].map((creator) => [creator.id, creator])
        ).values()
      )
    : localMatchingCreators

  const matchingTopics = trendingTopics.filter((topic) =>
    topic.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const matchingPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase()
    return (
      post.content.toLowerCase().includes(query) ||
      post.userName.toLowerCase().includes(query) ||
      post.userUsername.toLowerCase().includes(query) ||
      (post.hashtags ?? []).some((tag) => tag.toLowerCase().includes(query))
    )
  })

  return (
    <div className="min-h-screen bg-[#050508] pb-28 md:pb-32">
      <div className="sticky top-0 z-30 border-b border-white/[0.04] bg-[rgba(5,5,8,0.94)] px-4 pb-4 pt-6 backdrop-blur-2xl md:px-8 md:pt-7">
        <div className="mx-auto max-w-[1080px]">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={34} className="select-none" />
            <div className="text-[18px] font-black leading-none tracking-[-0.045em] text-white">
              Only<span className="text-[#8B5CF6]">Day</span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-white/72">
            <button type="button" aria-label="Notificações" className="transition-opacity hover:opacity-100">
              <Bell className="h-[29px] w-[29px]" strokeWidth={1.8} />
            </button>
            <button type="button" aria-label="Buscar" className="transition-opacity hover:opacity-100">
              <Search className="h-[29px] w-[29px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[23px] font-black tracking-[-0.05em] text-white">Explorar</h1>
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.24em] text-white/36">ENCONTRE PESSOAS REAIS</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleSearch(radarQuery)
              setActionFeedback('Busca inteligente ativada com os assuntos do momento')
            }}
            className="flex h-11 items-center gap-2 rounded-full border border-violet-500/45 bg-transparent px-4 text-[13px] font-medium text-violet-300"
          >
            <Sparkles className="h-4 w-4" />
            IA
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/24" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar criadores, tópicos e momentos..."
            className="h-[54px] w-full rounded-[18px] border border-white/10 bg-white/[0.02] pl-11 pr-11 text-[14px] text-white outline-none transition-all placeholder:text-white/24 focus:border-violet-500/35"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          )}
        </div>
        </div>
      </div>

      <div className="space-y-5 px-4 pt-4 md:mx-auto md:max-w-[1080px] md:px-8">
        {!searchQuery ? (
          <>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <h2 className="text-[16px] font-bold tracking-[-0.03em] text-white">Tendências</h2>
                </div>
                <button className="text-[13px] font-medium text-violet-400">Ver tudo</button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {trendingTopics.map((topic, index) => (
                  <motion.button
                    key={topic.tag}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onOpenTag?.(topic.tag)
                      setActionFeedback(`Abrindo a trend #${topic.tag}`)
                    }}
                    className="h-[126px] w-[178px] flex-shrink-0 rounded-[18px] border border-white/8 bg-[#0b0b10] px-4 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                  >
                    <div className="text-[12px] font-semibold text-violet-400">#{index + 1}</div>
                    <div className="mt-5 flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-white">#{topic.tag}</span>
                      {topic.hot ? <Flame className="h-3 w-3 fill-orange-400 text-orange-400" /> : null}
                    </div>
                    <div className="mt-2 text-[11px] text-white/42">{topic.posts} posts</div>
                  </motion.button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-400" />
                  <h2 className="text-[16px] font-bold tracking-[-0.03em] text-white">Pessoas em ascensão</h2>
                </div>
                <button className="text-[13px] font-medium text-violet-400">Ver todos</button>
              </div>

              <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={
                      'flex h-10 flex-shrink-0 items-center rounded-full px-5 text-[12px] font-medium transition-all ' +
                      (activeCategory === category
                        ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_10px_18px_rgba(124,58,237,0.2)]'
                        : 'border border-white/10 bg-transparent text-white/55')
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {featuredCreators.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-[#0b0b10] px-4 py-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
                  >
                    <button className="relative" onClick={() => openCreatorProfile(creator)}>
                      <img src={creator.avatar} alt={creator.name} className="h-11 w-11 rounded-full object-cover" />
                    </button>

                    <button className="min-w-0 flex-1 text-left" onClick={() => openCreatorProfile(creator)}>
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold tracking-[-0.03em] text-white">
                          {creator.name}
                        </span>
                        {creator.verified ? (
                          <BadgeCheck className="h-4 w-4 text-violet-400" fill="currentColor" />
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-[12px] text-white/42">{creator.username}</div>
                      <div className="mt-1.5">
                        <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] text-violet-300">
                          {creator.category}
                        </span>
                      </div>
                    </button>

                    <div className="w-[76px] text-right">
                      <div className="text-[14px] font-semibold text-white">
                        {creator.followers !== '0'
                          ? creator.followers
                          : formatCompactFollowers(getFollowerCount(creator.id))}
                      </div>
                      <div className="text-[11px] leading-tight text-white/38">seguidores</div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollowCreator(creator)}
                      className={
                        'min-w-[88px] rounded-[14px] px-4 py-2.5 text-[12px] font-semibold ' +
                        (isFollowing(creator.id)
                          ? 'border border-white/10 bg-white/6 text-white/70'
                          : 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_10px_22px_rgba(124,58,237,0.22)]')
                      }
                    >
                      {isFollowing(creator.id) ? 'Seguindo' : 'Seguir'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="rounded-[20px] border border-white/8 bg-[#0b0b10] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12">
                  <Rocket className="h-6 w-6 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold tracking-[-0.03em] text-white">
                    Quer impulsionar seu conteúdo?
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.35] text-white/45">
                    Aumente seu alcance e seja descoberto por mais pessoas.
                  </div>
                </div>
                <button className="rounded-[14px] bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_22px_rgba(124,58,237,0.22)]">
                  Promover
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-white/60">Usuários</h3>
              {matchingCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="mb-3 flex items-center gap-3 rounded-[18px] border border-white/8 bg-[#0b0b10] p-3 text-left"
                >
                  <button
                    onClick={() => openCreatorProfile(creator)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="h-10 w-10 rounded-full border border-violet-500/25 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="truncate text-[15px] font-semibold text-white">{creator.name}</div>
                        {creator.verified ? <BadgeCheck className="h-4 w-4 flex-shrink-0 text-violet-400" /> : null}
                      </div>
                      <div className="truncate text-[12px] text-white/40">
                        {creator.username} · {getFollowerCount(creator.id).toLocaleString('pt-BR')} seguidores
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFollowCreator(creator)}
                    className={
                      'rounded-[14px] px-4 py-2 text-[12px] font-semibold ' +
                      (isFollowing(creator.id)
                        ? 'border border-white/10 bg-white/6 text-white/70'
                        : 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_10px_22px_rgba(124,58,237,0.22)]')
                    }
                  >
                    {isFollowing(creator.id) ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>
              ))}
              {matchingCreators.length === 0 ? (
                <div className="rounded-[18px] border border-white/8 bg-[#0b0b10] p-4 text-sm text-white/45">
                  Nenhum perfil encontrado para essa busca.
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-white/60">Tópicos</h3>
              {matchingTopics.map((topic) => (
                <button
                  key={topic.tag}
                  onClick={() => {
                    onOpenTag?.(topic.tag)
                    setActionFeedback(`Abrindo a trend #${topic.tag}`)
                  }}
                  className="mb-3 flex w-full items-center gap-3 rounded-[18px] border border-white/8 bg-[#0b0b10] px-4 py-3 text-left"
                >
                  <Hash className="h-4 w-4 text-violet-400" />
                  <div>
                    <div className="text-[14px] font-semibold text-white">#{topic.tag}</div>
                    <div className="text-[11px] text-white/40">{topic.posts} posts</div>
                  </div>
                </button>
              ))}
              {matchingTopics.length === 0 ? (
                <div className="rounded-[18px] border border-white/8 bg-[#0b0b10] p-4 text-sm text-white/45">
                  Nenhum tópico combinado com essa busca.
                </div>
              ) : null}
            </div>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-white/60">Posts em destaque</h3>
              {matchingPosts.slice(0, 5).map((post) => (
                <button
                  key={post.id}
                  onClick={() =>
                    onOpenProfile?.({
                      id: post.userId,
                      name: post.userName,
                      username: post.userUsername,
                      avatar: post.userAvatar,
                      isVerified: post.isVerified,
                      isCreator: true,
                    })
                  }
                  className="mb-3 w-full rounded-[18px] border border-white/8 bg-[#0b0b10] p-4 text-left"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-white">{post.userName}</span>
                    {post.isVerified ? <BadgeCheck className="h-4 w-4 text-violet-400" /> : null}
                  </div>
                  <div className="mb-2 text-[12px] text-white/35">{post.userUsername}</div>
                  <div className="line-clamp-3 text-[13px] text-white/65">{post.content}</div>
                  {(post.hashtags ?? []).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(post.hashtags ?? []).slice(0, 3).map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={(event) => {
                            event.stopPropagation()
                            onOpenTag?.(tag)
                            setActionFeedback(`Abrindo a trend #${tag}`)
                          }}
                          className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] text-violet-300"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </button>
              ))}
              {matchingPosts.length === 0 ? (
                <div className="rounded-[18px] border border-white/8 bg-[#0b0b10] p-4 text-sm text-white/45">
                  Nenhum post encontrado para esse assunto.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {actionFeedback ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-violet-400/20 bg-[rgba(15,10,30,0.92)] px-4 py-2 text-xs font-medium text-violet-100 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl md:bottom-28">
          {actionFeedback}
        </div>
      ) : null}
    </div>
  )
}
