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
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-3">
      <div className="mx-auto max-w-[430px] rounded-[24px] border border-white/[0.08] bg-[rgba(10,10,16,0.86)] px-3 py-2.5 shadow-[0_-18px_70px_rgba(0,0,0,0.58)] backdrop-blur-3xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.86 }}
              className="relative flex min-w-[54px] flex-col items-center gap-1 px-2 py-1"
            >
              {tab.special ? (
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="flex h-14 w-14 -translate-y-1.5 items-center justify-center rounded-[16px] bg-[linear-gradient(180deg,#9F5CFF,#6D28D9)] shadow-[0_0_36px_rgba(139,92,246,0.62)]"
                >
                  <tab.icon className="h-8 w-8 text-white" strokeWidth={1.8} />
                </motion.div>
              ) : (
                <>
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                      activeTab === tab.id ? 'bg-violet-500/18 shadow-[0_0_26px_rgba(139,92,246,0.34)] ring-1 ring-violet-300/18' : 'bg-transparent'
                    }`}
                  >
                    <tab.icon
                      className={`h-6 w-6 transition-all ${
                        activeTab === tab.id ? 'text-white' : 'text-[#9CA3AF]'
                      }`}
                      strokeWidth={activeTab === tab.id ? 2.2 : 1.7}
                    />
                    {tab.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white shadow-[0_0_18px_rgba(124,58,237,0.45)]">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11.5px] font-medium transition-colors ${activeTab === tab.id ? 'text-white' : 'text-[#9CA3AF]'}`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-9 -translate-x-1/2 rounded-full bg-[#8B5CF6] shadow-[0_0_18px_rgba(139,92,246,0.8)]"
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
