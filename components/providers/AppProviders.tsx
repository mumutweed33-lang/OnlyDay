'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// ==================== USER CONTEXT ====================
interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  isCreator: boolean
  verified: boolean
  vipLevel: 'none' | 'bronze' | 'gold' | 'diamond'
  balance: number
  totalEarnings: number
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoggedIn: boolean
  login: (userData: User) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('onlyday_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('onlyday_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('onlyday_user')
  }

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn: !!user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

// ==================== POST CONTEXT ====================
export interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userVerified: boolean
  content: string
  media?: string
  mediaType?: 'image' | 'video'
  likes: number
  comments: number
  reposts: number
  isLiked: boolean
  isPremium: boolean
  premiumPrice?: number
  createdAt: Date
  tags?: string[]
}

interface PostContextType {
  posts: Post[]
  addPost: (post: Post) => void
  likePost: (postId: string) => void
  deletePost: (postId: string) => void
}

const PostContext = createContext<PostContextType | undefined>(undefined)

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'creator1',
    userName: 'Luna Estrela',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
    userVerified: true,
    content: 'Novo conteúdo exclusivo chegando hoje! 🌟 Quem já assina sabe o que vem por aí... ✨',
    likes: 2847,
    comments: 342,
    reposts: 156,
    isLiked: false,
    isPremium: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    tags: ['exclusivo', 'criadores']
  },
  {
    id: '2',
    userId: 'creator2',
    userName: 'Kai Noir',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai',
    userVerified: true,
    content: 'Sessão de fotos dos bastidores 📸 Conteúdo premium disponível para assinantes Diamond 💎',
    media: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    mediaType: 'image',
    likes: 5621,
    comments: 891,
    reposts: 234,
    isLiked: true,
    isPremium: true,
    premiumPrice: 25,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    tags: ['premium', 'diamond']
  },
  {
    id: '3',
    userId: 'creator3',
    userName: 'Aria Vox',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria',
    userVerified: false,
    content: 'Hoje foi incrível! Obrigada a todos que participaram da live 🎵 Vocês são demais!',
    likes: 1203,
    comments: 145,
    reposts: 67,
    isLiked: false,
    isPremium: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: '4',
    userId: 'creator4',
    userName: 'Zara Black',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zara',
    userVerified: true,
    content: 'Workshop exclusivo de criação de conteúdo premium 🎯 Inscrições abertas!',
    media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    mediaType: 'image',
    likes: 3456,
    comments: 567,
    reposts: 198,
    isLiked: false,
    isPremium: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
  },
]

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('onlyday_posts')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPosts(parsed.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })))
      } catch {
        setPosts(MOCK_POSTS)
      }
    } else {
      setPosts(MOCK_POSTS)
    }
  }, [])

  const addPost = (post: Post) => {
    const newPosts = [post, ...posts]
    setPosts(newPosts)
    localStorage.setItem('onlyday_posts', JSON.stringify(newPosts))
  }

  const likePost = (postId: string) => {
    const updated = posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    )
    setPosts(updated)
    localStorage.setItem('onlyday_posts', JSON.stringify(updated))
  }

  const deletePost = (postId: string) => {
    const updated = posts.filter(p => p.id !== postId)
    setPosts(updated)
    localStorage.setItem('onlyday_posts', JSON.stringify(updated))
  }

  return (
    <PostContext.Provider value={{ posts, addPost, likePost, deletePost }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePost() {
  const ctx = useContext(PostContext)
  if (!ctx) throw new Error('usePost must be used within PostProvider')
  return ctx
}

// ==================== MESSAGE CONTEXT ====================
export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'locked' | 'location' | 'sticker'
  lockedPrice?: number
  isUnlocked?: boolean
  timestamp: Date
  isRead: boolean
}

export interface Chat {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userVerified: boolean
  lastMessage: string
  lastTime: Date
  unread: number
  intimacyLevel: number
  isOnline: boolean
  auctionActive?: boolean
  auctionBid?: number
}

interface MessageContextType {
  chats: Chat[]
  messages: Record<string, Message[]>
  sendMessage: (chatId: string, message: Message) => void
  markAsRead: (chatId: string) => void
  placeBid: (chatId: string, amount: number) => void
  unlockMedia: (chatId: string, messageId: string) => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

const MOCK_CHATS: Chat[] = [
  {
    id: 'chat1',
    userId: 'creator1',
    userName: 'Luna Estrela',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
    userVerified: true,
    lastMessage: 'Obrigada pelo apoio! 💜',
    lastTime: new Date(Date.now() - 1000 * 60 * 5),
    unread: 2,
    intimacyLevel: 65,
    isOnline: true,
  },
  {
    id: 'chat2',
    userId: 'creator2',
    userName: 'Kai Noir',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai',
    userVerified: true,
    lastMessage: 'Novo conteúdo disponível 🔥',
    lastTime: new Date(Date.now() - 1000 * 60 * 30),
    unread: 0,
    intimacyLevel: 30,
    isOnline: false,
    auctionActive: true,
    auctionBid: 50,
  },
  {
    id: 'chat3',
    userId: 'creator3',
    userName: 'Aria Vox',
    userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria',
    userVerified: false,
    lastMessage: 'Você: Adorei a live!',
    lastTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 0,
    intimacyLevel: 80,
    isOnline: true,
  },
]

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS)
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    chat1: [
      {
        id: 'm1', chatId: 'chat1', senderId: 'creator1',
        content: 'Oi! Obrigada por assinar meu plano 💜',
        type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 10), isRead: true
      },
      {
        id: 'm2', chatId: 'chat1', senderId: 'me',
        content: 'Oi! Sou seu maior fã 😊',
        type: 'text', timestamp: new Date(Date.now() - 1000 * 60 * 8), isRead: true
      },
      {
        id: 'm3', chatId: 'chat1', senderId: 'creator1',
        content: 'Conteúdo exclusivo para você 🔒',
        type: 'locked', lockedPrice: 15, isUnlocked: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false
      },
    ]
  })

  const sendMessage = (chatId: string, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }))
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, lastMessage: message.content, lastTime: new Date() } : c
    ))
  }

  const markAsRead = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c))
  }

  const placeBid = (chatId: string, amount: number) => {
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, auctionActive: true, auctionBid: amount } : c
    ))
  }

  const unlockMedia = (chatId: string, messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId]?.map(m => m.id === messageId ? { ...m, isUnlocked: true } : m) || []
    }))
  }

  return (
    <MessageContext.Provider value={{ chats, messages, sendMessage, markAsRead, placeBid, unlockMedia }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const ctx = useContext(MessageContext)
  if (!ctx) throw new Error('useMessage must be used within MessageProvider')
  return ctx
}

// ==================== MOMENTO CONTEXT ====================
export interface Momento {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userVerified: boolean
  media: string
  type: 'image' | 'video'
  duration: number
  views: number
  isPremium: boolean
  premiumPrice?: number
  expiresAt: Date
  isViewed: boolean
  reactionCount: number
}

interface MomentoContextType {
  momentos: Momento[]
  addMomento: (momento: Momento) => void
  markViewed: (momentoId: string) => void
  freeViewsToday: number
  useFreeView: () => boolean
}

const MomentoContext = createContext<MomentoContextType | undefined>(undefined)

const MOCK_MOMENTOS: Momento[] = [
  {
    id: 'mo1', userId: 'creator1', userName: 'Luna', userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna',
    userVerified: true, media: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    type: 'image', duration: 5, views: 3421, isPremium: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 20), isViewed: false, reactionCount: 234
  },
  {
    id: 'mo2', userId: 'creator2', userName: 'Kai', userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai',
    userVerified: true, media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    type: 'image', duration: 7, views: 8765, isPremium: true, premiumPrice: 5,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 18), isViewed: false, reactionCount: 567
  },
  {
    id: 'mo3', userId: 'creator3', userName: 'Aria', userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria',
    userVerified: false, media: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    type: 'image', duration: 5, views: 1234, isPremium: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 15), isViewed: true, reactionCount: 89
  },
  {
    id: 'mo4', userId: 'creator4', userName: 'Zara', userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zara',
    userVerified: true, media: 'https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?w=800&q=80',
    type: 'image', duration: 6, views: 4567, isPremium: true, premiumPrice: 8,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22), isViewed: false, reactionCount: 345
  },
  {
    id: 'mo5', userId: 'creator5', userName: 'Rex', userAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rex',
    userVerified: false, media: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
    type: 'image', duration: 5, views: 987, isPremium: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 10), isViewed: false, reactionCount: 45
  },
]

export function MomentoProvider({ children }: { children: React.ReactNode }) {
  const [momentos, setMomentos] = useState<Momento[]>(MOCK_MOMENTOS)
  const [freeViewsToday, setFreeViewsToday] = useState(3)

  useEffect(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('onlyday_free_views')
    if (saved) {
      const { date, count } = JSON.parse(saved)
      if (date === today) setFreeViewsToday(count)
    }
  }, [])

  const addMomento = (momento: Momento) => {
    setMomentos(prev => [momento, ...prev])
  }

  const markViewed = (momentoId: string) => {
    setMomentos(prev => prev.map(m => m.id === momentoId ? { ...m, isViewed: true, views: m.views + 1 } : m))
  }

  const useFreeView = () => {
    if (freeViewsToday > 0) {
      const newCount = freeViewsToday - 1
      setFreeViewsToday(newCount)
      localStorage.setItem('onlyday_free_views', JSON.stringify({ date: new Date().toDateString(), count: newCount }))
      return true
    }
    return false
  }

  return (
    <MomentoContext.Provider value={{ momentos, addMomento, markViewed, freeViewsToday, useFreeView }}>
      {children}
    </MomentoContext.Provider>
  )
}

export function useMomento() {
  const ctx = useContext(MomentoContext)
  if (!ctx) throw new Error('useMomento must be used within MomentoProvider')
  return ctx
}

// ==================== APP PROVIDERS ====================
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <PostProvider>
        <MessageProvider>
          <MomentoProvider>
            {children}
          </MomentoProvider>
        </MessageProvider>
      </PostProvider>
    </UserProvider>
  )
}
