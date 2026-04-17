'use client'

import { hasSupabaseClientEnv } from '@/lib/config/env'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export type OdSurface = 'feed' | 'explore' | 'vault' | 'auction' | 'chat_vip'
export type OdEventType =
  | 'feed_impression'
  | 'post_view'
  | 'post_like'
  | 'post_save'
  | 'post_comment'
  | 'post_share'
  | 'profile_view'
  | 'follow'
  | 'story_open'
  | 'story_complete'
  | 'story_skip'
  | 'story_unlock_click'
  | 'story_unlock_paid'
  | 'vault_open'
  | 'vault_unlock_click'
  | 'vault_unlock_paid'
  | 'auction_view'
  | 'auction_bid'
  | 'auction_win'
  | 'chat_open'
  | 'chat_reply'
  | 'chat_paid_open'
  | 'subscription_start'
  | 'subscription_cancel'
  | 'tip_sent'
  | 'report_content'
  | 'block_user'

interface OdEventPayload {
  actorProfileId?: string
  targetProfileId?: string
  postId?: string
  momentoId?: string
  conversationId?: string
  surface: OdSurface
  eventType: OdEventType
  sessionId?: string
  metadata?: Record<string, unknown>
  eventValue?: number
}

const refreshTimers = new Map<string, number>()

function canTrackOdCore() {
  return typeof window !== 'undefined' && hasSupabaseClientEnv()
}

export async function trackOdEvent(payload: OdEventPayload) {
  if (!canTrackOdCore() || !payload.actorProfileId) return

  try {
    const supabase = getSupabaseBrowserClient()
    await supabase.from('od_event_log').insert({
      actor_profile_id: payload.actorProfileId,
      target_profile_id: payload.targetProfileId ?? null,
      post_id: payload.postId ?? null,
      momento_id: payload.momentoId ?? null,
      conversation_id: payload.conversationId ?? null,
      surface: payload.surface,
      event_type: payload.eventType,
      session_id: payload.sessionId ?? null,
      metadata: payload.metadata ?? {},
      event_value: payload.eventValue ?? 1,
    })
  } catch (error) {
    console.error('[od-core] failed to track event', payload.eventType, error)
  }
}

export function queueOdRefresh(viewerProfileId?: string | null) {
  if (!canTrackOdCore() || !viewerProfileId) return

  const existing = refreshTimers.get(viewerProfileId)
  if (existing) {
    window.clearTimeout(existing)
  }

  const timeoutId = window.setTimeout(async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.rpc('od_refresh_fan_creator_affinity', { p_as_of_date: new Date().toISOString().slice(0, 10) })
      await supabase.rpc('od_refresh_fan_niche_affinity', { p_as_of_date: new Date().toISOString().slice(0, 10) })
      await supabase.rpc('od_refresh_content_quality', { p_as_of_date: new Date().toISOString().slice(0, 10) })
      await supabase.rpc('od_refresh_rank_scores_for_viewer', {
        p_viewer_profile_id: viewerProfileId,
        p_as_of_date: new Date().toISOString().slice(0, 10),
      })
      await supabase.rpc('od_refresh_reach_explanations', {
        p_as_of_date: new Date().toISOString().slice(0, 10),
      })
    } catch (error) {
      console.error('[od-core] failed to refresh viewer scores', error)
    } finally {
      refreshTimers.delete(viewerProfileId)
    }
  }, 2500)

  refreshTimers.set(viewerProfileId, timeoutId)
}
