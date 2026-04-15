'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Momento {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  isVerified: boolean
  media: string
  mediaType: 'image' | 'video'
  isLocked: boolean
  price?: number
  dailyFreeCount?: number
  viewCount: number
  duration: number
  expiresAt: string
  createdAt: string
  hasViewed?: boolean
}

interface MomentoContextType {
  momentos: Momento[]
  activeMomento: Momento | null
  activeIndex: number
  freeViewsToday: number
  setActiveMomento: (momento: Momento | null, index: number) => void
  nextMomento: () => void
  prevMomento: () => void
  markAsViewed: (momentoId: string) => void
  addMomento: (momento: Omit<Momento, 'id' | 'createdAt' | 'viewCount'>) => void
}

const MOCK_MOMENTOS: Momento[] = [
  {
    id: 'mom-001',
    userId: 'creator-001',
    userName: 'Luna Estrela',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=7C3AED',
    userUsername: '@lunaestela',
    isVerified: true,
    media: 'https://picsum.photos/seed/luna-mom1/400/700',
    mediaType: 'image',
    isLocked: false,
    viewCount: 1823,
    duration: 5000,
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mom-002',
    userId: 'creator-002',
    userName: 'Rafael Ouro',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafael&backgroundColor=6D28D9',
    userUsername: '@rafaelouro',
    isVerified: true,
    media: 'https://picsum.photos/seed/rafael-mom1/400/700',
    mediaType: 'image',
    isLocked: false,
    viewCount: 934,
    duration: 7000,
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mom-003',
    userId: 'creator-003',
    userName: 'Sofia Dark',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=5B21B6',
    userUsername: '@sofiadark',
    isVerified: true,
    media: 'https://picsum.photos/seed/sofia-mom1/400/700',
    mediaType: 'image',
    isLocked: true,
    price: 9.90,
    dailyFreeCount: 3,
    viewCount: 5621,
    duration: 6000,
    expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mom-004',
    userId: 'creator-004',
    userName: 'Viktor Elite',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viktor&backgroundColor=4C1D95',
    userUsername: '@viktrelite',
    isVerified: true,
    media: 'https://picsum.photos/seed/viktor-mom1/400/700',
    mediaType: 'image',
    isLocked: true,
    price: 14.90,
    viewCount: 2341,
    duration: 8000,
    expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mom-005',
    userId: 'creator-005',
    userName: 'Aria Mystic',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aria&backgroundColor=7C3AED',
    userUsername: '@ariamystic',
    isVerified: false,
    media: 'https://picsum.photos/seed/aria-mom1/400/700',
    mediaType: 'image',
    isLocked: false,
    viewCount: 445,
    duration: 5000,
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

const MomentoContext = createContext<MomentoContextType | undefined>(undefined)

export function MomentoProvider({ children }: { children: React.ReactNode }) {
  const [momentos, setMomentos] = useState<Momento[]>(MOCK_MOMENTOS)
  const [activeMomento, setActiveMomentoState] = useState<Momento | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [freeViewsToday, setFreeViewsToday] = useState(3)

  const setActiveMomento = useCallback((momento: Momento | null, index: number) => {
    setActiveMomentoState(momento)
    setActiveIndex(index)
  }, [])

  const nextMomento = useCallback(() => {
    const next = activeIndex + 1
    if (next < momentos.length) {
      const nextMom = momentos[next]
      if (nextMom.isLocked && freeViewsToday <= 0) {
        setActiveMomentoState({ ...nextMom, isLocked: true })
      } else {
        setActiveMomentoState(nextMom)
        setFreeViewsToday(prev => Math.max(0, prev - 1))
      }
      setActiveIndex(next)
    } else {
      setActiveMomentoState(null)
    }
  }, [activeIndex, momentos, freeViewsToday])

  const prevMomento = useCallback(() => {
    const prev = activeIndex - 1
    if (prev >= 0) {
      setActiveMomentoState(momentos[prev])
      setActiveIndex(prev)
    }
  }, [activeIndex, momentos])

  const markAsViewed = useCallback((momentoId: string) => {
    setMomentos(prev => prev.map(m => m.id === momentoId ? { ...m, hasViewed: true } : m))
  }, [])

  const addMomento = useCallback((momentoData: Omit<Momento, 'id' | 'createdAt' | 'viewCount'>) => {
    const newMomento: Momento = {
      ...momentoData,
      id: 'mom-' + Date.now(),
      createdAt: new Date().toISOString(),
      viewCount: 0,
    }
    setMomentos(prev => [newMomento, ...prev])
  }, [])

  return (
    <MomentoContext.Provider value={{
      momentos,
      activeMomento,
      activeIndex,
      freeViewsToday,
      setActiveMomento,
      nextMomento,
      prevMomento,
      markAsViewed,
      addMomento,
    }}>
      {children}
    </MomentoContext.Provider>
  )
}

export function useMomentos() {
  const context = useContext(MomentoContext)
  if (!context) throw new Error('useMomentos must be used within MomentoProvider')
  return context
}