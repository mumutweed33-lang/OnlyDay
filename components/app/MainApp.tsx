'use client'

import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '@/components/ui/BottomNav'
import { FeedPage } from '@/components/feed/FeedPage'
import { ExplorePage } from '@/components/explore/ExplorePage'
import { ChatPage } from '@/components/chat/ChatPage'
import { EmpireHub } from '@/components/empire/EmpireHub'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { PublicProfilePage } from '@/components/profile/PublicProfilePage'
import { CreatePostModal } from '@/components/feed/CreatePostModal'
import { useMessages } from '@/components/providers/MessageContext'
import { usePosts } from '@/components/providers/PostContext'
import { useUser } from '@/components/providers/UserContext'
import type { PublicProfile } from '@/types/domain'

export function MainApp() {
  const { user } = useUser()
  const { posts } = usePosts()
  const { openConversationForProfile } = useMessages()
  const [activeTab, setActiveTab] = useState('feed')
  const [returnTab, setReturnTab] = useState('feed')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null)
  const [exploreSeedQuery, setExploreSeedQuery] = useState('')

  const handleSetTab = useCallback((tab: string) => {
    if (tab === 'create') {
      setShowCreateModal(true)
    } else {
      if (tab !== 'public-profile') {
        setSelectedProfile(null)
        setReturnTab(tab)
      }
      setActiveTab(tab)
    }
  }, [])

  const handleOpenPublicProfile = useCallback((profile: PublicProfile) => {
    const isOwnProfile =
      (user?.id && user.id === profile.id) ||
      (user?.username && user.username === profile.username)

    if (isOwnProfile) {
      setSelectedProfile(null)
      setActiveTab('profile')
      setReturnTab('profile')
      return
    }

    setSelectedProfile(profile)
    setReturnTab(activeTab === 'public-profile' ? returnTab : activeTab)
    setActiveTab('public-profile')
  }, [activeTab, returnTab, user?.id, user?.username])

  const handleOpenTag = useCallback((tag: string) => {
    setSelectedProfile(null)
    setReturnTab('explore')
    setExploreSeedQuery(tag)
    setActiveTab('explore')
  }, [])

  const handleMessageProfile = useCallback(
    (profile: PublicProfile) => {
      openConversationForProfile(profile)
      setSelectedProfile(null)
      setReturnTab('chat')
      setActiveTab('chat')
    },
    [openConversationForProfile]
  )

  const pages: Record<string, React.ReactNode> = {
    feed: <FeedPage onOpenProfile={handleOpenPublicProfile} onOpenTag={handleOpenTag} />,
    explore: <ExplorePage onOpenProfile={handleOpenPublicProfile} initialQuery={exploreSeedQuery} />,
    chat: <ChatPage onOpenProfile={handleOpenPublicProfile} />,
    empire: <EmpireHub />,
    profile: <ProfilePage onOpenDashboard={() => setActiveTab('empire')} onOpenTag={handleOpenTag} />,
    'public-profile': selectedProfile ? (
      <PublicProfilePage
        profile={selectedProfile}
        posts={posts}
        onMessage={handleMessageProfile}
        onOpenTag={handleOpenTag}
        viewerId={user?.id}
        onBack={() => {
          setSelectedProfile(null)
          setActiveTab(returnTab)
        }}
      />
    ) : null,
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
