import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/config/env'

const momentoSelect = '*, profiles:profiles!momentos_user_id_fkey(*)'

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return jsonError('Supabase env is missing for momentos.', 500)
  }

  if (!token) {
    return jsonError('Usuario nao autenticado.', 401)
  }

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)

  if (authError || !authData.user?.id) {
    return jsonError('Sessao invalida. Entre novamente para publicar.', 401)
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) {
    return jsonError('Payload invalido para publicar o Momento.', 400)
  }

  const media = typeof body.media === 'string' ? body.media : ''
  const mediaType = body.media_type === 'video' ? 'video' : 'image'
  const expiresAt = typeof body.expires_at === 'string' ? body.expires_at : ''

  if (!media || !expiresAt) {
    return jsonError('Midia e expiracao sao obrigatorias para o Momento.', 400)
  }

  const databaseClient = env.supabaseServiceRoleKey
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })

  const payload = {
    user_id: authData.user.id,
    media,
    media_type: mediaType,
    is_locked: Boolean(body.is_locked),
    price: typeof body.price === 'number' ? body.price : null,
    daily_free_count: typeof body.daily_free_count === 'number' ? body.daily_free_count : 3,
    view_count: 0,
    duration: typeof body.duration === 'number' ? body.duration : 7000,
    expires_at: expiresAt,
  }

  const { data, error } = await databaseClient
    .from('momentos')
    .insert(payload)
    .select(momentoSelect)
    .single()

  if (error) {
    return jsonError(
      env.supabaseServiceRoleKey
        ? error.message
        : 'O banco bloqueou a publicacao do Momento pelo RLS. Configure SUPABASE_SERVICE_ROLE_KEY na Vercel.',
      500
    )
  }

  return NextResponse.json({ momento: data })
}
