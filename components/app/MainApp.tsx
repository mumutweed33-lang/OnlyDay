'use client'

import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '@/components/ui/BottomNav'
import { FeedPage } from '@/components/feed/FeedPage'
import { ExplorePage } from '@/components/explore/ExplorePage'
import { ChatPage } from '@/components/chat/ChatPage'
import { EmpireHub } from '@/components/empire/EmpireHub'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { CreatePostModal } from '@/components/feed/CreatePostModal'
import { useUser } from '@/components/providers/UserContext'

export function MainApp() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('feed')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleSetTab = useCallback((tab: string) => {
    if (tab === 'create') {
      setShowCreateModal(true)
    } else {
      setActiveTab(tab)
    }
  }, [])

  const pages: Record<string, React.ReactNode> = {
    feed: <FeedPage />,
    explore: <ExplorePage />,
    chat: <ChatPage />,
    empire: <EmpireHub />,
    profile: <ProfilePage />,
  }

  return (
    <div className="min-h-screen bg-dark max-w-lg mx-auto relative">
      {/* Main content */}
      <div className="pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {pages[activeTab] || pages.feed}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={handleSetTab} />

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}