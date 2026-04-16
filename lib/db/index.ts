'use client'

import { env, hasSupabaseClientEnv } from '@/lib/config/env'
import type { DatabaseProvider } from '@/lib/db/contracts'
import { MockDatabaseProvider } from '@/lib/db/mock-database'
import { SupabaseDatabaseProvider } from '@/lib/db/supabase-database'

let databaseProvider: DatabaseProvider | null = null

export function getDatabaseProvider(): DatabaseProvider {
  if (databaseProvider) return databaseProvider

  if (env.authProvider === 'supabase' && hasSupabaseClientEnv()) {
    databaseProvider = new SupabaseDatabaseProvider()
    return databaseProvider
  }

  databaseProvider = new MockDatabaseProvider()
  return databaseProvider
}
