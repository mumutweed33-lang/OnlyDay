'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Lock, Sparkles, X } from 'lucide-react'
import { useMomentos } from '@/components/providers/MomentoContext'
import { useUser } from '@/components/providers/UserContext'
import type { PublicProfile } from '@/types/domain'

interface MomentosBarProps {
  onOpenProfile?: (profile: PublicProfile) => void
}

export function MomentosBar({ onOpenProfile }: MomentosBarProps) {
  const { creatorMomentos, openCreatorMomentos, addMomento } = useMomentos()
  const { user } = useUser()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreateMoment = async () => {
    if (!user) return

    setCreating(true)
    try {
      await addMomento({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userUsername: user.username,
        userBio: user.bio,
        isVerified: user.isVerified,
        isCreator: user.isCreator,
        media: `https://picsum.photos/seed/${user.id}-${Date.now()}/720/1280`,
        mediaType: 'image',
        isLocked: false,
        duration: 5000,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      setShowCreateModal(false)
      window.setTimeout(() => openCreatorMomentos(user.id, 0), 250)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Add Momento Button */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateModal(true)}
            aria-label="Criar seu momento"
            className="w-16 h-16 rounded-2xl glass border-2 border-dashed border-violet-500/40 flex items-center justify-center hover:border-violet-500/70 transition-colors"
          >
            <Plus className="w-6 h-6 text-violet-400" />
          </motion.button>
          <span className="text-[10px] text-white/40">Seu Momento</span>
        </div>

        {/* Momentos */}
        {creatorMomentos.map((creator, index) => (
          <motion.div
            key={creator.userId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openCreatorMomentos(creator.userId, 0)}
              aria-label={`Abrir momentos de ${creator.userName}`}
              className="relative"
            >
              {/* Ring gradient */}
              <div className={`w-16 h-16 rounded-2xl p-[2px] ${
                creator.hasViewed 
                  ? 'bg-white/10' 
                  : 'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500'
              }`}>
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-dark-200">
                  <img
                    src={creator.userAvatar}
                    alt={creator.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Live indicator */}
              {!creator.hasViewed && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center border-2 border-dark">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}

              {/* Lock indicator */}
              {creator.remainingFreeViews <= 0 && !creator.isUnlocked && (
                <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-dark/80 rounded-full flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-violet-400" />
                </div>
              )}
            </motion.button>
            <div className="flex max-w-[76px] flex-col items-center">
              <button
                onClick={() =>
                  onOpenProfile?.({
                    id: creator.userId,
                    name: creator.userName,
                    username: creator.userUsername,
                    avatar: creator.userAvatar,
                    bio: creator.userBio,
                    isVerified: creator.isVerified,
                    isCreator: creator.isCreator,
                  })
                }
                aria-label={`Abrir perfil de ${creator.userName}`}
                className="text-[10px] text-white/60 max-w-[60px] truncate text-center"
              >
                {creator.userName.split(' ')[0]}
              </button>
              <span className="text-[9px] text-white/30">
                {creator.isUnlocked
                  ? '24h liberado'
                  : `${creator.remainingFreeViews} grátis`}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">Publicar momento</h3>
                <p className="text-xs text-white/40">Criamos um rascunho visual para você testar agora</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} aria-label="Fechar publicação de momento" className="text-white/40">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-violet-300" />
                Seu momento de teste
              </div>
              <p className="text-xs leading-relaxed text-white/55">
                Vamos publicar um momento rápido no seu perfil para destravar esse fluxo e já abrir no viewer.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/70"
              >
                Voltar
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => void handleCreateMoment()}
                disabled={creating}
                className="rounded-2xl btn-primary py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {creating ? 'Publicando...' : 'Publicar agora'}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
