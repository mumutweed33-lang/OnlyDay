'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDatabaseProvider } from '@/lib/db'
import { queueOdRefresh, trackOdEvent } from '@/lib/od-core/signal'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Conversation, ChatMessage as Message, NewChatMessage } from '@/types/domain'
import type { PublicProfile } from '@/types/domain'
import { useUser } from '@/components/providers/UserContext'

interface MessageContextType {
  conversations: Conversation[]
  activeConversation: Conversation | null
  setActiveConversation: (conv: Conversation | null) => void
  openConversationForProfile: (profile: PublicProfile) => void
  sendMessage: (convId: string, message: NewChatMessage) => Promise<void>
  placeBid: (convId: string, amount: number) => Promise<void>
  markAsRead: (convId: string) => Promise<void>
  updateIntimacy: (convId: string, points: number) => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

interface OdConversationRankRow {
  entity_id: string
  final_score: number | null
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  )

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([])
      return
    }

    try {
      const nextConversations = await getDatabaseProvider().messages.listConversations(user.id)
      let rankedIds: string[] = []

      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('od_rank_scores')
          .select('entity_id, final_score')
          .eq('viewer_profile_id', user.id)
          .in('surface', ['chat_vip', 'auction'])
          .eq('entity_type', 'conversation')
          .order('final_score', { ascending: false })
          .limit(80)

        if (!error) {
          rankedIds = ((data as OdConversationRankRow[]) ?? []).map((row) => row.entity_id)
        } else {
          console.warn('[od-core] chat ranking unavailable, using conversation recency', error.message)
        }
      } catch (rankingError) {
        console.error('[od-core] failed to load chat ranking', rankingError)
      }

      const withFallback = nextConversations
      if (rankedIds.length === 0) {
        setConversations(withFallback)
        return
      }

      const positionById = new Map(rankedIds.map((id, index) => [id, index]))
      const sortedConversations = [...withFallback].sort((left, right) => {
        const leftRank = positionById.get(left.id)
        const rightRank = positionById.get(right.id)

        if (leftRank === undefined && rightRank === undefined) {
          return new Date(right.lastMessageTime).getTime() - new Date(left.lastMessageTime).getTime()
        }
        if (leftRank === undefined) return 1
        if (rightRank === undefined) return -1
        return leftRank - rightRank
      })

      setConversations(sortedConversations)
    } catch (error) {
      console.error('[messages] failed to load conversations', error)
      setConversations([])
    }
  }, [user?.id])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const setActiveConversation = useCallback((conv: Conversation | null) => {
    if (conv && user?.id) {
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: conv.userId,
        conversationId: conv.id,
        surface: 'chat_vip',
        eventType: 'chat_open',
      })
      queueOdRefresh(user.id)
    }
    setActiveConversationId(conv?.id ?? null)
  }, [user?.id])

  const openConversationForProfile = useCallback(
    (profile: PublicProfile) => {
      if (!user) return

      const existingConversation = conversations.find(
        (conversation) =>
          conversation.userId === profile.id || conversation.userUsername === profile.username
      )

      if (existingConversation) {
        if (user?.id) {
          void trackOdEvent({
            actorProfileId: user.id,
            targetProfileId: profile.id,
            conversationId: existingConversation.id,
            surface: 'chat_vip',
            eventType: 'chat_open',
          })
          queueOdRefresh(user.id)
        }
        setActiveConversationId(existingConversation.id)
        return
      }

      void (async () => {
        try {
          const nextConversation = await getDatabaseProvider().messages.createConversation(user, profile)
          setConversations((prev) => {
            const alreadyExists = prev.some((conversation) => conversation.id === nextConversation.id)
            return alreadyExists ? prev : [nextConversation, ...prev]
          })
          setActiveConversationId(nextConversation.id)
          void getDatabaseProvider()
            .notifications.create({
              recipientId: profile.id,
              actorId: user.id,
              type: 'message',
              title: `${user.name} iniciou uma conversa`,
              description: 'Toque para abrir o chat.',
              conversationId: nextConversation.id,
            })
            .catch((error) => console.error('[notifications] failed to notify conversation', error))
          void trackOdEvent({
            actorProfileId: user.id,
            targetProfileId: profile.id,
            conversationId: nextConversation.id,
            surface: 'chat_vip',
            eventType: 'chat_open',
            metadata: { createdConversation: true },
          })
          queueOdRefresh(user.id)
        } catch (error) {
          console.error('[messages] failed to create conversation', error)
        }
      })()
    },
    [conversations, user]
  )

  const patchConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) =>
      prev.map((item) => (item.id === conversation.id ? conversation : item))
    )
  }, [])

  const sendMessage = useCallback(
    async (convId: string, messageData: NewChatMessage) => {
      if (user?.id) {
        const targetConversation = conversations.find((conversation) => conversation.id === convId)
        void trackOdEvent({
          actorProfileId: user.id,
          targetProfileId: targetConversation?.userId ?? messageData.receiverId,
          conversationId: convId,
          surface: 'chat_vip',
          eventType: 'chat_reply',
          metadata: { type: messageData.type, locked: !!messageData.isLocked },
        })
        queueOdRefresh(user.id)
      }
      try {
        const updated = await getDatabaseProvider().messages.sendMessage(convId, messageData)
        if (updated) {
          patchConversation(updated)
          if (user?.id && messageData.receiverId !== user.id) {
            void getDatabaseProvider()
              .notifications.create({
                recipientId: messageData.receiverId,
                actorId: user.id,
                type: 'message',
                title: `${user.name} enviou uma mensagem`,
                description: messageData.content || 'Voce recebeu uma nova mensagem.',
                conversationId: convId,
              })
              .catch((error) => console.error('[notifications] failed to notify message', error))
          }
          return
        }
      } catch (error) {
        console.error('[messages] failed to send message', error)
        throw error
      }
    },
    [conversations, patchConversation, user?.id]
  )

  const placeBid = useCallback(
    async (convId: string, amount: number) => {
      if (!user?.id) return
      const targetConversation = conversations.find((conversation) => conversation.id === convId)
      void trackOdEvent({
        actorProfileId: user.id,
        targetProfileId: targetConversation?.userId,
        conversationId: convId,
        surface: 'auction',
        eventType: 'auction_bid',
        eventValue: amount,
      })
      queueOdRefresh(user.id)

      try {
        const updated = await getDatabaseProvider().messages.placeBid(convId, user.id, amount)
        if (updated) {
          patchConversation(updated)
          return
        }
      } catch (error) {
        console.error('[messages] failed to place bid', error)
        throw error
      }
    },
    [conversations, patchConversation, user?.id]
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
        openConversationForProfile,
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
