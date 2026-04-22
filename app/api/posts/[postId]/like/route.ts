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

  if (!env.supabaseUrl || !env.supabaseAnonKey || !env.supabaseServiceRoleKey) {
    return jsonError('Supabase server env is missing for post likes.', 500)
  }

  if (!token) {
    return jsonError('Usuario nao autenticado.', 401)
  }

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)

  if (authError || !authData.user?.id) {
    return jsonError('Sessao invalida. Entre novamente para curtir.', 401)
  }

  const userId = authData.user.id
  const admin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: post, error: postError } = await admin
    .from('posts')
    .select('id, liked_by')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return jsonError(postError?.message || 'Post nao encontrado.', 404)
  }

  const currentLikedBy = Array.isArray(post.liked_by) ? (post.liked_by as string[]) : []
  const alreadyLiked = currentLikedBy.includes(userId)
  const nextLikedBy = alreadyLiked
    ? currentLikedBy.filter((id) => id !== userId)
    : [...currentLikedBy, userId]

  const { error: updateError } = await admin
    .from('posts')
    .update({
      liked_by: nextLikedBy,
      likes_count: nextLikedBy.length,
    })
    .eq('id', postId)

  if (updateError) {
    return jsonError(updateError.message, 500)
  }

  return NextResponse.json({
    postId,
    likes: nextLikedBy.length,
    isLiked: !alreadyLiked,
  })
}
