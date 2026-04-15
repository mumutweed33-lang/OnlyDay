'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Send, Lock, BadgeCheck, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import { useMomentos } from '@/components/providers/MomentoContext'

export function MomentoViewer() {
  const { activeMomento, activeIndex, momentos, setActiveMomento, nextMomento, prevMomento, markAsViewed, freeViewsToday } = useMomentos()
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    if (!activeMomento || paused) return
    if (activeMomento.isLocked && freeViewsToday <= 0) {
      setShowPaywall(true)
      return
    }

    markAsViewed(activeMomento.id)
    setProgress(0)
    const duration = activeMomento.duration || 5000
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          nextMomento()
          return 100
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [activeMomento?.id, paused])

  const handleClose = useCallback(() => {
    setActiveMomento(null, 0)
    setShowPaywall(false)
  }, [setActiveMomento])

  if (!activeMomento) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-dark flex flex-col"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 flex gap-1">
        {momentos.map((m, i) => (
          <div key={m.id} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: i < activeIndex ? '100%' : '0%' }}
              animate={{
                width: i < activeIndex ? '100%' : i === activeIndex ? `${progress}%` : '0%'
              }}
              transition={{ duration: 0 }}
            />
          </div>
        ))}
      </div>

      {/* Navigation areas */}
      <button
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
        onClick={(e) => { e.stopPropagation(); prevMomento() }}
      />
      <button
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
        onClick={(e) => { e.stopPropagation(); nextMomento() }}
      />

      {/* Media */}
      <div className="absolute inset-0">
        <img
          src={activeMomento.media}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: activeMomento.isLocked && freeViewsToday <= 0 ? 'blur(30px)' : 'none' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Blur background effect */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl scale-110"
        style={{ backgroundImage: `url(${activeMomento.media})`, backgroundSize: 'cover' }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={activeMomento.userAvatar}
              alt={activeMomento.userName}
              className="w-10 h-10 rounded-full border-2 border-white/60"
            />
            {activeMomento.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                <BadgeCheck className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{activeMomento.userName}</div>
            <div className="text-xs text-white/60">{activeMomento.userUsername}</div>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full glass flex items-center justify-center border border-white/20"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Paywall overlay */}
      {showPaywall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-dark/70 backdrop-blur-sm"
        >
          <Lock className="w-16 h-16 text-violet-400 mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Vault Premium</h3>
          <p className="text-white/60 text-center text-sm mb-6">
            Você usou seus 3 Momentos gratuitos hoje.
            Desbloqueie via Pix para continuar.
          </p>
          {activeMomento.price && (
            <div className="text-3xl font-black text-violet-400 mb-6">
              R$ {activeMomento.price.toFixed(2)}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-8 py-3 rounded-2xl font-bold text-white flex items-center gap-2 mb-3"
          >
            <DollarSign className="w-5 h-5" />
            Pagar via Pix
          </motion.button>
          <button onClick={handleClose} className="text-white/40 text-sm">Voltar ao Feed</button>
        </motion.div>
      )}

      {/* Bottom actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.8 }}
              className="w-10 h-10 rounded-full glass flex items-center justify-center border border-white/20"
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.button>
            <div className="flex-1 flex items-center gap-2">
              <input
                placeholder="Responder..."
                className="flex-1 glass rounded-full px-4 py-2 text-white/90 placeholder-white/30 text-sm outline-none border border-white/10 bg-black/20"
              />
              <motion.button
                whileTap={{ scale: 0.8 }}
                className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 text-white/40 text-xs">
          <span>{activeMomento.viewCount.toLocaleString('pt-BR')} visualizações</span>
        </div>
      </div>
    </motion.div>
  )
}