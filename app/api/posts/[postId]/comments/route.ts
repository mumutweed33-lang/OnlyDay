import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/config/env'

type RouteContext = {
  params: Promise<{ postId: string }>
}

const commentInsertSelect = `
  id,
  post_id,
  user_id,
  content,
  created_at
`

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request, context: RouteContext) {
  const { postId } = await context.params
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return jsonError('Supabase env is missing for comments.', 500)
  }

  if (!token) {
    return jsonError('Usuario nao autenticado.', 401)
  }

  const body = (await request.json().catch(() => null)) as { content?: string } | null
  const content = body?.content?.trim()

  if (!content) {
    return jsonError('Comentario vazio.', 400)
  }

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)

  if (authError || !authData.user?.id) {
    return jsonError('Sessao invalida. Entre novamente para comentar.', 401)
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

  const { data, error } = await databaseClient
    .from('comments')
    .insert({
      post_id: postId,
      user_id: authData.user.id,
      content,
    })
    .select(commentInsertSelect)
    .single()

  if (error) {
    return jsonError(
      env.supabaseServiceRoleKey
        ? error.message
        : 'O banco bloqueou o comentario pelo RLS. Configure SUPABASE_SERVICE_ROLE_KEY na Vercel.',
      500
    )
  }

  return NextResponse.json({ comment: data })
}
