'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Flame, Hash, Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import { getDatabaseProvider } from '@/lib/db'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PublicProfile } from '@/types/domain'

const CATEGORIES = ['Tudo', 'Comunidade', 'Lifestyle', 'Arte', 'Musica', 'Fitness', 'Business']

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

  if (bio.includes('business')) return 'Business'
  if (bio.includes('fitness')) return 'Fitness'
  if (bio.includes('arte')) return 'Arte'
  if (bio.includes('mus')) return 'Musica'
  return 'Lifestyle'
}

function mapProfileToCreatorCard(profile: PublicProfile, index = 0): ExploreCreatorCard {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    coverImage: profile.coverImage,
    followers: '0',
    growth: 'real',
    verified: profile.isVerified,
    category: inferCreatorCategory(profile),
  }
}

interface ExplorePageProps {
  onOpenProfile?: (profile: PublicProfile) => void
  initialQuery?: string
}

export function ExplorePage({ onOpenProfile, initialQuery }: ExplorePageProps) {
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

            const category = inferCreatorCategory(knownProfile)

            return {
              id,
              name: knownProfile.name,
              username: knownProfile.username,
              avatar: knownProfile.avatar,
              coverImage: knownProfile.coverImage,
              followers: '0',
              growth: 'real',
              verified: knownProfile.isVerified,
              category,
            } satisfies ExploreCreatorCard
          })
          .filter(Boolean) as ExploreCreatorCard[]

        if (!cancelled) {
          setRankedCreators(nextCreators)
        }
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
      await new Promise((r) => setTimeout(r, 450))
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
    }, 250)

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
      following
        ? `${creator.name} saiu da sua lista de seguindo`
        : `Agora você está seguindo ${creator.name}`
    )
  }

  const topTrend = trendingTopics[0]?.tag ?? 'OnlyDay'
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

  const localMatchingCreators = discoveryCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const matchingCreators = searchQuery
    ? Array.from(
        new Map(
          [...serverSearchCreators, ...localMatchingCreators].map((creator) => [
            creator.id,
            creator,
          ])
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
    <div className="min-h-screen bg-[#050508] pb-28">
      <div className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(3,3,6,0.88)] px-4 pb-3 pt-4 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-black text-white">Explorar</h1>
            <p className="text-[12px] uppercase tracking-[0.18em] text-white/30">encontre pessoas reais</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleSearch(radarQuery)
              setActionFeedback('Busca inteligente ativada com os assuntos do momento')
            }}
            className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[12px] text-violet-300 transition hover:border-violet-400/30 hover:bg-violet-500/16"
          >
            <Sparkles className="h-3 w-3" />
            IA
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar criadores, tópicos e movimentos..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.045] py-2.5 pl-11 pr-4 text-[13px] text-white outline-none transition-all placeholder:text-white/30 focus:border-violet-500/40"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        {!searchQuery && (
          <>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.045] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
              <button
                onClick={() => {
                  void handleSearch(topTrend)
                  setActionFeedback(`Radar do dia abriu o foco em #${topTrend}`)
                }}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">Radar do dia</p>
                  <p className="mt-1 text-[13px] text-white/72">
                    Assuntos, criadores e comportamentos com maior velocidade de crescimento.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/15">
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-300" />
                </div>
              </button>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Flame className="h-4.5 w-4.5 text-orange-400" />
                <h2 className="text-[15px] font-bold text-white">Tendências no Brasil</h2>
              </div>
              <div className="space-y-2">
                {trendingTopics.map((topic, i) => (
                  <motion.button
                    key={topic.tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      void handleSearch(topic.tag)
                      setActionFeedback(`Explorando o assunto #${topic.tag}`)
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left shadow-[0_16px_45px_rgba(0,0,0,0.16)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-[11px] text-white/30">#{i + 1}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-violet-400" />
                          <span className="text-[14px] font-semibold text-white">{topic.tag}</span>
                          {topic.hot && <Flame className="h-3 w-3 fill-orange-400 text-orange-400" />}
                        </div>
                        <div className="text-[11px] text-white/35">{topic.posts} posts</div>
                      </div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-violet-400" />
                <h2 className="text-[15px] font-bold text-white">Pessoas em ascensão</h2>
              </div>
              <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={
                      'flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ' +
                      (activeCategory === category
                        ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_12px_26px_rgba(124,58,237,0.22)]'
                        : 'border border-white/10 bg-white/6 text-white/40')
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
                    className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.045] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                  >
                    <button className="relative" onClick={() => openCreatorProfile(creator)}>
                      <img src={creator.avatar} alt={creator.name} className="h-10 w-10 rounded-full border border-violet-500/30" />
                      {creator.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-dark bg-violet-600">
                          <BadgeCheck className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                    <button className="min-w-0 flex-1 text-left" onClick={() => openCreatorProfile(creator)}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-semibold text-white">{creator.name}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[12.5px] text-white/40">{creator.username}</span>
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300">
                          {creator.category}
                        </span>
                      </div>
                    </button>
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-white">
                        {getFollowerCount(creator.id).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[12px] font-semibold text-emerald-400">{creator.growth}</div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFollowCreator(creator)}
                      className={
                        'rounded-xl px-4 py-2 text-[12px] font-semibold shadow-[0_12px_26px_rgba(124,58,237,0.22)] ' +
                        (isFollowing(creator.id)
                          ? 'border border-white/10 bg-white/6 text-white/70'
                          : 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white')
                      }
                    >
                      {isFollowing(creator.id) ? 'Seguindo' : 'Seguir'}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {searchQuery && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-white/60">Usuarios</h3>
              {matchingCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="mb-3 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-left"
                >
                  <button
                    onClick={() => openCreatorProfile(creator)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <img src={creator.avatar} alt={creator.name} className="h-9 w-9 rounded-full border border-violet-500/30" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="truncate text-[15px] font-semibold text-white">{creator.name}</div>
                        {creator.verified && <BadgeCheck className="h-4 w-4 flex-shrink-0 text-violet-400" />}
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
                      'rounded-xl px-4 py-2 text-[12px] font-semibold ' +
                      (isFollowing(creator.id)
                        ? 'border border-white/10 bg-white/6 text-white/70'
                        : 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white shadow-[0_12px_26px_rgba(124,58,237,0.22)]')
                    }
                  >
                    {isFollowing(creator.id) ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>
              ))}
              {matchingCreators.length === 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-white/45">
                  Nenhum perfil encontrado para essa busca.
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-white/60">Tópicos</h3>
              {matchingTopics.map((topic) => (
                <button
                  key={topic.tag}
                  onClick={() => {
                    void handleSearch(topic.tag)
                    setActionFeedback(`Filtro aplicado para #${topic.tag}`)
                  }}
                  className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left"
                >
                  <Hash className="h-4 w-4 text-violet-400" />
                  <div>
                    <div className="text-[14px] font-semibold text-white">#{topic.tag}</div>
                    <div className="text-[11px] text-white/40">{topic.posts} posts</div>
                  </div>
                </button>
              ))}
              {matchingTopics.length === 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-white/45">
                  Nenhum tópico combinado com essa busca.
                </div>
              )}
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
                  className="mb-3 w-full rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-left"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-white">{post.userName}</span>
                    {post.isVerified && <BadgeCheck className="h-4 w-4 text-violet-400" />}
                  </div>
                  <div className="mb-2 text-[12px] text-white/35">{post.userUsername}</div>
                  <div className="line-clamp-3 text-[13px] text-white/65">{post.content}</div>
                  {(post.hashtags ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(post.hashtags ?? []).slice(0, 3).map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleSearch(tag)
                            setActionFeedback(`Filtro aplicado para #${tag}`)
                          }}
                          className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] text-violet-300"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              ))}
              {matchingPosts.length === 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-white/45">
                  Nenhum post encontrado para esse assunto.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {actionFeedback && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-violet-400/20 bg-[rgba(15,10,30,0.92)] px-4 py-2 text-xs font-medium text-violet-100 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          {actionFeedback}
        </div>
      )}
    </div>
  )
}

