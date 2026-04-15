'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Home, MessageCircle, PlusCircle, Search, User } from 'lucide-react'
import { useMessages } from '@/components/providers/MessageContext'
import { useUser } from '@/components/providers/UserContext'

interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { user } = useUser()
  const { conversations } = useMessages()

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'create', icon: PlusCircle, label: 'Criar', special: true },
    { id: 'chat', icon: MessageCircle, label: 'Chat', badge: totalUnread > 0 ? totalUnread : null },
    {
      id: user?.isCreator ? 'empire' : 'profile',
      icon: user?.isCreator ? BarChart3 : User,
      label: user?.isCreator ? 'Empire' : 'Perfil',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom px-3 pb-3">
      <div className="mx-auto max-w-lg rounded-[28px] border border-white/10 bg-[rgba(12,8,24,0.82)] px-2 py-2 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.86 }}
              className="relative flex min-w-[60px] flex-col items-center gap-1 px-3 py-2"
            >
              {tab.special ? (
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] shadow-[0_18px_40px_rgba(124,58,237,0.35)]"
                >
                  <tab.icon className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <>
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                      activeTab === tab.id ? 'bg-white/10 ring-1 ring-violet-300/20' : 'bg-transparent'
                    }`}
                  >
                    <tab.icon
                      className={`h-6 w-6 transition-all ${
                        activeTab === tab.id ? 'text-violet-300' : 'text-white/40'
                      }`}
                      strokeWidth={activeTab === tab.id ? 2.5 : 1.6}
                    />
                    {tab.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white shadow-[0_0_18px_rgba(124,58,237,0.45)]">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${activeTab === tab.id ? 'text-violet-200' : 'text-white/30'}`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,rgba(168,85,247,0),rgba(196,181,253,1),rgba(168,85,247,0))]"
                    />
                  )}
                </>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
