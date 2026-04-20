export type UserPlan = 'free' | 'bronze' | 'gold' | 'diamond'
export type MediaType = 'image' | 'video'
export type MessageType = 'text' | 'media' | 'auction' | 'location' | 'sticker'
export type AuctionStatus = 'pending' | 'accepted' | 'rejected'

export interface AppUser {
  id: string
  name: string
  username: string
  email?: string
  avatar: string
  bio: string
  isCreator: boolean
  isVerified: boolean
  isPremium: boolean
  followers: number
  following: number
  posts: number
  balance: number
  plan: UserPlan
  joinedAt: string
  coverImage?: string
  website?: string
  location?: string
  intimacyScore?: number
}

export interface AuthSession {
  user: AppUser | null
  isAuthenticated: boolean
  emailVerificationRequired?: boolean
  email?: string
}

export interface CreateAccountInput {
  name: string
  username: string
  email: string
  password: string
  isCreator: boolean
  bio?: string
  avatar?: string | null
}

export interface PostMedia {
  type: MediaType
  url: string
}

export interface FeedPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  isVerified: boolean
  content: string
  media?: PostMedia[]
  isLocked: boolean
  price?: number
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isSaved: boolean
  createdAt: string
  hashtags?: string[]
}

export interface NewFeedPost {
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  isVerified: boolean
  content: string
  media?: PostMedia[]
  isLocked: boolean
  price?: number
  hashtags?: string[]
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: MessageType
  mediaUrl?: string
  isLocked?: boolean
  price?: number
  auctionBid?: number
  auctionStatus?: AuctionStatus
  timestamp: string
  isRead: boolean
}

export interface NewChatMessage {
  senderId: string
  receiverId: string
  content: string
  type: MessageType
  mediaUrl?: string
  isLocked?: boolean
  price?: number
  auctionBid?: number
  auctionStatus?: AuctionStatus
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  isVerified: boolean
  isPremium: boolean
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  intimacyScore: number
  isOnline: boolean
  messages: ChatMessage[]
  auctionActive?: boolean
  currentBid?: number
}

export interface Momento {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  userBio?: string
  isVerified: boolean
  isCreator?: boolean
  media: string
  mediaType: MediaType
  isLocked: boolean
  price?: number
  dailyFreeCount?: number
  viewCount: number
  duration: number
  expiresAt: string
  createdAt: string
  hasViewed?: boolean
}

export interface NewMomento {
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  userBio?: string
  isVerified: boolean
  isCreator?: boolean
  media: string
  mediaType: MediaType
  isLocked: boolean
  price?: number
  dailyFreeCount?: number
  duration: number
  expiresAt: string
  hasViewed?: boolean
}

export interface PublicProfile {
  id: string
  name: string
  username: string
  avatar: string
  bio?: string
  isVerified: boolean
  isCreator: boolean
}

export interface PostComment {
  id: string
  postId: string
  userId: string
  userName: string
  userUsername: string
  userAvatar: string
  content: string
  createdAt: string
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'share' | 'system'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  createdAt: string
  read: boolean
}
