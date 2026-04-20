import type {
  AppNotification,
  AppUser,
  Conversation,
  FeedPost,
  Momento,
  NewChatMessage,
  NewFeedPost,
  NewMomento,
  NotificationType,
  PublicProfile,
} from '@/types/domain'

export interface DatabaseUserRecord extends AppUser {
  email?: string
  updatedAt?: string
}

export interface UserRepository {
  findById(id: string): Promise<DatabaseUserRecord | null>
  findByUsername(username: string): Promise<DatabaseUserRecord | null>
  list(limit?: number): Promise<DatabaseUserRecord[]>
  search(query: string, limit?: number): Promise<DatabaseUserRecord[]>
  create(user: DatabaseUserRecord): Promise<DatabaseUserRecord>
  update(id: string, updates: Partial<DatabaseUserRecord>): Promise<DatabaseUserRecord | null>
}

export interface PostRepository {
  listFeed(viewerId?: string): Promise<FeedPost[]>
  create(post: NewFeedPost): Promise<FeedPost>
  toggleLike(postId: string, userId: string): Promise<FeedPost | null>
  toggleSave(postId: string, userId: string): Promise<FeedPost | null>
  delete(postId: string): Promise<void>
}

export interface MessageRepository {
  listConversations(viewerId: string): Promise<Conversation[]>
  createConversation(viewer: AppUser, profile: PublicProfile): Promise<Conversation>
  sendMessage(conversationId: string, message: NewChatMessage): Promise<Conversation | null>
  placeBid(conversationId: string, senderId: string, amount: number): Promise<Conversation | null>
  markAsRead(conversationId: string, viewerId: string): Promise<Conversation | null>
  updateIntimacy(conversationId: string, delta: number): Promise<Conversation | null>
}

export interface MomentoRepository {
  listActive(viewerId?: string): Promise<Momento[]>
  create(momento: NewMomento): Promise<Momento>
  markViewed(momentoId: string): Promise<Momento | null>
}

export interface CreateNotificationInput {
  recipientId: string
  actorId?: string
  type: NotificationType
  title: string
  description: string
  postId?: string
  conversationId?: string
}

export interface NotificationRepository {
  list(recipientId: string, limit?: number): Promise<AppNotification[]>
  create(notification: CreateNotificationInput): Promise<AppNotification | null>
  markAllRead(recipientId: string): Promise<void>
}

export interface DatabaseProvider {
  users: UserRepository
  posts: PostRepository
  messages: MessageRepository
  momentos: MomentoRepository
  notifications: NotificationRepository
}
