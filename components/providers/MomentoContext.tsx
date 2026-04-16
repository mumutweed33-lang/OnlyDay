'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDatabaseProvider } from '@/lib/db'
import { MOCK_MOMENTOS } from '@/lib/db/mock-data'
import type { Momento, NewMomento } from '@/types/domain'

interface MomentoContextType {
  momentos: Momento[]
  activeMomento: Momento | null
  activeIndex: number
  freeViewsToday: number
  setActiveMomento: (momento: Momento | null, index: number) => void
  nextMomento: () => void
  prevMomento: () => void
  markAsViewed: (momentoId: string) => Promise<void>
  addMomento: (momento: NewMomento) => Promise<void>
}

const MomentoContext = createContext<MomentoContextType | undefined>(undefined)

export function MomentoProvider({ children }: { children: React.ReactNode }) {
  const [momentos, setMomentos] = useState<Momento[]>(MOCK_MOMENTOS)
  const [activeMomentoId, setActiveMomentoId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [freeViewsToday, setFreeViewsToday] = useState(3)

  const activeMomento = useMemo(
    () => momentos.find((momento) => momento.id === activeMomentoId) ?? null,
    [activeMomentoId, momentos]
  )

  useEffect(() => {
    async function loadMomentos() {
      try {
        const nextMomentos = await getDatabaseProvider().momentos.listActive()
        setMomentos(nextMomentos)
      } catch (error) {
        console.error('[momentos] failed to load momentos', error)
        setMomentos(MOCK_MOMENTOS)
      }
    }

    void loadMomentos()
  }, [])

  const setActiveMomento = useCallback((momento: Momento | null, index: number) => {
    setActiveMomentoId(momento?.id ?? null)
    setActiveIndex(index)
  }, [])

  const nextMomento = useCallback(() => {
    const nextIndex = activeIndex + 1
    if (nextIndex >= momentos.length) {
      setActiveMomentoId(null)
      return
    }

    const nextMomentoItem = momentos[nextIndex]
    setActiveMomentoId(nextMomentoItem.id)
    setActiveIndex(nextIndex)

    if (!nextMomentoItem.isLocked || freeViewsToday > 0) {
      setFreeViewsToday((prev) => Math.max(0, prev - 1))
    }
  }, [activeIndex, freeViewsToday, momentos])

  const prevMomento = useCallback(() => {
    const prevIndex = activeIndex - 1
    if (prevIndex < 0) return
    setActiveMomentoId(momentos[prevIndex].id)
    setActiveIndex(prevIndex)
  }, [activeIndex, momentos])

  const markAsViewed = useCallback(async (momentoId: string) => {
    try {
      const updated = await getDatabaseProvider().momentos.markViewed(momentoId)
      if (updated) {
        setMomentos((prev) => prev.map((momento) => (momento.id === momentoId ? updated : momento)))
        return
      }
    } catch (error) {
      console.error('[momentos] failed to mark as viewed', error)
    }

    setMomentos((prev) =>
      prev.map((momento) =>
        momento.id === momentoId
          ? { ...momento, hasViewed: true, viewCount: momento.viewCount + 1 }
          : momento
      )
    )
  }, [])

  const addMomento = useCallback(async (momentoData: NewMomento) => {
    try {
      const created = await getDatabaseProvider().momentos.create(momentoData)
      setMomentos((prev) => [created, ...prev])
      return
    } catch (error) {
      console.error('[momentos] failed to create momento', error)
    }

    const fallbackMomento: Momento = {
      ...momentoData,
      id: `mom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewCount: 0,
    }
    setMomentos((prev) => [fallbackMomento, ...prev])
  }, [])

  return (
    <MomentoContext.Provider
      value={{
        momentos,
        activeMomento,
        activeIndex,
        freeViewsToday,
        setActiveMomento,
        nextMomento,
        prevMomento,
        markAsViewed,
        addMomento,
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
