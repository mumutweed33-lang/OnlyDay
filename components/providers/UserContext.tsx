'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  isCreator: boolean
  isVerified: boolean
  isPremium: boolean
  followers: number
  following: number
  posts: number
  balance: number
  plan: 'free' | 'bronze' | 'gold' | 'diamond'
  joinedAt: string
  coverImage?: string
  website?: string
  location?: string
  intimacyScore?: number
}

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  isOnboarding: boolean
  onboardingStep: number
  login: (userData: Partial<User>) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setOnboardingStep: (step: number) => void
  completeOnboarding: () => void
}

const defaultUser: User = {
  id: 'user-001',
  name: 'Você',
  username: '@voce',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001&backgroundColor=7C3AED',
  bio: 'Criador de conteúdo premium no OnlyDay ✨',
  isCreator: false,
  isVerified: false,
  isPremium: false,
  followers: 0,
  following: 0,
  posts: 0,
  balance: 0,
  plan: 'free',
  joinedAt: new Date().toISOString(),
  intimacyScore: 0,
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('onlyday_user')
      const savedLogin = localStorage.getItem('onlyday_logged_in')
      if (savedUser && savedLogin === 'true') {
        setUser(JSON.parse(savedUser))
        setIsLoggedIn(true)
      }
    } catch (e) {
      console.error('Error loading user:', e)
    }
  }, [])

  const login = useCallback((userData: Partial<User>) => {
    const newUser = { ...defaultUser, ...userData }
    setUser(newUser)
    setIsLoggedIn(true)
    setIsOnboarding(false)
    try {
      localStorage.setItem('onlyday_user', JSON.stringify(newUser))
      localStorage.setItem('onlyday_logged_in', 'true')
    } catch (e) {}
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsLoggedIn(false)
    try {
      localStorage.removeItem('onlyday_user')
      localStorage.removeItem('onlyday_logged_in')
    } catch (e) {}
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      try {
        localStorage.setItem('onlyday_user', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
  }, [])

  const completeOnboarding = useCallback(() => {
    setIsOnboarding(false)
    setOnboardingStep(0)
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      isLoggedIn,
      isOnboarding,
      onboardingStep,
      login,
      logout,
      updateUser,
      setOnboardingStep,
      completeOnboarding,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}