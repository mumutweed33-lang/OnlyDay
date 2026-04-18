'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useMessages } from '@/components/providers/MessageContext'
import { useMomentos } from '@/components/providers/MomentoContext'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'
import { getDatabaseProvider } from '@/lib/db'
import { queueOdRefresh, trackOdEvent } from '@/lib/od-core/signal'
import type { AppNotification, FeedPost, PostComment, PublicProfile } from '@/types/domain'

const FOLLOWING_STORAGE_KEY = 'onlyday_following'
const COMMENTS_STORAGE_KEY = 'onlyday_comments'
const NOTIFICATIONS_STORAGE_KEY = 'onlyday_notifications'
const SHARES_STORAGE_KEY = 'onlyday_shares'

function normalizeDisplayName(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 'Alguém'

  if (trimmed.includes('@')) {
    return trimmed.split('@')[0] || 'Alguém'
  }

  return trimmed.replace(/\s+\.$/, '').trim()
}

interface SocialContextType {
  followedIds: string[]
  notifications: AppNotification[]
  unreadNotifications: number
  trendingTopics: Array<{ tag: string; posts: string; hot: boolean }>
  getComments: (postId: string) => PostComment[]
  getShareCount: (postId: string, baseCount?: number) => number
  addComment: (post: FeedPost, content: string) => void
  sharePost: (post: FeedPost, targetLabel?: string) => void
  notifyPostLiked: (post: FeedPost) => void
  markNotificationsRead: () => void
  isFollowing: (profileId: string) => boolean
  toggleFollow: (profile: PublicProfile) => void
  getFollowerCount: (profileId: string, baseCount?: number) => number
  getFollowingCount: (baseCount?: number) => number
  getKnownProfiles: () => PublicProfile[]
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const { posts } = usePosts()
  const { conversations } = useMessages()
  const { creatorMomentos } = useMomentos()
  const [directoryProfiles, setDirectoryProfiles] = useState<PublicProfile[]>([])
  const [followedIds, setFollowedIds] = useState<string[]>([])
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({})
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [sharesByPost, setSharesByPost] = useState<Record<string, number>>({})

  useEffect(() => {
    setFollowedIds(readStorage<string[]>(FOLLOWING_STORAGE_KEY, []))
    setCommentsByPost(readStorage<Record<string, PostComment[]>>(COMMENTS_STORAGE_KEY, {}))
    setSharesByPost(readStorage<Record<string, number>>(SHARES_STORAGE_KEY, {}))
    setNotifications(readStorage<AppNotification[]>(NOTIFICATIONS_STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDirectoryProfiles() {
      if (!user?.id) {
        setDirectoryProfiles([])
        return
      }

      try {
        const profiles = await getDatabaseProvider().users.list(200)
        if (cancelled) return

        setDirectoryProfiles(
          profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            username: profile.username,
            avatar: profile.avatar,
            bio: profile.bio,
            isVerified: profile.isVerified,
            isCreator: profile.isCreator,
          }))
        )
      } catch (error) {
        console.error('[social] failed to load profile directory', error)
        if (!cancelled) setDirectoryProfiles([])
      }
    }

    void loadDirectoryProfiles()
    const refreshInterval = window.setInterval(() => {
      void loadDirectoryProfiles()
    }, 30000)
    window.addEventListener('focus', loadDirectoryProfiles)

    return () => {
      cancelled = true
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', loadDirectoryProfiles)
    }
  }, [user?.id])

  const persistNotifications = useCallback((next: AppNotification[]) => {
    setNotifications(next)
    writeStorage(NOTIFICATIONS_STORAGE_KEY, next)
  }, [])

  const pushNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const nextNotification: AppNotification = {
        ...notification,
        id: uid('notif'),
        createdAt: new Date().toISOString(),
        read: false,
      }
      persistNotifications([nextNotification, ...notifications].slice(0, 40))
    },
    [notifications, persistNotifications]
  )

  const knownProfiles = useMemo(() => {
    const registry = new Map<string, PublicProfile>()

    directoryProfiles.forEach((profile) => {
      registry.set(profile.id, profile)
    })

    if (user) {
      registry.set(user.id, {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        isCreator: user.isCreator,
      })
    }

    posts.forEach((post) => {
      registry.set(post.userId, {
        id: post.userId,
        name: post.userName,
        username: post.userUsername,
        avatar: post.userAvatar,
        isVerified: post.isVerified,
        isCreator: true,
      })
    })

    conversations.forEach((conversation) => {
      registry.set(conversation.userId, {
        id: conversation.userId,
        name: conversation.userName,
        username: conversation.userUsername,
        avatar: conversation.userAvatar,
        isVerified: conversation.isVerified,
        isCreator: true,
      })
    })

    creatorMomentos.forEach((creator) => {
      registry.set(creator.userId, {
        id: creator.userId,
        name: creator.userName,
        username: creator.userUsername,
        avatar: creator.userAvatar,
        bio: creator.userBio,
        isVerified: creator.isVerified,
        isCreator: creator.isCreator,
      })
    })

    return Array.from(registry.values())
  }, [conversations, creatorMomentos, directoryProfiles, posts, user])

  const trendingTopics = useMemo(() => {
    const tagMap = new Map<string, number>()

    posts.forEach((post) => {
      ;(post.hashtags ?? []).forEach((tag) => {
        const weight = 1 + post.likes * 0.02 + post.comments * 0.04 + post.shares * 0.06
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + weight)
      })
    })

    if (tagMap.size === 0) {
      return [
        { tag: 'OnlyDay', posts: '12.4K', hot: true },
        { tag: 'CriadorBR', posts: '8.9K', hot: true },
        { tag: 'PremiumLife', posts: '6.2K', hot: false },
      ]
    }

    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, score], index) => ({
        tag,
        posts: `${Math.max(1, Math.round(score * 10))}`,
        hot: index < 3,
      }))
  }, [posts])

  const getKnownProfiles = useCallback(() => knownProfiles, [knownProfiles])

  const getComments = useCallback(
    (postId: string) => commentsByPost[postId] ?? [],
    [commentsByPost]
  )

  const addComment = useCallback(
    (post: FeedPost, content: string) => {
      if (!user || !content.trim()) return
      const nextComment: PostComment = {
        id: uid('comment'),
        postId: post.id,
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        userAvatar: user.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      const next = {
        ...commentsByPost,
        [post.id]: [...(commentsByPost[post.id] ?? []), nextComment],
      }
      setCommentsByPost(next)
      writeStorage(COMMENTS_STORAGE_KEY, next)
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: post.userId,
        postId: post.id,
        surface: 'feed',
        eventType: 'post_comment',
        metadata: { contentLength: content.trim().length },
      })
      queueOdRefresh(user.id)
      pushNotification({
        type: 'comment',
        title: 'Comentário enviado',
        description: `Seu comentário em ${normalizeDisplayName(post.userName)} foi publicado.`,
      })
    },
    [commentsByPost, pushNotification, user]
  )

  const getShareCount = useCallback(
    (postId: string, baseCount = 0) => baseCount + (sharesByPost[postId] ?? 0),
    [sharesByPost]
  )

  const sharePost = useCallback(
    (post: FeedPost, targetLabel?: string) => {
      const nextShares = {
        ...sharesByPost,
        [post.id]: (sharesByPost[post.id] ?? 0) + 1,
      }
      setSharesByPost(nextShares)
      writeStorage(SHARES_STORAGE_KEY, nextShares)
      if (user?.id) {
        void trackOdEvent({
          actorProfileId: user.id,
          targetProfileId: post.userId,
          postId: post.id,
          surface: 'feed',
          eventType: 'post_share',
          metadata: { targetLabel: targetLabel ?? null },
        })
        queueOdRefresh(user.id)
      }
      pushNotification({
        type: 'share',
        title: 'Post compartilhado',
        description: targetLabel
          ? `Você compartilhou o post com ${normalizeDisplayName(targetLabel)}.`
          : `Você compartilhou um post de ${normalizeDisplayName(post.userName)}.`,
      })
    },
    [pushNotification, sharesByPost, user?.id]
  )

  const notifyPostLiked = useCallback(
    (post: FeedPost) => {
      if (user?.id) {
        void trackOdEvent({
          actorProfileId: user.id,
          targetProfileId: post.userId,
          postId: post.id,
          surface: 'feed',
          eventType: 'post_like',
        })
        queueOdRefresh(user.id)
      }
      pushNotification({
        type: 'like',
        title: 'Curtida registrada',
        description: `Você curtiu um post de ${normalizeDisplayName(post.userName)}.`,
      })
    },
    [pushNotification, user?.id]
  )

  const markNotificationsRead = useCallback(() => {
    persistNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }, [notifications, persistNotifications])

  const isFollowing = useCallback(
    (profileId: string) => followedIds.includes(profileId),
    [followedIds]
  )

  const toggleFollow = useCallback(
    (profile: PublicProfile) => {
      if (!user?.id) return
      const alreadyFollowing = followedIds.includes(profile.id)
      const next = alreadyFollowing
        ? followedIds.filter((id) => id !== profile.id)
        : [...followedIds, profile.id]

      setFollowedIds(next)
      writeStorage(FOLLOWING_STORAGE_KEY, next)
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: profile.id,
        surface: 'explore',
        eventType: 'follow',
        metadata: { following: !alreadyFollowing },
      })
      queueOdRefresh(user.id)

      pushNotification({
        type: alreadyFollowing ? 'system' : 'follow',
        title: alreadyFollowing ? 'Perfil removido dos seus seguindo' : 'Agora você está seguindo',
        description: alreadyFollowing
          ? `Você deixou de seguir ${normalizeDisplayName(profile.name)}.`
          : `Você está acompanhando as novidades de ${normalizeDisplayName(profile.name)}.`,
      })
    },
    [followedIds, pushNotification, user?.id]
  )

  const getFollowerCount = useCallback(
    (profileId: string, baseCount = 0) => baseCount + (followedIds.includes(profileId) ? 1 : 0),
    [followedIds]
  )

  const getFollowingCount = useCallback(
    (baseCount = 0) => baseCount + followedIds.length,
    [followedIds.length]
  )

  const unreadNotifications = notifications.filter((notification) => !notification.read).length

  return (
    <SocialContext.Provider
      value={{
        followedIds,
        notifications,
        unreadNotifications,
        trendingTopics,
        getComments,
        getShareCount,
        addComment,
        sharePost,
        notifyPostLiked,
        markNotificationsRead,
        isFollowing,
        toggleFollow,
        getFollowerCount,
        getFollowingCount,
        getKnownProfiles,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (!context) throw new Error('useSocial must be used within SocialProvider')
  return context
}
