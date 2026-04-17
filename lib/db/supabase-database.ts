'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
  AppUser,
  Conversation,
  FeedPost,
  Momento,
  NewChatMessage,
  NewFeedPost,
  NewMomento,
} from '@/types/domain'
import type {
  DatabaseProvider,
  DatabaseUserRecord,
  MessageRepository,
  MomentoRepository,
  PostRepository,
  UserRepository,
} from '@/lib/db/contracts'

type ProfileRow = Partial<AppUser> & {
  id: string
  email?: string | null
  updated_at?: string | null
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

type OdRankScoreRow = {
  entity_id: string
  final_score: number | null
}

function ensureArray<T>(value?: T[] | null) {
  return value ?? []
}

function normalizeProfile(profile?: ProfileRow | null): DatabaseUserRecord | null {
  if (!profile) return null
  return {
    id: profile.id,
    name: profile.name || 'Usuario OnlyDay',
    username: profile.username || '@usuario',
    email: profile.email ?? undefined,
    avatar:
      profile.avatar ||
      'https://api.dicebear.com/7.x/avataaars/svg?seed=onlyday&backgroundColor=7C3AED',
    bio: profile.bio || 'Criador de conteudo premium no OnlyDay',
    isCreator: Boolean(profile.isCreator),
    isVerified: Boolean(profile.isVerified),
    isPremium: Boolean(profile.isPremium),
    followers: Number(profile.followers ?? 0),
    following: Number(profile.following ?? 0),
    posts: Number(profile.posts ?? 0),
    balance: Number(profile.balance ?? 0),
    plan: profile.plan || 'free',
    joinedAt: profile.joinedAt || new Date().toISOString(),
    coverImage: profile.coverImage,
    website: profile.website,
    location: profile.location,
    intimacyScore: Number(profile.intimacyScore ?? 0),
    updatedAt: profile.updated_at ?? undefined,
  }
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

  async create(user: DatabaseUserRecord) {
    const supabase = getSupabaseBrowserClient()
    const payload = { ...user, updated_at: new Date().toISOString() }
    const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single()
    if (error) throw new Error(error.message)
    return normalizeProfile(data as ProfileRow)!
  }

  async update(id: string, updates: Partial<DatabaseUserRecord>) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
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
      .select('*, profiles:profiles(*)')
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
      .select('*, profiles:profiles(*)')
      .single()
    if (error) throw new Error(error.message)
    return mapPost(data as PostRow, post.userId)
  }

  async toggleLike(postId: string, userId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single()
    if (error) throw new Error(error.message)
    const row = data as PostRow
    const likedBy = ensureArray(row.liked_by)
    const nextLikedBy = likedBy.includes(userId)
      ? likedBy.filter((id) => id !== userId)
      : [...likedBy, userId]
    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({ liked_by: nextLikedBy, likes_count: nextLikedBy.length })
      .eq('id', postId)
      .select('*, profiles:profiles(*)')
      .single()
    if (updateError) throw new Error(updateError.message)
    return mapPost(updated as PostRow, userId)
  }

  async toggleSave(postId: string, userId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single()
    if (error) throw new Error(error.message)
    const row = data as PostRow
    const savedBy = ensureArray(row.saved_by)
    const nextSavedBy = savedBy.includes(userId)
      ? savedBy.filter((id) => id !== userId)
      : [...savedBy, userId]
    const { data: updated, error: updateError } = await supabase
      .from('posts')
      .update({ saved_by: nextSavedBy })
      .eq('id', postId)
      .select('*, profiles:profiles(*)')
      .single()
    if (updateError) throw new Error(updateError.message)
    return mapPost(updated as PostRow, userId)
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
      .select('*, creator_profile:profiles(*)')
      .or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`)
      .order('last_message_time', { ascending: false })
    if (error) throw new Error(error.message)

    const rows = (data as ConversationRow[]) ?? []
    return Promise.all(
      rows.map(async (row) => {
        const profile = normalizeProfile(row.creator_profile)
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
    const conversation = await this.sendMessage(conversationId, {
      senderId,
      receiverId: conversationId,
      content: `Lance de R$ ${amount.toFixed(2)} enviado!`,
      type: 'auction',
      auctionBid: amount,
      auctionStatus: 'pending',
    })
    const supabase = getSupabaseBrowserClient()
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
      .select('*, profiles:profiles(*)')
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
      .select('*, profiles:profiles(*)')
      .single()
    if (error) throw new Error(error.message)
    return mapMomento(data as MomentoRow)
  }

  async markViewed(momentoId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('momentos')
      .select('view_count, *, profiles:profiles(*)')
      .eq('id', momentoId)
      .single()
    if (error) throw new Error(error.message)
    const row = data as MomentoRow
    const { data: updated, error: updateError } = await supabase
      .from('momentos')
      .update({ view_count: (row.view_count ?? 0) + 1 })
      .eq('id', momentoId)
      .select('*, profiles:profiles(*)')
      .single()
    if (updateError) throw new Error(updateError.message)
    return mapMomento(updated as MomentoRow, { hasViewed: true })
  }
}

export class SupabaseDatabaseProvider implements DatabaseProvider {
  users = new SupabaseUserRepository()
  posts = new SupabasePostRepository()
  messages = new SupabaseMessageRepository()
  momentos = new SupabaseMomentoRepository()
}
