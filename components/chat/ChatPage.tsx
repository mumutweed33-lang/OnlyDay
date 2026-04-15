'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Check, DollarSign, Gavel, Heart, Lock, Send, Smile, Sparkles, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Conversation, Message, useMessages } from '@/components/providers/MessageContext'
import { useUser } from '@/components/providers/UserContext'

const EMOJIS = [':)', '<3', 'wow', 'fire', 'vip', 'ok']

export function ChatPage() {
  const { conversations, activeConversation, setActiveConversation, markAsRead } = useMessages()

  if (activeConversation) {
    return <ConversationView conversation={activeConversation} />
  }

  return (
    <div className="min-h-screen bg-dark pb-28">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,4,12,0.84)] px-4 py-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Chat VIP</h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">relacionamento premium</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            <Sparkles className="h-3 w-3" />
            Premium
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {conversations.map((conv, i) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveConversation(conv)
              markAsRead(conv.id)
            }}
            className="flex cursor-pointer items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.045] px-4 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
          >
            <div className="relative flex-shrink-0">
              <img src={conv.userAvatar} alt={conv.userName} className="h-12 w-12 rounded-full border-2 border-violet-500/40" />
              {conv.isOnline && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-dark bg-green-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-white">{conv.userName}</span>
                  {conv.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />}
                </div>
                <span className="text-xs text-white/30">
                  {formatDistanceToNow(new Date(conv.lastMessageTime), { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs text-white/50">{conv.lastMessage}</p>
                {conv.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Heart className={conv.intimacyScore > 50 ? 'h-4 w-4 fill-violet-400 text-violet-400' : 'h-4 w-4 text-white/20'} />
              <div className="h-8 w-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="w-full rounded-full bg-gradient-to-t from-violet-600 to-pink-500"
                  initial={{ height: 0 }}
                  animate={{ height: `${conv.intimacyScore}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true, locale: ptBR })

  if (message.type === 'auction') {
    return (
      <div className="flex justify-center">
        <div className="max-w-xs rounded-2xl border border-violet-500/30 bg-white/[0.045] px-4 py-3 text-center">
          <Gavel className="mx-auto mb-1 h-5 w-5 text-violet-400" />
          <p className="text-sm font-semibold text-white">{message.content}</p>
          <div className="mt-2 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-400">
            {message.auctionStatus === 'accepted' ? 'Aceito' : message.auctionStatus === 'rejected' ? 'Recusado' : 'Aguardando'}
          </div>
        </div>
      </div>
    )
  }

  if (message.type === 'media' && message.isLocked) {
    return (
      <div className={isOwn ? 'flex justify-end' : 'flex justify-start'}>
        <div className="relative h-48 w-48 overflow-hidden rounded-2xl">
          <img src={message.mediaUrl} alt="" className="h-full w-full object-cover blur-xl" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-dark/55">
            <Lock className="h-6 w-6 text-violet-400" />
            <span className="text-xs font-semibold text-white">R$ {message.price?.toFixed(2)}</span>
            <button className="rounded-lg bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-3 py-1.5 text-xs font-semibold text-white">
              Desbloquear
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={isOwn ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={
          'max-w-xs rounded-2xl px-4 py-2.5 ' +
          (isOwn
            ? 'rounded-tr-sm bg-[linear-gradient(135deg,#8b5cf6_0%,#6d28d9_100%)] text-white'
            : 'rounded-tl-sm border border-white/10 bg-white/[0.045] text-white')
        }
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={'mt-1 flex items-center gap-1 ' + (isOwn ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] opacity-50">{timeAgo}</span>
          {isOwn && message.isRead && <Check className="h-3 w-3 text-violet-200" />}
        </div>
      </div>
    </div>
  )
}

function ConversationView({ conversation }: { conversation: Conversation }) {
  const { sendMessage, setActiveConversation, placeBid, updateIntimacy } = useMessages()
  const { user } = useUser()
  const [message, setMessage] = useState('')
  const [showAuction, setShowAuction] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages.length])

  const handleSend = () => {
    if (!message.trim()) return
    sendMessage(conversation.id, {
      senderId: user?.id || 'user-001',
      receiverId: conversation.userId,
      content: message.trim(),
      type: 'text',
    })
    updateIntimacy(conversation.id, 2)
    setMessage('')
  }

  const handleBid = () => {
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount < 10) return
    placeBid(conversation.id, amount)
    updateIntimacy(conversation.id, 10)
    setShowAuction(false)
    setBidAmount('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-dark pb-24">
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(6,4,12,0.84)] px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveConversation(null)} className="rounded-xl border border-white/10 bg-white/6 p-2">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="relative">
            <img src={conversation.userAvatar} alt={conversation.userName} className="h-10 w-10 rounded-full border-2 border-violet-500/40" />
            {conversation.isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-dark bg-green-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white">{conversation.userName}</span>
              {conversation.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />}
            </div>
            <span className="text-xs text-white/40">{conversation.isOnline ? 'Online agora' : 'Offline'}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">Intimidade</div>
            <div className="text-xs font-bold text-violet-300">{conversation.intimacyScore}%</div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === (user?.id || 'user-001')} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showAuction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 rounded-3xl border border-violet-500/30 bg-white/[0.045] p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-violet-400" />
                <span className="font-bold text-white">OnlyAuction</span>
              </div>
              <button onClick={() => setShowAuction(false)}>
                <X className="h-5 w-5 text-white/40" />
              </button>
            </div>
            <p className="mb-4 text-xs text-white/50">Lance minimo R$ 10,00. Criador responde imediatamente.</p>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => setBidAmount(String(value))}
                  className={
                    'rounded-xl py-2 text-sm font-semibold transition-all ' +
                    (bidAmount === String(value)
                      ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] text-white'
                      : 'border border-white/10 bg-white/6 text-white/60')
                  }
                >
                  R${value}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/6 px-3">
                <DollarSign className="mr-1 h-4 w-4 text-violet-400" />
                <input
                  type="number"
                  placeholder="Valor"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBid}
                className="flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-5 py-2.5 text-sm font-bold text-white"
              >
                <Gavel className="h-4 w-4" />
                Lancar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-white/5 bg-[rgba(10,8,18,0.92)] px-4 py-3 backdrop-blur-2xl">
        {showEmojis && (
          <div className="mb-3 flex flex-wrap gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setMessage((prev) => prev + emoji)
                  setShowEmojis(false)
                }}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white/70"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAuction(!showAuction)}
            className={'rounded-xl p-2.5 ' + (showAuction ? 'bg-violet-500/20 text-violet-300' : 'text-white/40')}
          >
            <Gavel className="h-5 w-5" />
          </motion.button>
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Mensagem..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <button onClick={() => setShowEmojis(!showEmojis)} className="text-white/30 transition-colors hover:text-violet-400">
              <Smile className="h-4 w-4" />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={
              'rounded-xl p-2.5 ' +
              (message.trim()
                ? 'bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)]'
                : 'border border-white/10 bg-white/6')
            }
          >
            <Send className={'h-5 w-5 ' + (message.trim() ? 'text-white' : 'text-white/30')} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
