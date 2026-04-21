'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getDatabaseProvider } from '@/lib/db'
import { useUser } from '@/components/providers/UserContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Momento, NewMomento } from '@/types/domain'

const ACCESS_STORAGE_KEY = 'onlyday_momento_access'
const DEFAULT_FREE_VIEWS = 3
const ACCESS_DURATION_MS = 24 * 60 * 60 * 1000

interface OdMomentoRankRow {
  entity_id: string
  owner_profile_id: string | null
  final_score: number | null
}

interface CreatorAccessState {
  freeViewsUsed: number
  unlockedUntil?: string
}

interface CreatorMomentosSummary {
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  userBio?: string
  isVerified: boolean
  isCreator: boolean
  momentos: Momento[]
  hasViewed: boolean
  isUnlocked: boolean
  remainingFreeViews: number
  price?: number
}

interface MomentoContextType {
  momentos: Momento[]
  creatorMomentos: CreatorMomentosSummary[]
  activeMomento: Momento | null
  activeMomentos: Momento[]
  activeIndex: number
  currentCreatorId: string | null
  currentCreatorPosition: number
  totalCreators: number
  setActiveMomento: (momento: Momento | null, index?: number) => void
  openCreatorMomentos: (creatorId: string, startIndex?: number) => void
  nextMomento: () => void
  prevMomento: () => void
  markAsViewed: (momentoId: string) => Promise<void>
  addMomento: (momento: NewMomento) => Promise<void>
  canViewMomento: (momento: Momento, indexWithinCreator?: number) => boolean
  getRemainingFreeViews: (creatorId: string) => number
  unlockCreatorMomentos: (creatorId: string) => void
  isCreatorUnlocked: (creatorId: string) => boolean
}

const MomentoContext = createContext<MomentoContextType | undefined>(undefined)

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readAccessState(): Record<string, CreatorAccessState> {
  if (!canUseStorage()) return {}
  try {
    const raw = localStorage.getItem(ACCESS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, CreatorAccessState>) : {}
  } catch {
    return {}
  }
}

function writeAccessState(nextState: Record<string, CreatorAccessState>) {
  if (!canUseStorage()) return
  localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify(nextState))
}

function isUnlocked(entry?: CreatorAccessState) {
  if (!entry?.unlockedUntil) return false
  return new Date(entry.unlockedUntil).getTime() > Date.now()
}

export function MomentoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [momentos, setMomentos] = useState<Momento[]>([])
  const [activeMomentoId, setActiveMomentoId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [currentCreatorId, setCurrentCreatorId] = useState<string | null>(null)
  const [creatorAccess, setCreatorAccess] = useState<Record<string, CreatorAccessState>>({})
  const [momentoRankMap, setMomentoRankMap] = useState<Record<string, number>>({})
  const [creatorRankMap, setCreatorRankMap] = useState<Record<string, number>>({})
  const markingAsViewedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setCreatorAccess(readAccessState())
  }, [])

  const loadMomentos = useCallback(async () => {
    try {
      const nextMomentos = await getDatabaseProvider().momentos.listActive()
      setMomentos(nextMomentos)
    } catch (error) {
      console.error('[momentos] failed to load momentos', error)
      setMomentos([])
    }
  }, [])

  useEffect(() => {
    void loadMomentos()

    const refreshInterval = window.setInterval(() => {
      void loadMomentos()
    }, 20000)
    window.addEventListener('focus', loadMomentos)

    return () => {
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', loadMomentos)
    }
  }, [loadMomentos])

  useEffect(() => {
    let cancelled = false

    async function loadRankedMomentos() {
      if (!user?.id) {
        setMomentoRankMap({})
        setCreatorRankMap({})
        return
      }

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_rank_scores')
          .select('entity_id, owner_profile_id, final_score')
          .eq('viewer_profile_id', user.id)
          .eq('surface', 'vault')
          .eq('entity_type', 'momento')
          .order('final_score', { ascending: false })
          .limit(120)

        if (error) {
          console.warn('[od-core] momento ranking unavailable, using current ordering', error.message)
          if (!cancelled) {
            setMomentoRankMap({})
            setCreatorRankMap({})
          }
          return
        }

        const nextMomentoRankMap: Record<string, number> = {}
        const nextCreatorRankMap: Record<string, number> = {}

        for (const row of ((data as OdMomentoRankRow[]) ?? [])) {
          const score = Number(row.final_score ?? 0)
          nextMomentoRankMap[row.entity_id] = score

          if (row.owner_profile_id) {
            const currentScore = nextCreatorRankMap[row.owner_profile_id] ?? Number.NEGATIVE_INFINITY
            if (score > currentScore) {
              nextCreatorRankMap[row.owner_profile_id] = score
            }
          }
        }

        if (!cancelled) {
          setMomentoRankMap(nextMomentoRankMap)
          setCreatorRankMap(nextCreatorRankMap)
        }
      } catch (error) {
        console.error('[od-core] failed to load momento ranking', error)
        if (!cancelled) {
          setMomentoRankMap({})
          setCreatorRankMap({})
        }
      }
    }

    void loadRankedMomentos()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const creatorMomentos = useMemo(() => {
    const onlyCreators = momentos
      .filter((momento) => momento.isCreator !== false)
      .sort((a, b) => {
        const rankDelta = (momentoRankMap[b.id] ?? 0) - (momentoRankMap[a.id] ?? 0)
        if (rankDelta !== 0) return rankDelta
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

    const grouped = new Map<string, Momento[]>()
    for (const momento of onlyCreators) {
      const list = grouped.get(momento.userId) ?? []
      list.push(momento)
      grouped.set(momento.userId, list)
    }

    return Array.from(grouped.values())
      .map((creatorItems) => {
        const first = creatorItems[0]
      const access = creatorAccess[first.userId]
      const unlocked = isUnlocked(access)
      const remainingFreeViews = Math.max(
        0,
        (first.dailyFreeCount ?? DEFAULT_FREE_VIEWS) - (access?.freeViewsUsed ?? 0)
      )

      return {
        userId: first.userId,
        userName: first.userName,
        userAvatar: first.userAvatar,
        userUsername: first.userUsername,
        userBio: first.userBio,
        isVerified: first.isVerified,
        isCreator: first.isCreator !== false,
        momentos: creatorItems,
        hasViewed: creatorItems.every((item) => item.hasViewed),
        isUnlocked: unlocked,
        remainingFreeViews,
        price: creatorItems.find((item) => item.price)?.price,
      } satisfies CreatorMomentosSummary
      })
      .sort((left, right) => {
        const rankDelta = (creatorRankMap[right.userId] ?? 0) - (creatorRankMap[left.userId] ?? 0)
        if (rankDelta !== 0) return rankDelta
        const rightCreatedAt = right.momentos[0]?.createdAt ?? ''
        const leftCreatedAt = left.momentos[0]?.createdAt ?? ''
        return new Date(rightCreatedAt).getTime() - new Date(leftCreatedAt).getTime()
      })
  }, [creatorAccess, creatorRankMap, momentoRankMap, momentos])

  const activeMomentos = useMemo(() => {
    if (!currentCreatorId) return []
    return (
      creatorMomentos.find((creator) => creator.userId === currentCreatorId)?.momentos ?? []
    )
  }, [creatorMomentos, currentCreatorId])

  const currentCreatorPosition = useMemo(() => {
    if (!currentCreatorId) return -1
    return creatorMomentos.findIndex((creator) => creator.userId === currentCreatorId)
  }, [creatorMomentos, currentCreatorId])

  const totalCreators = creatorMomentos.length

  const activeMomento = useMemo(() => {
    if (activeMomentos.length === 0) return null
    return activeMomentos[activeIndex] ?? null
  }, [activeIndex, activeMomentos])

  const isCreatorUnlocked = useCallback(
    (creatorId: string) => isUnlocked(creatorAccess[creatorId]),
    [creatorAccess]
  )

  const getRemainingFreeViews = useCallback(
    (creatorId: string) => {
      const creatorFreeLimit =
        momentos.find((momento) => momento.userId === creatorId)?.dailyFreeCount ??
        DEFAULT_FREE_VIEWS

      return Math.max(
        0,
        creatorFreeLimit - (creatorAccess[creatorId]?.freeViewsUsed ?? 0)
      )
    },
    [creatorAccess, momentos]
  )

  const canViewMomento = useCallback(
    (momento: Momento, indexWithinCreator = 0) => {
      if (user?.id === momento.userId) return true
      if (!momento.isLocked) return true
      if (isCreatorUnlocked(momento.userId)) return true
      const freeLimit = momento.dailyFreeCount ?? DEFAULT_FREE_VIEWS
      const freeViewsUsed = creatorAccess[momento.userId]?.freeViewsUsed ?? 0
      return indexWithinCreator < freeLimit && freeViewsUsed < freeLimit
    },
    [creatorAccess, isCreatorUnlocked, user?.id]
  )

  const updateCreatorAccess = useCallback(
    (creatorId: string, updater: (current: CreatorAccessState) => CreatorAccessState) => {
      setCreatorAccess((prev) => {
        const current = prev[creatorId] ?? { freeViewsUsed: 0 }
        const next = { ...prev, [creatorId]: updater(current) }
        writeAccessState(next)
        return next
      })
    },
    []
  )

  const openCreatorMomentos = useCallback(
    (creatorId: string, startIndex = 0) => {
      const creator = creatorMomentos.find((item) => item.userId === creatorId)
      if (!creator) return
      setCurrentCreatorId(creatorId)
      setActiveIndex(Math.max(0, Math.min(startIndex, creator.momentos.length - 1)))
      setActiveMomentoId(creator.momentos[startIndex]?.id ?? creator.momentos[0]?.id ?? null)
    },
    [creatorMomentos]
  )

  const setActiveMomento = useCallback(
    (momento: Momento | null, index = 0) => {
      if (!momento) {
        setCurrentCreatorId(null)
        setActiveMomentoId(null)
        setActiveIndex(0)
        return
      }
      openCreatorMomentos(momento.userId, index)
    },
    [openCreatorMomentos]
  )

  const nextMomento = useCallback(() => {
    if (activeMomentos.length === 0) return
    const nextIndex = activeIndex + 1
    if (nextIndex >= activeMomentos.length) {
      const nextCreator = creatorMomentos[currentCreatorPosition + 1]
      if (!nextCreator) {
        setCurrentCreatorId(null)
        setActiveMomentoId(null)
        setActiveIndex(0)
        return
      }

      setCurrentCreatorId(nextCreator.userId)
      setActiveMomentoId(nextCreator.momentos[0]?.id ?? null)
      setActiveIndex(0)
      return
    }

    setActiveIndex(nextIndex)
    setActiveMomentoId(activeMomentos[nextIndex].id)
  }, [activeIndex, activeMomentos, creatorMomentos, currentCreatorPosition])

  const prevMomento = useCallback(() => {
    if (activeMomentos.length === 0) return
    const prevIndex = activeIndex - 1
    if (prevIndex < 0) {
      const prevCreator = creatorMomentos[currentCreatorPosition - 1]
      if (!prevCreator) return

      const lastIndex = Math.max(prevCreator.momentos.length - 1, 0)
      setCurrentCreatorId(prevCreator.userId)
      setActiveMomentoId(prevCreator.momentos[lastIndex]?.id ?? null)
      setActiveIndex(lastIndex)
      return
    }
    setActiveIndex(prevIndex)
    setActiveMomentoId(activeMomentos[prevIndex].id)
  }, [activeIndex, activeMomentos, creatorMomentos, currentCreatorPosition])

  const markAsViewed = useCallback(
    async (momentoId: string) => {
      if (markingAsViewedRef.current.has(momentoId)) return

      const momento = momentos.find((item) => item.id === momentoId)
      if (!momento) return
      if (momento.hasViewed) return

      const creatorSequence = creatorMomentos.find((item) => item.userId === momento.userId)?.momentos ?? []
      const indexWithinCreator = creatorSequence.findIndex((item) => item.id === momentoId)
      const freeLimit = momento.dailyFreeCount ?? DEFAULT_FREE_VIEWS
      const isOwnMoment = user?.id === momento.userId
      const isFreeMoment = indexWithinCreator > -1 && indexWithinCreator < freeLimit
      const access = creatorAccess[momento.userId] ?? { freeViewsUsed: 0 }

      if (!isOwnMoment && momento.isLocked && !isCreatorUnlocked(momento.userId) && indexWithinCreator >= freeLimit) {
        return
      }

      markingAsViewedRef.current.add(momentoId)

      if (!isOwnMoment && isFreeMoment && !momento.hasViewed && access.freeViewsUsed < freeLimit) {
        updateCreatorAccess(momento.userId, (current) => ({
          ...current,
          freeViewsUsed: Math.min(freeLimit, current.freeViewsUsed + 1),
        }))
      }

      setMomentos((prev) =>
        prev.map((item) =>
          item.id === momentoId
            ? { ...item, hasViewed: true, viewCount: item.viewCount + 1 }
            : item
        )
      )

      try {
        const updated = await getDatabaseProvider().momentos.markViewed(momentoId)
        if (updated) {
          setMomentos((prev) => prev.map((item) => (item.id === momentoId ? updated : item)))
        }
      } catch (error) {
        console.error('[momentos] failed to mark as viewed', error)
      } finally {
        markingAsViewedRef.current.delete(momentoId)
      }
    },
    [creatorAccess, creatorMomentos, isCreatorUnlocked, momentos, updateCreatorAccess, user?.id]
  )

  const unlockCreatorMomentos = useCallback(
    (creatorId: string) => {
      updateCreatorAccess(creatorId, (current) => ({
        ...current,
        unlockedUntil: new Date(Date.now() + ACCESS_DURATION_MS).toISOString(),
      }))
    },
    [updateCreatorAccess]
  )

  const addMomento = useCallback(async (momentoData: NewMomento) => {
    try {
      const created = await getDatabaseProvider().momentos.create(momentoData)
      setMomentos((prev) => [created, ...prev])
      void loadMomentos()
      return
    } catch (error) {
      console.error('[momentos] failed to create momento', error)
      throw error
    }
  }, [loadMomentos])

  return (
    <MomentoContext.Provider
      value={{
        momentos,
        creatorMomentos,
        activeMomento,
        activeMomentos,
        activeIndex,
        currentCreatorId,
        currentCreatorPosition,
        totalCreators,
        setActiveMomento,
        openCreatorMomentos,
        nextMomento,
        prevMomento,
        markAsViewed,
        addMomento,
        canViewMomento,
        getRemainingFreeViews,
        unlockCreatorMomentos,
        isCreatorUnlocked,
      }}
    >
      {children}
    </MomentoContext.Provider>
  )
}

export function useMomentos() {
  const context = useContext(MomentoContext)
  if (!context) throw new Error('useMomentos must be used within MomentoProvider')
  return context
}
