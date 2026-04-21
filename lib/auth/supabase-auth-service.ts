'use client'

import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { AuthService, SignInInput } from '@/lib/auth/contracts'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { env } from '@/lib/config/env'
import type { AppUser, AuthSession, CreateAccountInput } from '@/types/domain'

const PROFILE_CACHE_KEY = 'onlyday_supabase_profile'

const defaultProfile: Omit<AppUser, 'id' | 'name' | 'username' | 'avatar' | 'joinedAt'> = {
  bio: 'Criador de conteudo premium no OnlyDay',
  isCreator: false,
  isVerified: false,
  isPremium: false,
  followers: 0,
  following: 0,
  posts: 0,
  balance: 0,
  plan: 'free',
  intimacyScore: 0,
}

type StoredProfiles = Record<string, Partial<AppUser>>

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeUsername(username?: string | null) {
  const cleaned = (username ?? '')
    .trim()
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20)
  return cleaned ? `@${cleaned}` : ''
}

function assertValidUsername(username: string) {
  const handle = username.replace(/^@+/, '')
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    throw new Error('Escolha um @username com 3 a 20 caracteres, usando apenas letras, numeros e _.')
  }
}

function getAvatarSeed(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'onlyday'
}

function isInlineImage(value?: string) {
  return Boolean(value?.startsWith('data:image/'))
}

function readProfileCache(): StoredProfiles {
  if (!canUseStorage()) return {}

  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    return raw ? (JSON.parse(raw) as StoredProfiles) : {}
  } catch (error) {
    console.error('[supabase-auth] failed to parse profile cache', error)
    return {}
  }
}

function writeProfileCache(nextCache: StoredProfiles) {
  if (!canUseStorage()) return
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextCache))
}

function cacheProfile(profile: AppUser) {
  const nextCache = readProfileCache()
  nextCache[profile.id] = profile
  writeProfileCache(nextCache)
}

function clearCachedProfile(userId?: string) {
  if (!canUseStorage()) return
  if (!userId) {
    localStorage.removeItem(PROFILE_CACHE_KEY)
    return
  }

  const nextCache = readProfileCache()
  delete nextCache[userId]
  writeProfileCache(nextCache)
}

function getCachedProfile(userId: string) {
  return readProfileCache()[userId]
}

function toAppUser(user: SupabaseUser, fallback?: Partial<AppUser>): AppUser {
  const metadata = (user.user_metadata ?? {}) as Partial<AppUser> & {
    username?: string
    avatar?: string
  }
  const cached = getCachedProfile(user.id)
  const merged = { ...defaultProfile, ...cached, ...metadata, ...fallback }
  const derivedName =
    merged.name ||
    user.email?.split('@')[0]?.replace(/[._-]+/g, ' ') ||
    'Usuario OnlyDay'
  const derivedUsername = normalizeUsername(
    merged.username || user.email?.split('@')[0] || user.id.slice(0, 8)
  )
  const derivedAvatar =
    merged.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${getAvatarSeed(
      user.email || user.id
    )}&backgroundColor=7C3AED`
  const isCreator = Boolean(merged.isCreator)

  const profile: AppUser = {
    id: user.id,
    email: user.email,
    name: derivedName,
    username: derivedUsername,
    avatar: derivedAvatar,
    bio: merged.bio || defaultProfile.bio,
    isCreator,
    isVerified: isCreator && Boolean(merged.isVerified),
    isPremium: Boolean(merged.isPremium),
    followers: Number(merged.followers ?? 0),
    following: Number(merged.following ?? 0),
    posts: Number(merged.posts ?? 0),
    balance: Number(merged.balance ?? 0),
    plan: merged.plan || 'free',
    joinedAt: user.created_at || merged.joinedAt || new Date().toISOString(),
    coverImage: merged.coverImage,
    website: merged.website,
    location: merged.location,
    intimacyScore: Number(merged.intimacyScore ?? 0),
  }

  cacheProfile(profile)
  return profile
}

function buildSession(
  user: AppUser | null,
  isAuthenticated = Boolean(user),
  extras?: Pick<AuthSession, 'emailVerificationRequired' | 'email'>
): AuthSession {
  return {
    user,
    isAuthenticated,
    ...extras,
  }
}

function toUserMetadata(user: Partial<AppUser>) {
  return {
    name: user.name,
    username: normalizeUsername(user.username),
    avatar: isInlineImage(user.avatar) ? undefined : user.avatar,
    bio: user.bio,
    isCreator: user.isCreator,
    isPremium: user.isPremium,
    followers: user.followers,
    following: user.following,
    posts: user.posts,
    balance: user.balance,
    plan: user.plan,
    coverImage: isInlineImage(user.coverImage) ? undefined : user.coverImage,
    website: user.website,
    location: user.location,
    intimacyScore: user.intimacyScore,
  }
}

function normalizeAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'Esse e-mail já tem uma conta. Use Entrar ou escolha outro e-mail para criar uma nova conta.'
  }

  if (normalized.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos. Confira os dados e tente novamente.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Enviamos um link de verificacao para sua caixa de entrada.'
  }

  return message
}

export class SupabaseAuthService implements AuthService {
  async getSession(): Promise<AuthSession> {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    const currentUser = data.session?.user ?? null
    if (currentUser && !currentUser.email_confirmed_at) {
      await supabase.auth.signOut()
      return buildSession(null, false, {
        emailVerificationRequired: true,
        email: currentUser.email,
      })
    }

    return buildSession(currentUser ? toAppUser(currentUser) : null)
  }

  async signUp(input: CreateAccountInput): Promise<AuthSession> {
    const supabase = getSupabaseBrowserClient()
    const username = normalizeUsername(input.username)
    assertValidUsername(username)

    const { data: existingUsername, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (usernameError) {
      throw new Error(usernameError.message)
    }

    if (existingUsername) {
      throw new Error('Esse @username ja esta em uso. Escolha outro.')
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${env.appUrl.replace(/\/$/, '')}/auth/callback`,
        data: toUserMetadata({
          name: input.name,
          username,
          email: input.email,
          avatar:
            input.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${getAvatarSeed(
              input.email
            )}&backgroundColor=7C3AED`,
          bio: input.bio || defaultProfile.bio,
          isCreator: input.isCreator,
          isVerified: false,
          isPremium: false,
          followers: 0,
          following: 0,
          posts: 0,
          balance: 0,
          plan: 'free',
          joinedAt: new Date().toISOString(),
          intimacyScore: 0,
        }),
      },
    })

    if (error) {
      throw new Error(normalizeAuthError(error.message))
    }

    if (!data.user) {
      throw new Error('Nao foi possivel criar a conta no Supabase.')
    }

    if (!data.session || !data.user.email_confirmed_at) {
      if (data.session) {
        await supabase.auth.signOut()
      }

      return buildSession(null, false, {
        emailVerificationRequired: true,
        email: input.email,
      })
    }

    return buildSession(toAppUser(data.user), true)
  }

  async signIn(input: SignInInput): Promise<AuthSession> {
    const supabase = getSupabaseBrowserClient()
    const credential = input.emailOrUsername.trim()

    if (!credential.includes('@')) {
      throw new Error('Use seu e-mail para entrar nesta versao conectada ao Supabase.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credential,
      password: input.password,
    })

    if (error) {
      throw new Error(normalizeAuthError(error.message))
    }

    if (!data.user) {
      throw new Error('Nao encontramos uma conta valida para este login.')
    }

    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut()
      throw new Error(
        'Confirme seu e-mail antes de entrar. Enviamos um link de verificacao para sua caixa de entrada.'
      )
    }

    return buildSession(toAppUser(data.user), true)
  }

  async resetPassword(email: string): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      throw new Error('Informe seu e-mail para receber a recuperação de senha.')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    const current = await this.getSession()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    clearCachedProfile(current.user?.id)
  }

  async updateProfile(updates: Partial<AppUser>): Promise<AppUser | null> {
    const supabase = getSupabaseBrowserClient()
    const session = await this.getSession()

    if (!session.user) return null

    const nextUser = { ...session.user, ...updates }
    const { data, error } = await supabase.auth.updateUser({
      data: toUserMetadata(nextUser),
    })

    if (error) {
      throw new Error(error.message)
    }

    const updatedUser = data.user ? toAppUser(data.user, nextUser) : nextUser
    cacheProfile(updatedUser)
    return updatedUser
  }
}
