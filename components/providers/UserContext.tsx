'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuthService } from '@/lib/auth'
import type { AppUser } from '@/types/domain'

export type User = AppUser
export type LoginMode = 'signUp' | 'signIn'

export interface LoginInput extends Partial<User> {
  email?: string
  password?: string
  mode?: LoginMode
}

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  isOnboarding: boolean
  onboardingStep: number
  login: (userData: LoginInput) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  setOnboardingStep: (step: number) => void
  completeOnboarding: () => void
}

const defaultUser: User = {
  id: 'user-001',
  name: 'Voce',
  username: '@voce',
  email: 'voce@onlyday.local',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001&backgroundColor=7C3AED',
  bio: 'Criador de conteudo premium no OnlyDay',
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
    let cancelled = false

    async function loadSession() {
      try {
        const session = await getAuthService().getSession()
        if (!cancelled) {
          setUser(session.user)
          setIsLoggedIn(session.isAuthenticated)
        }
      } catch (error) {
        console.error('Error loading user session:', error)
      }
    }

    loadSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (userData: LoginInput) => {
    const nextUser = { ...defaultUser, ...userData }
    const authService = getAuthService()
    const mode = userData.mode ?? 'signUp'
    const email =
      userData.email?.trim() || `${nextUser.username.replace('@', '')}@onlyday.local`
    const password = userData.password || 'mock-password'
    const session =
      mode === 'signIn'
        ? await authService.signIn({
            emailOrUsername: email,
            password,
          })
        : await authService.signUp({
            name: nextUser.name,
            username: nextUser.username,
            email,
            password,
            isCreator: nextUser.isCreator,
            bio: nextUser.bio,
            avatar: nextUser.avatar,
          })

    if (!session.user) {
      throw new Error(
        mode === 'signIn'
          ? 'Nao foi possivel entrar com esta conta.'
          : 'Nao foi possivel criar sua conta agora.'
      )
    }

    const mergedUser = { ...nextUser, ...session.user, email: session.user.email || email }
    setUser(mergedUser)
    setIsLoggedIn(session.isAuthenticated)
    setIsOnboarding(false)
    await authService.updateProfile(mergedUser)
  }, [])

  const logout = useCallback(async () => {
    await getAuthService().signOut()
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  const updateUser = useCallback(async (updates: Partial<User>) => {
    const updated = await getAuthService().updateProfile(updates)
    if (updated) {
      setUser(updated)
    } else {
      setUser((prev) => (prev ? { ...prev, ...updates } : prev))
    }
  }, [])

  const completeOnboarding = useCallback(() => {
    setIsOnboarding(false)
    setOnboardingStep(0)
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        isOnboarding,
        onboardingStep,
        login,
        logout,
        updateUser,
        setOnboardingStep,
        completeOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within UserProvider')
  return context
}
