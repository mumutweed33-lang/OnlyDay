'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDatabaseProvider } from '@/lib/db'
import { MOCK_CONVERSATIONS } from '@/lib/db/mock-data'
import type { Conversation, ChatMessage as Message, NewChatMessage } from '@/types/domain'
import { useUser } from '@/components/providers/UserContext'

interface MessageContextType {
  conversations: Conversation[]
  activeConversation: Conversation | null
  setActiveConversation: (conv: Conversation | null) => void
  sendMessage: (convId: string, message: NewChatMessage) => Promise<void>
  placeBid: (convId: string, amount: number) => Promise<void>
  markAsRead: (convId: string) => Promise<void>
  updateIntimacy: (convId: string, points: number) => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  )

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations(MOCK_CONVERSATIONS)
      return
    }

    try {
      const nextConversations = await getDatabaseProvider().messages.listConversations(user.id)
      setConversations(nextConversations)
    } catch (error) {
      console.error('[messages] failed to load conversations', error)
      setConversations(MOCK_CONVERSATIONS)
    }
  }, [user?.id])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const setActiveConversation = useCallback((conv: Conversation | null) => {
    setActiveConversationId(conv?.id ?? null)
  }, [])

  const patchConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) =>
      prev.map((item) => (item.id === conversation.id ? conversation : item))
    )
  }, [])

  const sendMessage = useCallback(
    async (convId: string, messageData: NewChatMessage) => {
      try {
        const updated = await getDatabaseProvider().messages.sendMessage(convId, messageData)
        if (updated) {
          patchConversation(updated)
          return
        }
      } catch (error) {
        console.error('[messages] failed to send message', error)
      }

      const fallbackMessage: Message = {
        ...messageData,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      }
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id !== convId
            ? conversation
            : {
                ...conversation,
                messages: [...conversation.messages, fallbackMessage],
                lastMessage: messageData.content,
                lastMessageTime: fallbackMessage.timestamp,
              }
        )
      )
    },
    [patchConversation]
  )

  const placeBid = useCallback(
    async (convId: string, amount: number) => {
      if (!user?.id) return

      try {
        const updated = await getDatabaseProvider().messages.placeBid(convId, user.id, amount)
        if (updated) {
          patchConversation(updated)
          return
        }
      } catch (error) {
        console.error('[messages] failed to place bid', error)
      }

      const fallbackMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        receiverId: convId,
        content: `Lance de R$ ${amount.toFixed(2)} enviado!`,
        type: 'auction',
        auctionBid: amount,
        auctionStatus: 'pending',
        timestamp: new Date().toISOString(),
        isRead: false,
      }
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id !== convId
            ? conversation
            : {
                ...conversation,
                messages: [...conversation.messages, fallbackMessage],
                auctionActive: true,
                currentBid: amount,
                lastMessage: `Lance: R$ ${amount.toFixed(2)}`,
                lastMessageTime: fallbackMessage.timestamp,
              }
        )
      )
    },
    [patchConversation, user?.id]
  )

  const markAsRead = useCallback(
    async (convId: string) => {
      if (!user?.id) return

      try {
        const updated = await getDatabaseProvider().messages.markAsRead(convId, user.id)
        if (updated) {
          patchConversation(updated)
          return
        }
      } catch (error) {
        console.error('[messages] failed to mark conversation as read', error)
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id !== convId
            ? conversation
            : {
                ...conversation,
                unreadCount: 0,
                messages: conversation.messages.map((message) => ({ ...message, isRead: true })),
              }
        )
      )
    },
    [patchConversation, user?.id]
  )

  const updateIntimacy = useCallback(
    async (convId: string, points: number) => {
      try {
        await getDatabaseProvider().messages.updateIntimacy(convId, points)
      } catch (error) {
        console.error('[messages] failed to update intimacy', error)
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id !== convId
            ? conversation
            : {
                ...conversation,
                intimacyScore: Math.min(100, Math.max(0, conversation.intimacyScore + points)),
              }
        )
      )
    },
    []
  )

  return (
    <MessageContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        sendMessage,
        placeBid,
        markAsRead,
        updateIntimacy,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (!context) throw new Error('useMessages must be used within MessageProvider')
  return context
}

export type { Conversation, Message }
