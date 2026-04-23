'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from '@/components/ui/BottomNav'
import { FeedPage } from '@/components/feed/FeedPage'
import { ExplorePage } from '@/components/explore/ExplorePage'
import { TrendPage } from '@/components/explore/TrendPage'
import { ChatPage } from '@/components/chat/ChatPage'
import { EmpireHub } from '@/components/empire/EmpireHub'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { PublicProfilePage } from '@/components/profile/PublicProfilePage'
import { CreatePostModal } from '@/components/feed/CreatePostModal'
import { useMessages } from '@/components/providers/MessageContext'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import type { PublicProfile } from '@/types/domain'

const NAV_STORAGE_KEY = 'onlyday_active_tab'
const persistentTabs = new Set(['feed', 'explore', 'chat', 'empire', 'profile'])

function getInitialTab() {
  if (typeof window === 'undefined') return 'feed'
  const saved = window.localStorage.getItem(NAV_STORAGE_KEY)
  return saved && persistentTabs.has(saved) ? saved : 'feed'
}

export function MainApp() {
  const { user } = useUser()
  const { posts } = usePosts()
  const { openConversationForProfile } = useMessages()
  const { getKnownProfiles } = useSocial()
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [returnTab, setReturnTab] = useState('feed')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<PublicProfile | null>(null)
  const [exploreSeedQuery, setExploreSeedQuery] = useState('')
  const [selectedTrendTag, setSelectedTrendTag] = useState('')

  useEffect(() => {
    if (persistentTabs.has(activeTab)) {
      window.localStorage.setItem(NAV_STORAGE_KEY, activeTab)
    }
  }, [activeTab])

  const handleSetTab = useCallback((tab: string) => {
    if (tab === 'create') {
      setShowCreateModal(true)
    } else {
      if (tab !== 'public-profile') {
        setSelectedProfile(null)
        setSelectedTrendTag('')
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

    const knownProfile = getKnownProfiles().find(
      (item) => item.id === profile.id || item.username === profile.username
    )

    setSelectedProfile({
      ...profile,
      ...knownProfile,
      coverImage: profile.coverImage || knownProfile?.coverImage,
      bio: profile.bio || knownProfile?.bio,
    })
    setReturnTab(activeTab === 'public-profile' ? returnTab : activeTab)
    setActiveTab('public-profile')
  }, [activeTab, getKnownProfiles, returnTab, user?.id, user?.username])

  const handleOpenTag = useCallback((tag: string) => {
    setSelectedProfile(null)
    setSelectedTrendTag(tag)
    setReturnTab(activeTab === 'public-profile' ? returnTab : activeTab)
    setActiveTab('explore')
  }, [activeTab, returnTab])

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
    explore: selectedTrendTag ? (
      <TrendPage
        tag={selectedTrendTag}
        onOpenProfile={handleOpenPublicProfile}
        onOpenTag={handleOpenTag}
        onCreatePost={() => setShowCreateModal(true)}
        onBack={() => {
          setSelectedTrendTag('')
          if (returnTab === 'explore') {
            setExploreSeedQuery('')
            setActiveTab('explore')
          } else {
            setActiveTab(returnTab)
          }
        }}
      />
    ) : (
      <ExplorePage
        onOpenProfile={handleOpenPublicProfile}
        onOpenTag={handleOpenTag}
        initialQuery={exploreSeedQuery}
      />
    ),
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
    <div className="min-h-screen bg-[#020204] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,58,237,0.22),transparent_34%),radial-gradient(circle_at_100%_20%,rgba(168,85,247,0.08),transparent_26%)]" />
      <div className="relative mx-auto min-h-screen max-w-[430px] overflow-hidden border-x border-white/6 bg-[#050508] shadow-[0_0_80px_rgba(0,0,0,0.5)]">
      <div className="pb-24">
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

      <BottomNav activeTab={activeTab} setActiveTab={handleSetTab} />

      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
