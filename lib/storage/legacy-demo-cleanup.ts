'use client'

const LEGACY_DEMO_KEYS = [
  'onlyday_posts',
  'onlyday_conversations',
  'onlyday_momentos',
  'onlyday_comments',
  'onlyday_profiles',
  'onlyday_following',
  'onlyday_shares',
]

const LEGACY_DEMO_MARKERS = [
  'creator-00',
  'seed-user-',
  'seed-comment-',
  'notif-like-seed',
  'notif-follow-seed',
  'notif-suggested-seed',
  'Luna Estrela',
  'Rafael Ouro',
  'Sofia Dark',
  'Marina Luz',
  'Caio Heat',
  'Nina Gold',
  'api.dicebear.com',
  'picsum.photos',
]

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function hasLegacyDemoContent(value: string | null) {
  if (!value) return false
  return LEGACY_DEMO_MARKERS.some((marker) => value.includes(marker))
}

export function cleanupLegacyDemoStorage() {
  if (!canUseStorage()) return

  for (const key of LEGACY_DEMO_KEYS) {
    const value = window.localStorage.getItem(key)
    if (hasLegacyDemoContent(value)) {
      window.localStorage.removeItem(key)
    }
  }

  const notifications = window.localStorage.getItem('onlyday_notifications')
  if (hasLegacyDemoContent(notifications)) {
    window.localStorage.removeItem('onlyday_notifications')
  }
}

export function clearLegacyUserStorageAfterRealAuth() {
  if (!canUseStorage()) return

  for (const key of [...LEGACY_DEMO_KEYS, 'onlyday_notifications']) {
    window.localStorage.removeItem(key)
  }
}
