'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Lock, Gavel, Heart, Smile, BadgeCheck, Sparkles, DollarSign, X, Check } from 'lucide-react'
import { useMessages, Conversation, Message } from '@/components/providers/MessageContext'
import { useUser } from '@/components/providers/UserContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ChatPage() {
  const { conversations, activeConversation, setActiveConversation, markAsRead } = useMessages()
  const { user } = useUser()

  if (activeConversation) {
    return <ConversationView conversation={activeConversation} />
  }

  return (
    <div className='min-h-screen bg-dark'>
      <div className='sticky top-0 z-30 glass border-b border-white/5 px-4 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-black text-white'>Chat VIP</h1>
          <div className='flex items-center gap-1 text-xs text-violet-400 glass rounded-full px-3 py-1 border border-violet-500/20'>
            <Sparkles className='w-3 h-3' />
            <span>Premium</span>
          </div>
        </div>
      </div>

      <div className='divide-y divide-white/5'>
        {conversations.map((conv, i) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { setActiveConversation(conv); markAsRead(conv.id) }}
            className='flex items-center gap-3 px-4 py-4 hover:bg-violet-500/5 cursor-pointer transition-colors'
          >
            <div className='relative flex-shrink-0'>
              <img src={conv.userAvatar} alt={conv.userName} className='w-12 h-12 rounded-full border-2 border-violet-500/40' />
              {conv.isOnline && (
                <div className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-dark' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-0.5'>
                <div className='flex items-center gap-1'>
                  <span className='font-semibold text-white text-sm'>{conv.userName}</span>
                  {conv.isVerified && <BadgeCheck className='w-3.5 h-3.5 text-violet-400' />}
                </div>
                <span className='text-xs text-white/30'>
                  {formatDistanceToNow(new Date(conv.lastMessageTime), { locale: ptBR })}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-xs text-white/50 truncate'>{conv.lastMessage}</p>
                {conv.unreadCount > 0 && (
                  <span className='w-5 h-5 bg-violet-600 rounded-full text-xs text-white flex items-center justify-center font-bold'>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
            <div className='flex flex-col items-center gap-1 flex-shrink-0'>
              <Heart className={conv.intimacyScore > 50 ? 'w-4 h-4 text-violet-400 fill-violet-400' : 'w-4 h-4 text-white/20'} />
              <div className='w-1 h-8 bg-white/10 rounded-full overflow-hidden'>
                <motion.div
                  className='w-full bg-gradient-to-t from-violet-600 to-pink-500 rounded-full'
                  initial={{ height: 0 }}
                  animate={{ height: conv.intimacyScore + '%' }}
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
      <div className='flex justify-center'>
        <div className='glass rounded-2xl px-4 py-3 border border-violet-500/30 max-w-xs text-center'>
          <Gavel className='w-5 h-5 text-violet-400 mx-auto mb-1' />
          <p className='text-sm font-semibold text-white'>{message.content}</p>
          <div className={
            'mt-2 text-xs px-3 py-1 rounded-full inline-block ' +
            (message.auctionStatus === 'accepted' ? 'bg-green-500/20 text-green-400' :
            message.auctionStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
            'bg-amber-500/20 text-amber-400')
          }>
            {message.auctionStatus === 'accepted' ? '✅ Aceito' :
             message.auctionStatus === 'rejected' ? '❌ Recusado' : '⏳ Aguardando'}
          </div>
        </div>
      </div>
    )
  }

  if (message.type === 'media' && message.isLocked) {
    return (
      <div className={isOwn ? 'flex justify-end' : 'flex justify-start'}>
        <div className='relative rounded-2xl overflow-hidden w-48 h-48'>
          <img src={message.mediaUrl} alt='' className='w-full h-full object-cover filter blur-xl' />
          <div className='absolute inset-0 bg-dark/50 flex flex-col items-center justify-center gap-2'>
            <Lock className='w-6 h-6 text-violet-400' />
            <span className='text-xs text-white font-semibold'>R$ {message.price?.toFixed(2)}</span>
            <button className='btn-primary px-3 py-1.5 rounded-lg text-xs text-white font-semibold'>
              Desbloquear
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={isOwn ? 'flex justify-end' : 'flex justify-start'}>
      <div className={
        'max-w-xs rounded-2xl px-4 py-2.5 ' +
        (isOwn
          ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm'
          : 'glass border border-white/10 text-white rounded-tl-sm')
      }>
        <p className='text-sm leading-relaxed'>{message.content}</p>
        <div className={'flex items-center gap-1 mt-1 ' + (isOwn ? 'justify-end' : 'justify-start')}>
          <span className='text-[10px] opacity-50'>{timeAgo}</span>
          {isOwn && message.isRead && <Check className='w-3 h-3 text-violet-300' />}
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
  const EMOJIS = ['😊', '🔥', '💜', '✨', '🌙', '👑', '💎', '🚀', '❤️', '😍']

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

  const intimacyPct = conversation.intimacyScore

  return (
    <div className='flex flex-col min-h-screen bg-dark'>
      <div className='sticky top-0 z-30 glass border-b border-white/5 px-4 py-3'>
        <div className='flex items-center gap-3'>
          <button onClick={() => setActiveConversation(null)} className='p-2 glass rounded-xl border border-white/10'>
            <ArrowLeft className='w-5 h-5 text-white' />
          </button>
          <div className='relative'>
            <img src={conversation.userAvatar} alt='' className='w-10 h-10 rounded-full border-2 border-violet-500/40' />
            {conversation.isOnline && (
              <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark' />
            )}
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-1'>
              <span className='font-semibold text-white text-sm'>{conversation.userName}</span>
              {conversation.isVerified && <BadgeCheck className='w-3.5 h-3.5 text-violet-400' />}
            </div>
            <span className='text-xs text-white/40'>{conversation.isOnline ? 'Online agora' : 'Offline'}</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='text-right'>
              <div className='text-xs text-white/40'>Intimidade</div>
              <div className='text-xs font-bold text-violet-400'>{intimacyPct}%</div>
            </div>
            <div className='w-2 h-12 bg-white/10 rounded-full overflow-hidden'>
              <div className='w-full bg-gradient-to-t from-violet-600 to-pink-500 rounded-full transition-all' style={{ height: intimacyPct + '%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3'>
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
            className='mx-4 mb-2 glass rounded-3xl p-6 border border-violet-500/30'
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <Gavel className='w-5 h-5 text-violet-400' />
                <span className='font-bold text-white'>OnlyAuction</span>
              </div>
              <button onClick={() => setShowAuction(false)}><X className='w-5 h-5 text-white/40' /></button>
            </div>
            <p className='text-xs text-white/50 mb-4'>Lance mínimo R$ 10,00. Criador responde imediatamente. Devolução garantida se recusado.</p>
            <div className='grid grid-cols-4 gap-2 mb-4'>
              {[10, 25, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setBidAmount(String(v))}
                  className={'py-2 rounded-xl text-sm font-semibold transition-all ' + (bidAmount === String(v) ? 'btn-primary text-white' : 'glass border border-white/10 text-white/60')}
                >
                  R${v}
                </button>
              ))}
            </div>
            <div className='flex gap-3'>
              <div className='flex-1 flex items-center glass rounded-xl px-3 border border-white/10'>
                <DollarSign className='w-4 h-4 text-violet-400 mr-1' />
                <input
                  type='number'
                  placeholder='Valor personalizado'
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className='flex-1 bg-transparent text-white placeholder-white/30 outline-none py-2.5 text-sm'
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBid}
                className='btn-primary px-5 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2'
              >
                <Gavel className='w-4 h-4' /> Lançar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='border-t border-white/5 px-4 py-3 glass'>
        {showEmojis && (
          <div className='flex flex-wrap gap-2 mb-3'>
            {EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => { setMessage((p) => p + emoji); setShowEmojis(false) }} className='text-xl hover:scale-125 transition-transform'>{emoji}</button>
            ))}
          </div>
        )}
        <div className='flex items-center gap-2'>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowAuction(!showAuction)} className={'p-2.5 rounded-xl ' + (showAuction ? 'text-violet-400 bg-violet-500/20' : 'text-white/40')}>
            <Gavel className='w-5 h-5' />
          </motion.button>
          <div className='flex-1 flex items-center glass rounded-2xl px-4 py-2.5 border border-white/10 gap-2'>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder='Mensagem...'
              className='flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm'
            />
            <button onClick={() => setShowEmojis(!showEmojis)} className='text-white/30 hover:text-violet-400 transition-colors'>
              <Smile className='w-4 h-4' />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={'p-2.5 rounded-xl ' + (message.trim() ? 'gradient-primary' : 'glass border border-white/10')}
          >
            <Send className={'w-5 h-5 ' + (message.trim() ? 'text-white' : 'text-white/30')} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}