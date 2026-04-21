'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAuthService } from '@/lib/auth'
import { getDatabaseProvider } from '@/lib/db'
import type { AppUser, AuthSession } from '@/types/domain'

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
  login: (userData: LoginInput) => Promise<AuthSession>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  setOnboardingStep: (step: number) => void
  completeOnboarding: () => void
}

const defaultUser: User = {
  id: 'user-001',
  name: 'Você',
  username: '@voce',
  email: 'voce@onlyday.local',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001&backgroundColor=7C3AED',
  bio: 'Criador de conteúdo premium no OnlyDay',
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

function normalizeCreatorState(
  baseUser: Partial<User> | null | undefined,
  updates: Partial<User>
): Partial<User> {
  const nextPlan = updates.plan ?? baseUser?.plan ?? 'free'
  const explicitCreatorFlag = updates.isCreator ?? baseUser?.isCreator ?? false
  const isCreator = nextPlan !== 'free' ? true : explicitCreatorFlag

  return {
    ...updates,
    isCreator,
    isVerified: isCreator ? updates.isVerified ?? baseUser?.isVerified ?? false : false,
  }
}

function normalizeUsername(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_]/g, '')

  return cleaned ? `@${cleaned}` : ''
}

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
          if (session.user) {
            try {
              const storedUser = await getDatabaseProvider().users.findById(session.user.id)
              const persistedUser = storedUser ?? session.user
              const nextUser = {
                ...session.user,
                ...normalizeCreatorState(session.user, persistedUser),
                ...persistedUser,
              }
              setUser(nextUser)
              if (!storedUser) {
                void getDatabaseProvider()
                  .users.create(nextUser)
                  .catch((syncError) =>
                    console.error('Error syncing confirmed profile:', syncError)
                  )
              }
            } catch (dbError) {
              console.error('Error loading persisted profile:', dbError)
              setUser(session.user)
            }
          } else {
            setUser(null)
          }
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
            niche: nextUser.niche,
            avatar: nextUser.avatar,
          })

    if (!session.user) {
      if (session.emailVerificationRequired) {
        setUser(null)
        setIsLoggedIn(false)
        setIsOnboarding(false)
        return session
      }

      throw new Error(
        mode === 'signIn'
      ? 'Não foi possível entrar com esta conta.'
      : 'Não foi possível criar sua conta agora.'
      )
    }

    let persistedUser: User | null = null
    try {
      persistedUser = await getDatabaseProvider().users.findById(session.user.id)
    } catch (error) {
      console.error('Error loading profile after auth:', error)
    }

    const mergedUser =
      mode === 'signIn'
        ? {
            ...session.user,
            ...(persistedUser ? normalizeCreatorState(session.user, persistedUser) : {}),
            ...(persistedUser ?? {}),
            email: persistedUser?.email || session.user.email || email,
          }
        : {
            ...nextUser,
            ...normalizeCreatorState(nextUser, session.user),
            ...session.user,
            email: session.user.email || email,
          }

    setUser(mergedUser)
    setIsLoggedIn(session.isAuthenticated)
    setIsOnboarding(false)
    if (mode === 'signUp' || persistedUser) {
      await authService.updateProfile(mergedUser)
    }
    try {
      await getDatabaseProvider().users.create(mergedUser)
    } catch (error) {
      console.error('Error syncing profile after login:', error)
    }
    return session
  }, [])

  const logout = useCallback(async () => {
    await getAuthService().signOut()
    setUser(null)
    setIsLoggedIn(false)
  }, [])

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return

    const normalizedUsername =
      typeof updates.username === 'string' ? normalizeUsername(updates.username) : undefined

    if (updates.username !== undefined) {
      if (!normalizedUsername || normalizedUsername.length < 4) {
        throw new Error('Escolha um @username com pelo menos 3 caracteres.')
      }

      if (normalizedUsername !== user.username) {
        const existingUser = await getDatabaseProvider().users.findByUsername(normalizedUsername)
        if (existingUser && existingUser.id !== user.id) {
          throw new Error('Esse @username ja esta em uso. Escolha outro.')
        }
      }
    }

    const normalizedUpdates = normalizeCreatorState(user, {
      ...updates,
      ...(normalizedUsername ? { username: normalizedUsername } : {}),
    })
    const updated = await getAuthService().updateProfile(normalizedUpdates)
    const nextUser = {
      ...user,
      ...normalizedUpdates,
      ...(updated ?? {}),
    }

    try {
      const persisted = await getDatabaseProvider().users.update(user.id, nextUser)
      if (persisted) {
        setUser(persisted)
        return
      }

      const created = await getDatabaseProvider().users.create(nextUser)
      setUser(created)
    } catch (error) {
      console.error('Error persisting updated profile:', error)
      throw error instanceof Error
        ? error
        : new Error('Nao foi possivel salvar seu perfil agora.')
    }
  }, [user])

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
