'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Lock } from 'lucide-react'
import { useMomentos } from '@/components/providers/MomentoContext'
import { useUser } from '@/components/providers/UserContext'

export function MomentosBar() {
  const { momentos, setActiveMomento } = useMomentos()
  const { user } = useUser()

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {/* Add Momento Button */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-2xl glass border-2 border-dashed border-violet-500/40 flex items-center justify-center hover:border-violet-500/70 transition-colors"
          >
            <Plus className="w-6 h-6 text-violet-400" />
          </motion.button>
          <span className="text-[10px] text-white/40">Seu Momento</span>
        </div>

        {/* Momentos */}
        {momentos.map((momento, index) => (
          <motion.div
            key={momento.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveMomento(momento, index)}
              className="relative"
            >
              {/* Ring gradient */}
              <div className={`w-16 h-16 rounded-2xl p-[2px] ${
                momento.hasViewed 
                  ? 'bg-white/10' 
                  : 'bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500'
              }`}>
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-dark-200">
                  <img
                    src={momento.userAvatar}
                    alt={momento.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Live indicator */}
              {!momento.hasViewed && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center border-2 border-dark">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}

              {/* Lock indicator */}
              {momento.isLocked && (
                <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-dark/80 rounded-full flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-violet-400" />
                </div>
              )}
            </motion.button>
            <span className="text-[10px] text-white/60 max-w-[60px] truncate text-center">
              {momento.userName.split(' ')[0]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}