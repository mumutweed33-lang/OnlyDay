'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, hasSupabaseClientEnv } from '@/lib/config/env'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseBrowserClient() {
  if (!hasSupabaseClientEnv()) {
    throw new Error(
      'As variaveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY ainda nao foram configuradas.'
    )
  }

  if (supabaseClient) return supabaseClient

  supabaseClient = createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}
