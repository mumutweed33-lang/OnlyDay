'use client'

import type { AuthService, SignInInput } from '@/lib/auth/contracts'
import { MockAuthService } from '@/lib/auth/mock-auth-service'
import { SupabaseAuthService } from '@/lib/auth/supabase-auth-service'
import { env, hasSupabaseClientEnv } from '@/lib/config/env'
import type { AppUser, AuthSession, CreateAccountInput } from '@/types/domain'

let clientAuthService: AuthService | null = null

class MissingSupabaseAuthService implements AuthService {
  private buildError() {
    return new Error(
      'Autenticacao real nao configurada. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel para entrar com e-mail e senha em qualquer dispositivo.'
    )
  }

  async getSession(): Promise<AuthSession> {
    return { user: null, isAuthenticated: false }
  }

  async signUp(_input: CreateAccountInput): Promise<AuthSession> {
    throw this.buildError()
  }

  async signIn(_input: SignInInput): Promise<AuthSession> {
    throw this.buildError()
  }

  async resetPassword(_email: string): Promise<void> {
    throw this.buildError()
  }

  async signOut(): Promise<void> {
    return undefined
  }

  async updateProfile(_updates: Partial<AppUser>): Promise<AppUser | null> {
    throw this.buildError()
  }
}

export function getAuthService(): AuthService {
  if (clientAuthService) return clientAuthService

  if (process.env.NODE_ENV === 'production' && env.authProvider !== 'supabase') {
    console.warn('[auth] Auth mock bloqueado em producao. Configure Supabase para autenticar.')
    clientAuthService = new MissingSupabaseAuthService()
    return clientAuthService
  }

  switch (env.authProvider) {
    case 'supabase':
      if (hasSupabaseClientEnv()) {
        clientAuthService = new SupabaseAuthService()
        return clientAuthService
      }

      console.warn(
        '[auth] NEXT_PUBLIC_AUTH_PROVIDER=supabase, mas as chaves publicas ainda nao foram configuradas.'
      )
      clientAuthService = new MissingSupabaseAuthService()
      return clientAuthService
    case 'mock':
    default:
      clientAuthService = new MockAuthService()
      return clientAuthService
  }
}
