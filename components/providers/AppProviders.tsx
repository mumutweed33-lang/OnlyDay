'use client'

import React, { useEffect } from 'react'
import { UserProvider, useUser } from '@/components/providers/UserContext'
import { PostProvider, usePosts } from '@/components/providers/PostContext'
import { MessageProvider, useMessages } from '@/components/providers/MessageContext'
import { MomentoProvider, useMomentos } from '@/components/providers/MomentoContext'
import { SocialProvider, useSocial } from '@/components/providers/SocialContext'
import {
  cleanupLegacyDemoStorage,
  clearLegacyUserStorageAfterRealAuth,
} from '@/lib/storage/legacy-demo-cleanup'

function RealAuthStorageCleanup() {
  const { isLoggedIn } = useUser()

  useEffect(() => {
    if (isLoggedIn) {
      clearLegacyUserStorageAfterRealAuth()
    }
  }, [isLoggedIn])

  return null
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    cleanupLegacyDemoStorage()
  }, [])

  return (
    <UserProvider>
      <RealAuthStorageCleanup />
      <PostProvider>
        <MessageProvider>
          <MomentoProvider>
            <SocialProvider>{children}</SocialProvider>
          </MomentoProvider>
        </MessageProvider>
      </PostProvider>
    </UserProvider>
  )
}

export { useUser, usePosts, useMessages, useMomentos, useSocial }
