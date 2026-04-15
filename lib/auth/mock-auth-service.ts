'use client'

import type { AppUser, AuthSession, CreateAccountInput } from '@/types/domain'
import type { AuthService, SignInInput } from '@/lib/auth/contracts'

const STORAGE_USER_KEY = 'onlyday_user'
const STORAGE_LOGIN_KEY = 'onlyday_logged_in'

const defaultUser: AppUser = {
  id: 'user-001',
  name: 'Voce',
  username: '@voce',
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

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function buildSession(user: AppUser | null): AuthSession {
  return {
    user,
    isAuthenticated: Boolean(user),
  }
}

function normalizeUsername(username: string) {
  const cleaned = username.trim().replace(/^@+/, '')
  return `@${cleaned || 'usuario'}`
}

export class MockAuthService implements AuthService {
  async getSession(): Promise<AuthSession> {
    if (!canUseStorage()) return buildSession(null)

    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY)
      const savedLogin = localStorage.getItem(STORAGE_LOGIN_KEY)

      if (savedUser && savedLogin === 'true') {
        return buildSession(JSON.parse(savedUser) as AppUser)
      }
    } catch (error) {
      console.error('[mock-auth] failed to load session', error)
    }

    return buildSession(null)
  }

  async signUp(input: CreateAccountInput): Promise<AuthSession> {
    const user: AppUser = {
      ...defaultUser,
      id: `user-${Date.now()}`,
      name: input.name || defaultUser.name,
      username: normalizeUsername(input.username),
      bio: input.bio || defaultUser.bio,
      avatar:
        input.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}&backgroundColor=7C3AED`,
      isCreator: input.isCreator,
      isVerified: Boolean(input.avatar),
      joinedAt: new Date().toISOString(),
    }

    if (canUseStorage()) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
      localStorage.setItem(STORAGE_LOGIN_KEY, 'true')
    }

    return buildSession(user)
  }

  async signIn(input: SignInInput): Promise<AuthSession> {
    const current = await this.getSession()
    if (current.user) return current

    const fallbackUser: AppUser = {
      ...defaultUser,
      id: `user-${Date.now()}`,
      name: input.emailOrUsername.replace('@', '') || defaultUser.name,
      username: normalizeUsername(input.emailOrUsername),
      joinedAt: new Date().toISOString(),
    }

    if (canUseStorage()) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fallbackUser))
      localStorage.setItem(STORAGE_LOGIN_KEY, 'true')
    }

    return buildSession(fallbackUser)
  }

  async signOut(): Promise<void> {
    if (!canUseStorage()) return
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_LOGIN_KEY)
  }

  async updateProfile(updates: Partial<AppUser>): Promise<AppUser | null> {
    const session = await this.getSession()
    if (!session.user) return null

    const nextUser = { ...session.user, ...updates }
    if (canUseStorage()) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))
    }

    return nextUser
  }
}
