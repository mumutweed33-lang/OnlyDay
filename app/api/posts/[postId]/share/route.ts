import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/config/env'

type RouteContext = {
  params: Promise<{ postId: string }>
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request, context: RouteContext) {
  const { postId } = await context.params
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return jsonError('Supabase env is missing for post shares.', 500)
  }

  if (!token) {
    return jsonError('Usuario nao autenticado.', 401)
  }

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)

  if (authError || !authData.user?.id) {
    return jsonError('Sessao invalida. Entre novamente para compartilhar.', 401)
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

  const { data: post, error: postError } = await databaseClient
    .from('posts')
    .select('id, shares_count')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return jsonError(postError?.message || 'Post nao encontrado.', 404)
  }

  const nextShares = Number(post.shares_count ?? 0) + 1

  const { error: updateError } = await databaseClient
    .from('posts')
    .update({
      shares_count: nextShares,
    })
    .eq('id', postId)

  if (updateError) {
    return jsonError(
      env.supabaseServiceRoleKey
        ? updateError.message
        : 'O banco bloqueou o compartilhamento pelo RLS. Configure SUPABASE_SERVICE_ROLE_KEY na Vercel ou rode a funcao SQL increment_post_share.',
      500
    )
  }

  return NextResponse.json({
    postId,
    shares: nextShares,
  })
}
