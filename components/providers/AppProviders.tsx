'use client'

import React from 'react'
import { UserProvider, useUser } from '@/components/providers/UserContext'
import { PostProvider, usePosts } from '@/components/providers/PostContext'
import { MessageProvider, useMessages } from '@/components/providers/MessageContext'
import { MomentoProvider, useMomentos } from '@/components/providers/MomentoContext'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <PostProvider>
        <MessageProvider>
          <MomentoProvider>{children}</MomentoProvider>
        </MessageProvider>
      </PostProvider>
    </UserProvider>
  )
}

export { useUser, usePosts, useMessages, useMomentos }
