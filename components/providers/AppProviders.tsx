'use client'

import React from 'react'
import { UserProvider, useUser } from '@/components/providers/UserContext'
import { PostProvider, usePosts } from '@/components/providers/PostContext'
import { MessageProvider, useMessages } from '@/components/providers/MessageContext'
import { MomentoProvider, useMomentos } from '@/components/providers/MomentoContext'
import { SocialProvider, useSocial } from '@/components/providers/SocialContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
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
