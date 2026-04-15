'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Post {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  isVerified: boolean
  content: string
  media?: { type: 'image' | 'video'; url: string }[]
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

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  likes: number
  createdAt: string
}

interface PostContextType {
  posts: Post[]
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'isLiked' | 'isSaved'>) => void
  likePost: (postId: string) => void
  savePost: (postId: string) => void
  deletePost: (postId: string) => void
}

const MOCK_POSTS: Post[] = [
  {
    id: 'post-001',
    userId: 'creator-001',
    userName: 'Luna Estrela',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=7C3AED',
    userUsername: '@lunaestela',
    isVerified: true,
    content: 'Nova sessão de fotos exclusiva 🌙✨ Para os meus assinantes Diamond, conteúdo especial aguardando vocês no vault! #OnlyDay #Premium',
    media: [{ type: 'image', url: 'https://picsum.photos/seed/luna1/800/600' }],
    isLocked: false,
    likes: 1243,
    comments: 87,
    shares: 34,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hashtags: ['OnlyDay', 'Premium', 'Exclusivo'],
  },
  {
    id: 'post-002',
    userId: 'creator-002',
    userName: 'Rafael Ouro',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafael&backgroundColor=6D28D9',
    userUsername: '@rafaelouro',
    isVerified: true,
    content: 'Bastidores do meu novo projeto musical 🎵 Quem quer ver o processo criativo? Reagam com ☀️ para eu postar mais!',
    isLocked: false,
    likes: 892,
    comments: 156,
    shares: 67,
    isLiked: true,
    isSaved: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    hashtags: ['Música', 'Bastidores'],
  },
  {
    id: 'post-003',
    userId: 'creator-003',
    userName: 'Sofia Dark',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=5B21B6',
    userUsername: '@sofiadark',
    isVerified: true,
    content: '🔒 Conteúdo exclusivo para assinantes',
    media: [{ type: 'image', url: 'https://picsum.photos/seed/sofia1/800/600' }],
    isLocked: true,
    price: 29.90,
    likes: 2341,
    comments: 412,
    shares: 89,
    isLiked: false,
    isSaved: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    hashtags: ['Exclusivo', 'Premium'],
  },
  {
    id: 'post-004',
    userId: 'creator-004',
    userName: 'Viktor Elite',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viktor&backgroundColor=4C1D95',
    userUsername: '@viktrelite',
    isVerified: true,
    content: 'Minha rotina matinal que me fez conquistar 100k em 3 meses na plataforma 💜 Thread completa abaixo ⬇️ #EmpireBuilder #OnlyDay',
    isLocked: false,
    likes: 3102,
    comments: 287,
    shares: 445,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    hashtags: ['EmpireBuilder', 'OnlyDay', 'Sucesso'],
  },
]

const PostContext = createContext<PostContextType | undefined>(undefined)

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('onlyday_posts')
      if (saved) {
        setPosts(JSON.parse(saved))
      } else {
        setPosts(MOCK_POSTS)
        localStorage.setItem('onlyday_posts', JSON.stringify(MOCK_POSTS))
      }
    } catch (e) {
      setPosts(MOCK_POSTS)
    }
  }, [])

  const savePosts = useCallback((newPosts: Post[]) => {
    try {
      localStorage.setItem('onlyday_posts', JSON.stringify(newPosts))
    } catch (e) {}
  }, [])

  const addPost = useCallback((postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares' | 'isLiked' | 'isSaved'>) => {
    const newPost: Post = {
      ...postData,
      id: 'post-' + Date.now(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
    }
    setPosts(prev => {
      const updated = [newPost, ...prev]
      savePosts(updated)
      return updated
    })
  }, [savePosts])

  const likePost = useCallback((postId: string) => {
    setPosts(prev => {
      const updated = prev.map(p => p.id === postId ? {
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? p.likes - 1 : p.likes + 1
      } : p)
      savePosts(updated)
      return updated
    })
  }, [savePosts])

  const savePost = useCallback((postId: string) => {
    setPosts(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, isSaved: !p.isSaved } : p)
      savePosts(updated)
      return updated
    })
  }, [savePosts])

  const deletePost = useCallback((postId: string) => {
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== postId)
      savePosts(updated)
      return updated
    })
  }, [savePosts])

  return (
    <PostContext.Provider value={{ posts, addPost, likePost, savePost, deletePost }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostContext)
  if (!context) throw new Error('usePosts must be used within PostProvider')
  return context
}