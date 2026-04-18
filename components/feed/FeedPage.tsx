'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Heart, MessageCircle, Search, Share2, Sparkles, TrendingUp, UserPlus, X } from 'lucide-react'
import { MomentoViewer } from '@/components/momentos/MomentoViewer'
import { MomentosBar } from '@/components/momentos/MomentosBar'
import { PostCard } from '@/components/feed/PostCard'
import { PostDetailModal } from '@/components/feed/PostDetailModal'
import { useMomentos } from '@/components/providers/MomentoContext'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { trackOdEvent } from '@/lib/od-core/signal'
import { BrandLockup } from '@/components/ui/BrandLogo'
import type { PublicProfile } from '@/types/domain'

function formatUnreadCount(count: number) {
  if (count > 9) return '9+'
  return String(count)
}

function formatNotificationTime(timestamp: string) {
  const createdAt = new Date(timestamp).getTime()
  const diff = Date.now() - createdAt

  if (diff < 60_000) return 'Agora'
  if (diff < 3_600_000) return `há ${Math.max(1, Math.floor(diff / 60_000))} min`
  if (diff < 86_400_000) return `há ${Math.max(1, Math.floor(diff / 3_600_000))} h`
  return `há ${Math.max(1, Math.floor(diff / 86_400_000))} d`
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-pink-300" />
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-sky-300" />
    case 'share':
      return <Share2 className="h-4 w-4 text-emerald-300" />
    case 'follow':
      return <UserPlus className="h-4 w-4 text-violet-300" />
    default:
      return <Sparkles className="h-4 w-4 text-amber-200" />
  }
}

interface FeedPageProps {
  onOpenProfile?: (profile: PublicProfile) => void
  onOpenTag?: (tag: string) => void
}

export function FeedPage({ onOpenProfile, onOpenTag }: FeedPageProps) {
  const { posts } = usePosts()
  const { activeMomento } = useMomentos()
  const { user } = useUser()
  const [showNotification, setShowNotification] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [vaultRankedPostIds, setVaultRankedPostIds] = useState<string[]>([])
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const { notifications, unreadNotifications, markNotificationsRead, getKnownProfiles } = useSocial()
  const trackedImpressionsRef = useRef<Set<string>>(new Set())

  const knownProfiles = getKnownProfiles()

  useEffect(() => {
    let cancelled = false

    async function loadVaultRanking() {
      if (!user?.id) {
        setVaultRankedPostIds([])
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_rank_scores')
          .select('entity_id, final_score')
          .eq('viewer_profile_id', user.id)
          .eq('surface', 'vault')
          .eq('entity_type', 'post')
          .order('final_score', { ascending: false })
          .limit(12)

        if (error) {
          console.warn('[od-core] vault ranking unavailable for feed spotlight', error.message)
          if (!cancelled) setVaultRankedPostIds([])
          return
        }

        if (!cancelled) {
          setVaultRankedPostIds(((data as Array<{ entity_id: string }>) ?? []).map((row) => row.entity_id))
        }
      } catch (error) {
        console.error('[od-core] failed to load vault spotlight ranking', error)
        if (!cancelled) setVaultRankedPostIds([])
      }
    }

    void loadVaultRanking()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id || posts.length === 0) return

    const nextVisiblePosts = posts.slice(0, 8).filter((post) => !trackedImpressionsRef.current.has(post.id))
    if (nextVisiblePosts.length === 0) return

    nextVisiblePosts.forEach((post) => {
      trackedImpressionsRef.current.add(post.id)
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'feed',
        eventType: 'feed_impression',
        metadata: { ranked: true },
      })
    })
  }, [posts, user?.id])

  useEffect(() => {
    if (!actionFeedback) return

    const timeout = window.setTimeout(() => setActionFeedback(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [actionFeedback])

  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return { posts: [], profiles: [] }

    return {
      posts: posts.filter(
        (post) =>
          post.content.toLowerCase().includes(normalized) ||
          post.userName.toLowerCase().includes(normalized) ||
          post.userUsername.toLowerCase().includes(normalized) ||
          (post.hashtags ?? []).some((tag) => tag.toLowerCase().includes(normalized))
      ),
      profiles: knownProfiles.filter(
        (profile) =>
          profile.name.toLowerCase().includes(normalized) ||
          profile.username.toLowerCase().includes(normalized) ||
          profile.bio?.toLowerCase().includes(normalized)
      ),
    }
  }, [knownProfiles, posts, searchQuery])

  const vaultSpotlightPosts = useMemo(() => {
    const lockedPosts = posts.filter((post) => post.isLocked)
    if (lockedPosts.length === 0) return []

    const byId = new Map(lockedPosts.map((post) => [post.id, post]))
    const ranked = vaultRankedPostIds
      .map((id) => byId.get(id))
      .filter((post): post is (typeof posts)[number] => Boolean(post))

    const rankedIds = new Set(ranked.map((post) => post.id))
    const fallback = lockedPosts
      .filter((post) => !rankedIds.has(post.id))
      .sort((left, right) => {
        const priceDelta = (right.price ?? 0) - (left.price ?? 0)
        if (priceDelta !== 0) return priceDelta
        return right.likes - left.likes
      })

    return [...ranked, ...fallback].slice(0, 5)
  }, [posts, vaultRankedPostIds])

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? null,
    [posts, selectedPostId]
  )

  return (
    <div className="min-h-screen bg-dark pb-28">
      <AnimatePresence>
        {activeMomento && <MomentoViewer onOpenProfile={onOpenProfile} />}
      </AnimatePresence>
      <PostDetailModal
        post={selectedPost}
        viewerId={user?.id}
        onClose={() => setSelectedPostId(null)}
        onOpenTag={(tag) => {
          onOpenTag?.(tag)
          setSearchQuery(tag)
          setShowSearch(true)
        }}
      />

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,4,12,0.84)] px-4 py-3 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between">
          <BrandLockup
            size={40}
            titleClassName="text-lg font-black text-gradient"
            subtitle="feed premium"
            subtitleClassName="text-[11px] uppercase tracking-[0.22em] text-white/30"
          />

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const next = !showNotification
                setShowNotification(next)
                if (next) {
                  markNotificationsRead()
                }
              }}
              aria-label={showNotification ? 'Fechar notificações' : 'Abrir notificações'}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6"
            >
              <Bell className="h-4 w-4 text-white/70" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-dark bg-violet-600 px-1 text-[9px] font-bold text-white">
                  {formatUnreadCount(unreadNotifications)}
                </span>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSearch(true)}
              aria-label="Abrir busca do feed"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6"
            >
              <Search className="h-4 w-4 text-white/70" />
            </motion.button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchQuery('premium')
            setShowSearch(true)
            setActionFeedback('Painel de descoberta aberto para você.')
          }}
          className="w-full rounded-[24px] border border-white/8 bg-white/[0.045] p-3 text-left shadow-[0_14px_50px_rgba(0,0,0,0.2)] transition hover:border-violet-400/20 hover:bg-white/[0.06]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/30">Hoje para você</p>
              <p className="mt-1 text-sm text-white/70">
                Conteúdos com maior resposta e proximidade da sua rede.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/15">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 rounded-[28px] border border-white/10 bg-[#100b19] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Notificações</h3>
                <p className="text-[11px] text-white/35">
                  {unreadNotifications > 0
                    ? `${unreadNotifications} nova${unreadNotifications > 1 ? 's' : ''} para você`
                    : 'Tudo em dia por aqui'}
                </p>
              </div>
              <button onClick={() => setShowNotification(false)} aria-label="Fechar notificações" className="text-white/35">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {notifications.length === 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-white/45">
                  Nenhuma notificação por enquanto. Assim que sua rede reagir, tudo aparece aqui.
                </div>
              )}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={
                    'rounded-2xl border p-3 ' +
                    (notification.read
                      ? 'border-white/8 bg-white/[0.04]'
                      : 'border-violet-500/20 bg-violet-500/8')
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-white">{notification.title}</div>
                        <div className="flex items-center gap-2">
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-violet-400" />}
                          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-white/30">
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-white/50">{notification.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Buscar no feed</h3>
                  <p className="text-xs text-white/40">Perfis, posts, hashtags e assuntos</p>
                </div>
                <button onClick={() => setShowSearch(false)} aria-label="Fechar busca do feed" className="text-white/35">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Digite um perfil, hashtag ou assunto..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Perfis</div>
                  <div className="space-y-2">
                    {searchResults.profiles.slice(0, 4).map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          onOpenProfile?.(profile)
                          setShowSearch(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-left"
                      >
                        <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full border border-violet-500/30" />
                        <div>
                          <div className="text-sm font-semibold text-white">{profile.name}</div>
                          <div className="text-xs text-white/35">{profile.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Posts</div>
                  <div className="space-y-2">
                    {searchResults.posts.slice(0, 4).map((post) => (
                      <button
                        key={post.id}
                        onClick={() => {
                          setSelectedPostId(post.id)
                          setShowSearch(false)
                        }}
                        className="w-full rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-left"
                      >
                        <div className="mb-1 text-sm font-semibold text-white">{post.userName}</div>
                        <div className="line-clamp-2 text-xs text-white/45">{post.content}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MomentosBar onOpenProfile={onOpenProfile} />

      {vaultSpotlightPosts.length > 0 && (
        <div className="px-4 pt-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/30">Vault para você</p>
              <p className="mt-1 text-sm text-white/65">Conteúdos premium com maior chance de encaixe no seu perfil.</p>
            </div>
            <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
              OD Core
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {vaultSpotlightPosts.map((post) => (
              <div
                key={`vault-spotlight-${post.id}`}
                className="w-[230px] flex-shrink-0 overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
              >
                <button className="block w-full text-left" onClick={() => onOpenProfile?.({
                  id: post.userId,
                  name: post.userName,
                  username: post.userUsername,
                  avatar: post.userAvatar,
                  isVerified: post.isVerified,
                  isCreator: true,
                })}>
                  <div className="relative h-36 overflow-hidden">
                    {post.media?.[0] ? (
                      <img src={post.media[0].url} alt="" className="h-full w-full object-cover blur-xl scale-105" />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.4),_rgba(10,8,18,1))]" />
                    )}
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute left-3 top-3 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                      Premium
                    </div>
                    <div className="absolute inset-x-3 bottom-3">
                      <div className="text-xs text-white/50">{post.userUsername}</div>
                      <div className="line-clamp-2 text-sm font-semibold text-white">{post.content}</div>
                    </div>
                  </div>
                </button>
                <div className="flex items-center justify-between px-3 py-3">
                  <div>
                    <div className="text-xs text-white/35">A partir de</div>
                    <div className="text-sm font-bold text-violet-300">
                      {post.price ? `R$ ${post.price.toFixed(2)}` : 'Premium'}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Match OD
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-4">
        <div className="h-px flex-1 bg-white/5" />
        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Para você
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="space-y-0">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <PostCard
              post={post}
              onOpenProfile={onOpenProfile}
              onOpenTag={(tag) => {
                onOpenTag?.(tag)
                setSearchQuery(tag)
                setShowSearch(true)
              }}
              onOpenPost={(nextPost) => setSelectedPostId(nextPost.id)}
            />
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="px-4 py-8">
          <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5 text-center shadow-[0_16px_50px_rgba(0,0,0,0.2)]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/15">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <h3 className="text-sm font-bold text-white">Nenhum post real ainda</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/45">
              Assim que alguem da comunidade publicar, o conteudo aparece aqui para todos.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-violet-400/20 bg-[rgba(15,10,30,0.92)] px-4 py-2 text-xs font-medium text-violet-100 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
          >
            {actionFeedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
