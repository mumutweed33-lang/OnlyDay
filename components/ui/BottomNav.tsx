'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Home, MessageCircle, PlusCircle, Search, User } from 'lucide-react'
import { useMessages } from '@/components/providers/MessageContext'

interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { conversations } = useMessages()

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'create', icon: PlusCircle, label: 'Criar', special: true },
    { id: 'chat', icon: MessageCircle, label: 'Chat', badge: totalUnread > 0 ? totalUnread : null },
    { id: 'profile', icon: User, label: 'Perfil' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
      <div className="mx-auto max-w-[430px] rounded-[26px] border border-white/10 bg-[rgba(3,3,6,0.92)] px-2 py-2 shadow-[0_-18px_70px_rgba(0,0,0,0.46)] backdrop-blur-3xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.86 }}
              className="relative flex min-w-[58px] flex-col items-center gap-1 px-2 py-1.5"
            >
              {tab.special ? (
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-violet-600 shadow-[0_16px_36px_rgba(124,58,237,0.35)]"
                >
                  <tab.icon className="h-5 w-5 text-white" />
                </motion.div>
              ) : (
                <>
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                      activeTab === tab.id ? 'bg-violet-500/12 ring-1 ring-violet-300/18' : 'bg-transparent'
                    }`}
                  >
                    <tab.icon
                      className={`h-5 w-5 transition-all ${
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
