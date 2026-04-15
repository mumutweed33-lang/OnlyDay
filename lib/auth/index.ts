'use client'

import type { AuthService } from '@/lib/auth/contracts'
import { MockAuthService } from '@/lib/auth/mock-auth-service'
import { SupabaseAuthService } from '@/lib/auth/supabase-auth-service'
import { env, hasSupabaseClientEnv } from '@/lib/config/env'

let clientAuthService: AuthService | null = null

export function getAuthService(): AuthService {
  if (clientAuthService) return clientAuthService

  switch (env.authProvider) {
    case 'supabase':
      if (hasSupabaseClientEnv()) {
        clientAuthService = new SupabaseAuthService()
        return clientAuthService
      }

      console.warn(
        '[auth] NEXT_PUBLIC_AUTH_PROVIDER=supabase, mas as chaves publicas ainda nao foram configuradas. Fazendo fallback para mock auth.'
      )
      clientAuthService = new MockAuthService()
      return clientAuthService
    case 'mock':
    default:
      clientAuthService = new MockAuthService()
      return clientAuthService
  }
}
