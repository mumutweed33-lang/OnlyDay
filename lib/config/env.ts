export type AuthProvider = 'mock' | 'supabase' | 'custom'

function readEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
}

const authProvider = (readEnv('NEXT_PUBLIC_AUTH_PROVIDER') as AuthProvider | undefined) ?? 'mock'

export const env = {
  appUrl: readEnv('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000',
  authProvider,
  authSecret: readEnv('AUTH_SECRET'),
  databaseUrl: readEnv('DATABASE_URL'),
  supabaseUrl: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
}

export function hasSupabaseClientEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export function validateServerEnv() {
  if (typeof window !== 'undefined') return

  if (env.authProvider === 'custom' && !readEnv('AUTH_SECRET')) {
    console.warn(
      '[env] AUTH_SECRET is missing. Add it before enabling a custom auth provider in production.'
    )
  }
}
