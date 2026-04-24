'use client'

import type {
  AppUser,
  AppNotification,
  Conversation,
  FeedPost,
  Momento,
  NewChatMessage,
  NewFeedPost,
  NewMomento,
  PublicProfile,
} from '@/types/domain'
import type {
  DatabaseProvider,
  DatabaseUserRecord,
  CreateNotificationInput,
  MessageRepository,
  MomentoRepository,
  NotificationRepository,
  PostRepository,
  UserRepository,
} from '@/lib/db/contracts'

const STORAGE_KEYS = {
  posts: 'onlyday_posts',
  conversations: 'onlyday_conversations',
  momentos: 'onlyday_momentos',
  notifications: 'onlyday_notifications',
  users: 'onlyday_profiles',
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readStorage<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback

  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!canUseStorage()) return
  localStorage.setItem(key, JSON.stringify(value))
}

class MockUserRepository implements UserRepository {
  async findById(id: string) {
    const users = readStorage<DatabaseUserRecord[]>(STORAGE_KEYS.users, [])
    return users.find((item) => item.id === id) ?? null
  }

  async findByUsername(username: string) {
    const users = readStorage<DatabaseUserRecord[]>(STORAGE_KEYS.users, [])
    return users.find((item) => item.username === username) ?? null
  }

  async list(limit = 100) {
    const users = readStorage<DatabaseUserRecord[]>(STORAGE_KEYS.users, [])
    return users.slice(0, limit)
  }

  async search(query: string, limit = 20) {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []

    const users = readStorage<DatabaseUserRecord[]>(STORAGE_KEYS.users, [])
    return users
      .filter(
        (user) =>
          user.username.toLowerCase().includes(normalized) ||
          user.name.toLowerCase().includes(normalized)
      )
      .slice(0, limit)
  }

  async create(user: DatabaseUserRecord) {
    const users = readStorage<DatabaseUserRecord[]>(STORAGE_KEYS.users, [])
    const next = [user, ...users.filter((item) => item.id !== user.id)]
    writeStorage(STORAGE_KEYS.users, next)
    return user
  }

  async update(id: string, updates: Partial<DatabaseUserRecord>) {
    const users = readStorage<DatabaseUserRecord[]>(STORAGE_KEYS.users, [])
    let updatedUser: DatabaseUserRecord | null = null
    const next = users.map((user) => {
      if (user.id !== id) return user
      updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() }
      return updatedUser
    })
    writeStorage(STORAGE_KEYS.users, next)
    return updatedUser
  }
}

class MockPostRepository implements PostRepository {
  async listFeed() {
    return readStorage<FeedPost[]>(STORAGE_KEYS.posts, [])
  }

  async create(post: NewFeedPost) {
    const current = await this.listFeed()
    const newPost: FeedPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
    }
    writeStorage(STORAGE_KEYS.posts, [newPost, ...current])
    return newPost
  }

  async toggleLike(postId: string) {
    const current = await this.listFeed()
    let updated: FeedPost | null = null
    const next = current.map((post) => {
      if (post.id !== postId) return post
      updated = {
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
      }
      return updated
    })
    writeStorage(STORAGE_KEYS.posts, next)
    return updated
  }

  async toggleSave(postId: string) {
    const current = await this.listFeed()
    let updated: FeedPost | null = null
    const next = current.map((post) => {
      if (post.id !== postId) return post
      updated = { ...post, isSaved: !post.isSaved }
      return updated
    })
    writeStorage(STORAGE_KEYS.posts, next)
    return updated
  }

  async incrementShare(postId: string) {
    const current = await this.listFeed()
    let updated: FeedPost | null = null
    const next = current.map((post) => {
      if (post.id !== postId) return post
      updated = {
        ...post,
        shares: post.shares + 1,
      }
      return updated
    })
    writeStorage(STORAGE_KEYS.posts, next)
    return updated
  }

  async delete(postId: string) {
    const current = await this.listFeed()
    writeStorage(
      STORAGE_KEYS.posts,
      current.filter((post) => post.id !== postId)
    )
  }
}

class MockNotificationRepository implements NotificationRepository {
  async list(recipientId: string, limit = 50) {
    const notifications = readStorage<AppNotification[]>(STORAGE_KEYS.notifications, [])
    return notifications
      .filter((notification) => !notification.actorId || notification.id.includes(recipientId))
      .slice(0, limit)
  }

  async create(notification: CreateNotificationInput) {
    const current = readStorage<AppNotification[]>(STORAGE_KEYS.notifications, [])
    const next: AppNotification = {
      id: `${notification.recipientId}-notif-${Date.now()}`,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      actorId: notification.actorId,
      postId: notification.postId,
      conversationId: notification.conversationId,
      createdAt: new Date().toISOString(),
      read: false,
    }
    writeStorage(STORAGE_KEYS.notifications, [next, ...current].slice(0, 80))
    return next
  }

  async markAllRead(recipientId: string) {
    const current = readStorage<AppNotification[]>(STORAGE_KEYS.notifications, [])
    writeStorage(
      STORAGE_KEYS.notifications,
      current.map((notification) =>
        notification.id.startsWith(`${recipientId}-`) ? { ...notification, read: true } : notification
      )
    )
  }
}

class MockMessageRepository implements MessageRepository {
  async listConversations(_viewerId: string): Promise<Conversation[]> {
    return readStorage<Conversation[]>(STORAGE_KEYS.conversations, [])
  }

  async createConversation(viewer: AppUser, profile: PublicProfile) {
    const current = await this.listConversations(viewer.id)
    const existingConversation =
      current.find(
        (conversation) =>
          conversation.userId === profile.id || conversation.userUsername === profile.username
      ) ?? null

    if (existingConversation) {
      return existingConversation
    }

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      userId: profile.id,
      userName: profile.name,
      userAvatar: profile.avatar,
      userUsername: profile.username,
      isVerified: profile.isVerified,
      isPremium: profile.isCreator,
      lastMessage: 'Nova conversa iniciada.',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      intimacyScore: 12,
      isOnline: true,
      messages: [],
    }

    writeStorage(STORAGE_KEYS.conversations, [newConversation, ...current])
    return newConversation
  }

  async sendMessage(
    conversationId: string,
    message: NewChatMessage
  ): Promise<Conversation | null> {
    const current = await this.listConversations('viewer')
    let updatedConversation: Conversation | null = null

    const next = current.map((conversation) => {
      if (conversation.id !== conversationId) return conversation

      const newMessage = {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, newMessage],
        lastMessage: message.content,
        lastMessageTime: newMessage.timestamp,
      }

      return updatedConversation
    })

    writeStorage(STORAGE_KEYS.conversations, next)
    return updatedConversation
  }

  async placeBid(
    conversationId: string,
    senderId: string,
    amount: number
  ): Promise<Conversation | null> {
    const current = await this.listConversations(senderId)
    const targetConversation = current.find((conversation) => conversation.id === conversationId)

    if (!targetConversation) return null

    const conversation: Conversation | null = await this.sendMessage(conversationId, {
      senderId,
      receiverId: targetConversation.userId,
      content: `Lance de R$ ${amount.toFixed(2)} enviado!`,
      type: 'auction',
      auctionBid: amount,
      auctionStatus: 'pending',
    })

    if (!conversation) return null

    const nextConversation: Conversation = {
      ...conversation,
      auctionActive: true,
      currentBid: amount,
      lastMessage: `Lance: R$ ${amount.toFixed(2)}`,
    }

    const all = readStorage<Conversation[]>(STORAGE_KEYS.conversations, []).map(
      (item) => (item.id === conversationId ? nextConversation : item)
    )
    writeStorage(STORAGE_KEYS.conversations, all)
    return nextConversation
  }

  async markAsRead(conversationId: string): Promise<Conversation | null> {
    const current = await this.listConversations('viewer')
    let updatedConversation: Conversation | null = null
    const next = current.map((conversation) => {
      if (conversation.id !== conversationId) return conversation
      updatedConversation = {
        ...conversation,
        unreadCount: 0,
        messages: conversation.messages.map((message) => ({ ...message, isRead: true })),
      }
      return updatedConversation
    })
    writeStorage(STORAGE_KEYS.conversations, next)
    return updatedConversation
  }

  async updateIntimacy(conversationId: string, delta: number): Promise<Conversation | null> {
    const current = await this.listConversations('viewer')
    let updatedConversation: Conversation | null = null
    const next = current.map((conversation) => {
      if (conversation.id !== conversationId) return conversation
      updatedConversation = {
        ...conversation,
        intimacyScore: Math.min(100, Math.max(0, conversation.intimacyScore + delta)),
      }
      return updatedConversation
    })
    writeStorage(STORAGE_KEYS.conversations, next)
    return updatedConversation
  }
}

class MockMomentoRepository implements MomentoRepository {
  async listActive() {
    return readStorage<Momento[]>(STORAGE_KEYS.momentos, [])
  }

  async create(momento: NewMomento) {
    const current = await this.listActive()
    const newMomento: Momento = {
      ...momento,
      id: `mom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    }
    writeStorage(STORAGE_KEYS.momentos, [newMomento, ...current])
    return newMomento
  }

  async markViewed(momentoId: string) {
    const current = await this.listActive()
    let updatedMomento: Momento | null = null
    const next = current.map((momento) => {
      if (momento.id !== momentoId) return momento
      updatedMomento = {
        ...momento,
        hasViewed: true,
        viewCount: momento.viewCount + 1,
      }
      return updatedMomento
    })
    writeStorage(STORAGE_KEYS.momentos, next)
    return updatedMomento
  }
}

export class MockDatabaseProvider implements DatabaseProvider {
  users = new MockUserRepository()
  posts = new MockPostRepository()
  messages = new MockMessageRepository()
  momentos = new MockMomentoRepository()
  notifications = new MockNotificationRepository()
}
