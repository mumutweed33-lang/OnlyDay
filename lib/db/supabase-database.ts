'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
  AppUser,
  AppNotification,
  Conversation,
  FeedPost,
  Momento,
  NewChatMessage,
  NewFeedPost,
  NewMomento,
  NotificationType,
  PublicProfile,
} from '@/types/domain'
import type {
  CreateNotificationInput,
  DatabaseProvider,
  DatabaseUserRecord,
  MessageRepository,
  MomentoRepository,
  NotificationRepository,
  PostRepository,
  UserRepository,
} from '@/lib/db/contracts'

type ProfileRow = Partial<AppUser> & {
  id: string
  email?: string | null
  avatar_url?: string | null
  updated_at?: string | null
  is_creator?: boolean | null
  is_verified?: boolean | null
  is_premium?: boolean | null
  joined_at?: string | null
  cover_image?: string | null
  niche?: string | null
  intimacy_score?: number | null
}

type PostRow = {
  id: string
  user_id: string
  content: string
  media: FeedPost['media'] | null
  is_locked: boolean
  price: number | null
  likes_count: number
  comments_count: number
  shares_count: number
  liked_by: string[] | null
  saved_by: string[] | null
  hashtags: string[] | null
  created_at: string
  profiles?: ProfileRow | null
}

type ConversationRow = {
  id: string
  creator_profile_id: string
  user_a: string
  user_b: string
  last_message: string | null
  last_message_time: string | null
  unread_count_a: number | null
  unread_count_b: number | null
  intimacy_score: number | null
  auction_active: boolean | null
  current_bid: number | null
  creator_profile?: ProfileRow | null
  user_a_profile?: ProfileRow | null
  user_b_profile?: ProfileRow | null
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  type: NewChatMessage['type']
  media_url: string | null
  is_locked: boolean | null
  price: number | null
  auction_bid: number | null
  auction_status: NewChatMessage['auctionStatus'] | null
  timestamp: string
  is_read: boolean | null
}

type MomentoRow = {
  id: string
  user_id: string
  media: string
  media_type: Momento['mediaType']
  is_locked: boolean
  price: number | null
  daily_free_count: number | null
  view_count: number | null
  duration: number
  expires_at: string
  created_at: string
  profiles?: ProfileRow | null
}

type NotificationRow = {
  id: string
  recipient_id: string
  actor_id: string | null
  type: NotificationType
  title: string
  description: string
  post_id: string | null
  conversation_id: string | null
  read: boolean
  created_at: string
  actor_profile?: ProfileRow | null
}

type OdRankScoreRow = {
  entity_id: string
  final_score: number | null
}

type ConversationParticipantRow = {
  user_a: string
  user_b: string
}

async function fetchPostById(postId: string, viewerId?: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('posts')
    .select(postSelect)
    .eq('id', postId)
    .single()

  if (error) throw new Error(error.message)
  return mapPost(data as PostRow, viewerId)
}

const conversationSelect = [
  '*',
  'creator_profile:profiles!conversations_creator_profile_id_fkey(*)',
  'user_a_profile:profiles!conversations_user_a_fkey(*)',
  'user_b_profile:profiles!conversations_user_b_fkey(*)',
].join(', ')

const postSelect = '*, profiles:profiles!posts_user_id_fkey(*)'
const momentoSelect = '*, profiles:profiles!momentos_user_id_fkey(*)'

function ensureArray<T>(value?: T[] | null) {
  return value ?? []
}

function normalizeProfile(profile?: ProfileRow | null): DatabaseUserRecord | null {
  if (!profile) return null
  const isCreator = Boolean(profile.is_creator ?? profile.isCreator)
  return {
    id: profile.id,
    name: profile.name || 'Usuario OnlyDay',
    username: profile.username || '@usuario',
    email: profile.email ?? undefined,
    avatar:
      profile.avatar ||
      profile.avatar_url ||
      'https://api.dicebear.com/7.x/avataaars/svg?seed=onlyday&backgroundColor=7C3AED',
    bio: profile.bio || 'Criador de conteudo premium no OnlyDay',
    isCreator,
    isVerified: isCreator && Boolean(profile.is_verified ?? profile.isVerified),
    isPremium: Boolean(profile.is_premium ?? profile.isPremium),
    followers: Number(profile.followers ?? 0),
    following: Number(profile.following ?? 0),
    posts: Number(profile.posts ?? 0),
    balance: Number(profile.balance ?? 0),
    plan: profile.plan || 'free',
    joinedAt: profile.joined_at || profile.joinedAt || new Date().toISOString(),
    coverImage: profile.cover_image || profile.coverImage,
    website: profile.website,
    location: profile.location,
    niche: profile.niche,
    intimacyScore: Number(profile.intimacy_score ?? profile.intimacyScore ?? 0),
    updatedAt: profile.updated_at ?? undefined,
  }
}

function toProfilePayload(user: Partial<DatabaseUserRecord>) {
  const payload = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    avatar_url: user.avatar,
    bio: user.bio,
    is_creator: user.isCreator,
    is_verified: user.isVerified,
    is_premium: user.isPremium,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    balance: user.balance,
    plan: user.plan,
    joined_at: user.joinedAt,
    cover_image: user.coverImage,
    website: user.website,
    location: user.location,
    niche: user.niche,
    intimacy_score: user.intimacyScore,
    updated_at: new Date().toISOString(),
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

function mapPost(row: PostRow, viewerId?: string): FeedPost {
  const profile = normalizeProfile(row.profiles)
  const likedBy = ensureArray(row.liked_by)
  const savedBy = ensureArray(row.saved_by)
  return {
    id: row.id,
    userId: row.user_id,
    userName: profile?.name || 'Usuario',
    userAvatar: profile?.avatar || '',
    userUsername: profile?.username || '@usuario',
    isVerified: Boolean(profile?.isVerified),
    content: row.content,
    media: row.media ?? undefined,
    isLocked: row.is_locked,
    price: row.price ?? undefined,
    likes: row.likes_count ?? likedBy.length,
    comments: row.comments_count ?? 0,
    shares: row.shares_count ?? 0,
    isLiked: viewerId ? likedBy.includes(viewerId) : false,
    isSaved: viewerId ? savedBy.includes(viewerId) : false,
    createdAt: row.created_at,
    hashtags: row.hashtags ?? undefined,
  }
}

function mapMomento(row: MomentoRow, overrides?: Partial<Momento>): Momento {
  const profile = normalizeProfile(row.profiles)
  return {
    id: row.id,
    userId: row.user_id,
    userName: profile?.name || 'Usuario',
    userAvatar: profile?.avatar || '',
    userUsername: profile?.username || '@usuario',
    isVerified: Boolean(profile?.isVerified),
    media: row.media,
    mediaType: row.media_type,
    isLocked: row.is_locked,
    price: row.price ?? undefined,
    dailyFreeCount: row.daily_free_count ?? undefined,
    viewCount: row.view_count ?? 0,
    duration: row.duration,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    ...overrides,
  }
}

function mapNotification(row: NotificationRow): AppNotification {
  const actor = normalizeProfile(row.actor_profile)
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    actorId: row.actor_id ?? undefined,
    actorName: actor?.name,
    actorUsername: actor?.username,
    actorAvatar: actor?.avatar,
    postId: row.post_id ?? undefined,
    conversationId: row.conversation_id ?? undefined,
    createdAt: row.created_at,
    read: row.read,
  }
}

export class SupabaseUserRepository implements UserRepository {
  async findById(id: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (error) return null
    return normalizeProfile(data as ProfileRow)
  }

  async findByUsername(username: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle()
    if (error || !data) return null
    return normalizeProfile(data as ProfileRow)
  }

  async list(limit = 100) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return ((data as ProfileRow[]) ?? [])
      .map((profile) => normalizeProfile(profile))
      .filter((profile): profile is DatabaseUserRecord => Boolean(profile))
  }

  async search(query: string, limit = 20) {
    const supabase = getSupabaseBrowserClient()
    const normalized = query.trim().replace(/^@+/, '')
    if (!normalized) return []

    const escaped = normalized.replace(/[%_]/g, '\\$&')
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${escaped}%,name.ilike.%${escaped}%`)
      .limit(limit)

    if (error) throw new Error(error.message)
    return ((data as ProfileRow[]) ?? [])
      .map((profile) => normalizeProfile(profile))
      .filter((profile): profile is DatabaseUserRecord => Boolean(profile))
  }

  async create(user: DatabaseUserRecord) {
    const supabase = getSupabaseBrowserClient()
    const payload = toProfilePayload(user)

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select('*')
      .maybeSingle()

    if (!updateError && updated) {
      return normalizeProfile(updated as ProfileRow)!
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single()
    if (error) throw new Error(updateError?.message || error.message)
    return normalizeProfile(data as ProfileRow)!
  }

  async update(id: string, updates: Partial<DatabaseUserRecord>) {
    const supabase = getSupabaseBrowserClient()
    const payload = toProfilePayload({ ...updates, id })
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return normalizeProfile(data as ProfileRow)
  }
}

export class SupabasePostRepository implements PostRepository {
  async listFeed(viewerId?: string) {
    const supabase = getSupabaseBrowserClient()
    let rankedIds: string[] = []

    if (viewerId) {
      const { data: rankedData, error: rankedError } = await supabase
        .from('od_rank_scores')
        .select('entity_id, final_score')
        .eq('viewer_profile_id', viewerId)
        .eq('surface', 'feed')
        .eq('entity_type', 'post')
        .order('final_score', { ascending: false })
        .limit(80)

      if (!rankedError) {
        rankedIds = ((rankedData as OdRankScoreRow[]) ?? []).map((row) => row.entity_id)
      } else {
        console.warn('[od-core] feed ranking unavailable, falling back to recency', rankedError.message)
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .select(postSelect)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)

    const mapped = ((data as PostRow[]) ?? []).map((row) => mapPost(row, viewerId))
    if (rankedIds.length === 0) {
      return mapped
    }

    const positionById = new Map(rankedIds.map((id, index) => [id, index]))
    return mapped.sort((left, right) => {
      const leftRank = positionById.get(left.id)
      const rightRank = positionById.get(right.id)

      if (leftRank === undefined && rightRank === undefined) {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      }
      if (leftRank === undefined) return 1
      if (rightRank === undefined) return -1
      return leftRank - rightRank
    })
  }

  async create(post: NewFeedPost) {
    const supabase = getSupabaseBrowserClient()
    const payload = {
      user_id: post.userId,
      content: post.content,
      media: post.media ?? null,
      is_locked: post.isLocked,
      price: post.price ?? null,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      liked_by: [],
      saved_by: [],
      hashtags: post.hashtags ?? [],
    }
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select(postSelect)
      .single()
    if (error) throw new Error(error.message)
    return mapPost(data as PostRow, post.userId)
  }

  async toggleLike(postId: string, userId: string) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.rpc('toggle_post_like', { target_post_id: postId })
    if (error) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (sessionError || !token) {
        throw new Error(sessionError?.message || error.message)
      }

      const response = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || error.message)
      }
    }
    return fetchPostById(postId, userId)
  }

  async toggleSave(postId: string, userId: string) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.rpc('toggle_post_save', { target_post_id: postId })
    if (error) throw new Error(error.message)
    return fetchPostById(postId, userId)
  }

  async delete(postId: string) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw new Error(error.message)
  }
}

async function loadMessagesForConversation(conversationId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as MessageRow[]).map((message) => ({
    id: message.id,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    content: message.content,
    type: message.type,
    mediaUrl: message.media_url ?? undefined,
    isLocked: message.is_locked ?? undefined,
    price: message.price ?? undefined,
    auctionBid: message.auction_bid ?? undefined,
    auctionStatus: message.auction_status ?? undefined,
    timestamp: message.timestamp,
    isRead: Boolean(message.is_read),
  }))
}

export class SupabaseMessageRepository implements MessageRepository {
  async listConversations(viewerId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('conversations')
      .select(conversationSelect)
      .or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`)
      .order('last_message_time', { ascending: false })
    if (error) throw new Error(error.message)

    const rows = (data as unknown as ConversationRow[]) ?? []
    return Promise.all(
      rows.map(async (row) => {
        const otherParticipant =
          row.user_a === viewerId ? normalizeProfile(row.user_b_profile) : normalizeProfile(row.user_a_profile)
        const profile = otherParticipant ?? normalizeProfile(row.creator_profile)
        const messages = await loadMessagesForConversation(row.id)
        const unreadCount = row.user_a === viewerId ? row.unread_count_a : row.unread_count_b
        return {
          id: row.id,
          userId: profile?.id || '',
          userName: profile?.name || 'Usuario',
          userAvatar: profile?.avatar || '',
          userUsername: profile?.username || '@usuario',
          isVerified: Boolean(profile?.isVerified),
          isPremium: Boolean(profile?.isPremium),
          lastMessage: row.last_message || '',
          lastMessageTime: row.last_message_time || new Date().toISOString(),
          unreadCount: unreadCount ?? 0,
          intimacyScore: row.intimacy_score ?? 0,
          isOnline: false,
          messages,
          auctionActive: Boolean(row.auction_active),
          currentBid: row.current_bid ?? undefined,
        } satisfies Conversation
      })
    )
  }

  async createConversation(viewer: AppUser, profile: PublicProfile) {
    const supabase = getSupabaseBrowserClient()
    const { data: existingData, error: existingError } = await supabase
      .from('conversations')
      .select(conversationSelect)
      .or(
        `and(user_a.eq.${viewer.id},user_b.eq.${profile.id}),and(user_a.eq.${profile.id},user_b.eq.${viewer.id})`
      )
      .maybeSingle()

    if (existingError) throw new Error(existingError.message)

    if (existingData) {
      const row = existingData as unknown as ConversationRow
      const otherParticipant =
        row.user_a === viewer.id ? normalizeProfile(row.user_b_profile) : normalizeProfile(row.user_a_profile)
      const profileRecord = otherParticipant ?? normalizeProfile(row.creator_profile)
      const messages = await loadMessagesForConversation(row.id)
      const unreadCount = row.user_a === viewer.id ? row.unread_count_a : row.unread_count_b

      return {
        id: row.id,
        userId: profileRecord?.id || profile.id,
        userName: profileRecord?.name || profile.name,
        userAvatar: profileRecord?.avatar || profile.avatar,
        userUsername: profileRecord?.username || profile.username,
        isVerified: Boolean(profileRecord?.isVerified ?? profile.isVerified),
        isPremium: Boolean(profileRecord?.isPremium ?? profile.isCreator),
        lastMessage: row.last_message || 'Nova conversa iniciada.',
        lastMessageTime: row.last_message_time || new Date().toISOString(),
        unreadCount: unreadCount ?? 0,
        intimacyScore: row.intimacy_score ?? 0,
        isOnline: false,
        messages,
        auctionActive: Boolean(row.auction_active),
        currentBid: row.current_bid ?? undefined,
      } satisfies Conversation
    }

    const payload = {
      creator_profile_id: profile.isCreator ? profile.id : viewer.id,
      user_a: viewer.id,
      user_b: profile.id,
      last_message: 'Nova conversa iniciada.',
      last_message_time: new Date().toISOString(),
      unread_count_a: 0,
      unread_count_b: 0,
      intimacy_score: 12,
      auction_active: false,
      current_bid: null,
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert(payload)
      .select(conversationSelect)
      .single()

    if (error) throw new Error(error.message)

    const row = data as unknown as ConversationRow
    const otherParticipant =
      row.user_a === viewer.id ? normalizeProfile(row.user_b_profile) : normalizeProfile(row.user_a_profile)
    const profileRecord = otherParticipant ?? normalizeProfile(row.creator_profile)

    return {
      id: row.id,
      userId: profileRecord?.id || profile.id,
      userName: profileRecord?.name || profile.name,
      userAvatar: profileRecord?.avatar || profile.avatar,
      userUsername: profileRecord?.username || profile.username,
      isVerified: Boolean(profileRecord?.isVerified ?? profile.isVerified),
      isPremium: Boolean(profileRecord?.isPremium ?? profile.isCreator),
      lastMessage: row.last_message || 'Nova conversa iniciada.',
      lastMessageTime: row.last_message_time || new Date().toISOString(),
      unreadCount: 0,
      intimacyScore: row.intimacy_score ?? 12,
      isOnline: false,
      messages: [],
      auctionActive: Boolean(row.auction_active),
      currentBid: row.current_bid ?? undefined,
    } satisfies Conversation
  }

  async sendMessage(conversationId: string, message: NewChatMessage) {
    const supabase = getSupabaseBrowserClient()
    const payload = {
      conversation_id: conversationId,
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      content: message.content,
      type: message.type,
      media_url: message.mediaUrl ?? null,
      is_locked: message.isLocked ?? false,
      price: message.price ?? null,
      auction_bid: message.auctionBid ?? null,
      auction_status: message.auctionStatus ?? null,
      is_read: false,
    }
    const { error } = await supabase.from('messages').insert(payload)
    if (error) throw new Error(error.message)

    await supabase
      .from('conversations')
      .update({
        last_message: message.content,
        last_message_time: new Date().toISOString(),
      })
      .eq('id', conversationId)

    const current = await this.listConversations(message.senderId)
    return current.find((conversation) => conversation.id === conversationId) ?? null
  }

  async placeBid(conversationId: string, senderId: string, amount: number) {
    const supabase = getSupabaseBrowserClient()
    const { data: conversationRow, error: conversationError } = await supabase
      .from('conversations')
      .select('user_a, user_b')
      .eq('id', conversationId)
      .single()

    if (conversationError) throw new Error(conversationError.message)

    const participants = conversationRow as ConversationParticipantRow
    const receiverId =
      participants.user_a === senderId ? participants.user_b : participants.user_a

    const conversation = await this.sendMessage(conversationId, {
      senderId,
      receiverId,
      content: `Lance de R$ ${amount.toFixed(2)} enviado!`,
      type: 'auction',
      auctionBid: amount,
      auctionStatus: 'pending',
    })

    await supabase
      .from('conversations')
      .update({
        auction_active: true,
        current_bid: amount,
        last_message: `Lance: R$ ${amount.toFixed(2)}`,
        last_message_time: new Date().toISOString(),
      })
      .eq('id', conversationId)
    return conversation
  }

  async markAsRead(conversationId: string, viewerId: string) {
    const supabase = getSupabaseBrowserClient()
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', viewerId)
    await supabase
      .from('conversations')
      .update({ unread_count_a: 0, unread_count_b: 0 })
      .eq('id', conversationId)
    const conversations = await this.listConversations(viewerId)
    return conversations.find((conversation) => conversation.id === conversationId) ?? null
  }

  async updateIntimacy(conversationId: string, delta: number) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('conversations')
      .select('intimacy_score')
      .eq('id', conversationId)
      .single()
    if (error) throw new Error(error.message)
    const nextScore = Math.min(100, Math.max(0, Number(data.intimacy_score ?? 0) + delta))
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ intimacy_score: nextScore })
      .eq('id', conversationId)
    if (updateError) throw new Error(updateError.message)
    return null
  }
}

export class SupabaseMomentoRepository implements MomentoRepository {
  async listActive() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('momentos')
      .select(momentoSelect)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return ((data as MomentoRow[]) ?? []).map((row) => mapMomento(row))
  }

  async create(momento: NewMomento) {
    const supabase = getSupabaseBrowserClient()
    const payload = {
      user_id: momento.userId,
      media: momento.media,
      media_type: momento.mediaType,
      is_locked: momento.isLocked,
      price: momento.price ?? null,
      daily_free_count: momento.dailyFreeCount ?? 3,
      view_count: 0,
      duration: momento.duration,
      expires_at: momento.expiresAt,
    }
    const { data, error } = await supabase
      .from('momentos')
      .insert(payload)
      .select(momentoSelect)
      .single()
    if (error) throw new Error(error.message)
    return mapMomento(data as MomentoRow)
  }

  async markViewed(momentoId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('momentos')
      .select(`view_count, ${momentoSelect}`)
      .eq('id', momentoId)
      .single()
    if (error) throw new Error(error.message)
    const row = data as MomentoRow
    const { data: updated, error: updateError } = await supabase
      .from('momentos')
      .update({ view_count: (row.view_count ?? 0) + 1 })
      .eq('id', momentoId)
      .select(momentoSelect)
      .single()
    if (updateError) throw new Error(updateError.message)
    return mapMomento(updated as MomentoRow, { hasViewed: true })
  }
}

export class SupabaseNotificationRepository implements NotificationRepository {
  async list(recipientId: string, limit = 50) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('notifications')
      .select('*, actor_profile:profiles!notifications_actor_id_fkey(*)')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return ((data as unknown as NotificationRow[]) ?? []).map((row) => mapNotification(row))
  }

  async create(notification: CreateNotificationInput) {
    if (notification.actorId && notification.actorId === notification.recipientId) {
      return null
    }

    const supabase = getSupabaseBrowserClient()
    const payload = {
      recipient_id: notification.recipientId,
      actor_id: notification.actorId ?? null,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      post_id: notification.postId ?? null,
      conversation_id: notification.conversationId ?? null,
      read: false,
    }

    const canReadInsertedNotification = !notification.actorId || notification.actorId === notification.recipientId
    if (!canReadInsertedNotification) {
      const { error } = await supabase.from('notifications').insert(payload)
      if (error) throw new Error(error.message)
      return null
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select('*, actor_profile:profiles!notifications_actor_id_fkey(*)')
      .single()

    if (error) throw new Error(error.message)
    return mapNotification(data as unknown as NotificationRow)
  }

  async markAllRead(recipientId: string) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', recipientId)
      .eq('read', false)

    if (error) throw new Error(error.message)
  }
}

export class SupabaseDatabaseProvider implements DatabaseProvider {
  users = new SupabaseUserRepository()
  posts = new SupabasePostRepository()
  messages = new SupabaseMessageRepository()
  momentos = new SupabaseMomentoRepository()
  notifications = new SupabaseNotificationRepository()
}
