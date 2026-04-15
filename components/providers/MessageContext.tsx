'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'media' | 'auction' | 'location' | 'sticker'
  mediaUrl?: string
  isLocked?: boolean
  price?: number
  auctionBid?: number
  auctionStatus?: 'pending' | 'accepted' | 'rejected'
  timestamp: string
  isRead: boolean
}

export interface Conversation {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userUsername: string
  isVerified: boolean
  isPremium: boolean
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  intimacyScore: number
  isOnline: boolean
  messages: Message[]
  auctionActive?: boolean
  currentBid?: number
}

interface MessageContextType {
  conversations: Conversation[]
  activeConversation: Conversation | null
  setActiveConversation: (conv: Conversation | null) => void
  sendMessage: (convId: string, message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void
  placeBid: (convId: string, amount: number) => void
  markAsRead: (convId: string) => void
  updateIntimacy: (convId: string, points: number) => void
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    userId: 'creator-001',
    userName: 'Luna Estrela',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna&backgroundColor=7C3AED',
    userUsername: '@lunaestela',
    isVerified: true,
    isPremium: true,
    lastMessage: 'Amei sua mensagem! 💜',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 2,
    intimacyScore: 73,
    isOnline: true,
    messages: [
      {
        id: 'msg-001',
        senderId: 'creator-001',
        receiverId: 'user-001',
        content: 'Oi! Obrigada por assinar meu plano Diamond! 💜',
        type: 'text',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-002',
        senderId: 'user-001',
        receiverId: 'creator-001',
        content: 'Seu conteúdo é incrível! Quando vem o próximo?',
        type: 'text',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-003',
        senderId: 'creator-001',
        receiverId: 'user-001',
        content: 'Amei sua mensagem! 💜',
        type: 'text',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false,
      },
      {
        id: 'msg-004',
        senderId: 'creator-001',
        receiverId: 'user-001',
        content: 'Conteúdo exclusivo para você!',
        type: 'media',
        mediaUrl: 'https://picsum.photos/seed/locked1/400/400',
        isLocked: true,
        price: 19.90,
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        isRead: false,
      },
    ],
  },
  {
    id: 'conv-002',
    userId: 'creator-002',
    userName: 'Rafael Ouro',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafael&backgroundColor=6D28D9',
    userUsername: '@rafaelouro',
    isVerified: true,
    isPremium: true,
    lastMessage: 'Vou lançar algo especial essa semana!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    intimacyScore: 45,
    isOnline: false,
    messages: [
      {
        id: 'msg-005',
        senderId: 'creator-002',
        receiverId: 'user-001',
        content: 'Vou lançar algo especial essa semana!',
        type: 'text',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: true,
      },
    ],
  },
]

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('onlyday_conversations')
      setConversations(saved ? JSON.parse(saved) : MOCK_CONVERSATIONS)
    } catch (e) {
      setConversations(MOCK_CONVERSATIONS)
    }
  }, [])

  const setActiveConversation = useCallback((conv: Conversation | null) => {
    setActiveConversationState(conv)
  }, [])

  const sendMessage = useCallback((convId: string, messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const newMessage: Message = {
      ...messageData,
      id: 'msg-' + Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false,
    }
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== convId) return conv
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageData.content,
          lastMessageTime: newMessage.timestamp,
        }
      })
      try { localStorage.setItem('onlyday_conversations', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
    setActiveConversationState(prev => {
      if (!prev || prev.id !== convId) return prev
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: messageData.content,
        lastMessageTime: newMessage.timestamp,
      }
    })
  }, [])

  const placeBid = useCallback((convId: string, amount: number) => {
    const bidMessage: Message = {
      id: 'msg-' + Date.now(),
      senderId: 'user-001',
      receiverId: convId,
      content: `Lance de R$ ${amount.toFixed(2)} enviado! 🔨`,
      type: 'auction',
      auctionBid: amount,
      auctionStatus: 'pending',
      timestamp: new Date().toISOString(),
      isRead: false,
    }
    setConversations(prev => {
      const updated = prev.map(conv => conv.id !== convId ? conv : {
        ...conv,
        messages: [...conv.messages, bidMessage],
        auctionActive: true,
        currentBid: amount,
        lastMessage: `Lance: R$ ${amount.toFixed(2)}`,
        lastMessageTime: bidMessage.timestamp,
      })
      try { localStorage.setItem('onlyday_conversations', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
  }, [])

  const markAsRead = useCallback((convId: string) => {
    setConversations(prev => {
      const updated = prev.map(conv => conv.id !== convId ? conv : { ...conv, unreadCount: 0 })
      try { localStorage.setItem('onlyday_conversations', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
  }, [])

  const updateIntimacy = useCallback((convId: string, points: number) => {
    setConversations(prev => {
      const updated = prev.map(conv => conv.id !== convId ? conv : {
        ...conv,
        intimacyScore: Math.min(100, conv.intimacyScore + points)
      })
      try { localStorage.setItem('onlyday_conversations', JSON.stringify(updated)) } catch (e) {}
      return updated
    })
  }, [])

  return (
    <MessageContext.Provider value={{
      conversations,
      activeConversation,
      setActiveConversation,
      sendMessage,
      placeBid,
      markAsRead,
      updateIntimacy,
    }}>
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (!context) throw new Error('useMessages must be used within MessageProvider')
  return context
}