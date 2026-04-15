'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Home, Search, PlusCircle, MessageCircle, User, BarChart3 } from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'
import { useMessages } from '@/components/providers/MessageContext'

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
    { id: user?.isCreator ? 'empire' : 'profile', icon: user?.isCreator ? BarChart3 : User, label: user?.isCreator ? 'Empire' : 'Perfil' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="glass border-t border-white/5 px-2 py-2">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.85 }}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2"
            >
              {tab.special ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center neon-purple"
                >
                  <tab.icon className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <>
                  <div className="relative">
                    <tab.icon
                      className={`w-6 h-6 transition-all ${
                        activeTab === tab.id ? 'text-violet-400' : 'text-white/40'
                      }`}
                      strokeWidth={activeTab === tab.id ? 2.5 : 1.5}
                    />
                    {tab.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] transition-colors ${activeTab === tab.id ? 'text-violet-400' : 'text-white/30'}`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-violet-500 rounded-full"
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