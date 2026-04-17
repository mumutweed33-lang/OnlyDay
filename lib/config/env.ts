export type AuthProvider = 'mock' | 'supabase' | 'custom'
export type PaymentsProvider = 'mock' | 'mercado_pago'

function readEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
}

const authProvider = (readEnv('NEXT_PUBLIC_AUTH_PROVIDER') as AuthProvider | undefined) ?? 'mock'
const paymentsProvider =
  (readEnv('NEXT_PUBLIC_PAYMENTS_PROVIDER') as PaymentsProvider | undefined) ?? 'mock'

export const env = {
  appUrl: readEnv('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000',
  authProvider,
  paymentsProvider,
  authSecret: readEnv('AUTH_SECRET'),
  databaseUrl: readEnv('DATABASE_URL'),
  supabaseUrl: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
  mercadoPagoAccessToken: readEnv('MERCADO_PAGO_ACCESS_TOKEN'),
  mercadoPagoWebhookUrl: readEnv('MERCADO_PAGO_WEBHOOK_URL'),
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

  if (env.paymentsProvider === 'mercado_pago' && !readEnv('MERCADO_PAGO_ACCESS_TOKEN')) {
    console.warn(
      '[env] MERCADO_PAGO_ACCESS_TOKEN is missing. PIX checkout will not work until it is configured.'
    )
  }
}
