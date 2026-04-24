'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  DollarSign,
  Gavel,
  Heart,
  ImagePlus,
  Lock,
  Search,
  Send,
  Smile,
  Sparkles,
  X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Conversation, Message, useMessages } from '@/components/providers/MessageContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import { BrandLogo } from '@/components/ui/BrandLogo'
import type { PublicProfile } from '@/types/domain'

const EMOJIS = [':)', '<3', 'wow', 'fire', 'vip', 'ok']

function formatConversationTime(timestamp: string) {
  const createdAt = new Date(timestamp).getTime()
  const diff = Date.now() - createdAt

  if (diff < 60 * 60 * 1000) return 'agora'
  if (diff < 24 * 60 * 60 * 1000) return `${Math.max(1, Math.floor(diff / (60 * 60 * 1000)))}h`
  const days = Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)))
  return `${days} dia${days > 1 ? 's' : ''}`
}

interface ChatPageProps {
  onOpenProfile?: (profile: PublicProfile) => void
}

export function ChatPage({ onOpenProfile }: ChatPageProps) {
  const { conversations, activeConversation, setActiveConversation, markAsRead } = useMessages()
  const [previewProfile, setPreviewProfile] = useState<PublicProfile | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { isFollowing, toggleFollow } = useSocial()
  const highlightedAuctions = conversations.filter((conversation) => conversation.auctionActive).slice(0, 3)
  const filteredConversations = conversations.filter((conversation) => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) return true

    return (
      conversation.userName.toLowerCase().includes(normalized) ||
      conversation.userUsername.toLowerCase().includes(normalized) ||
      conversation.lastMessage.toLowerCase().includes(normalized)
    )
  })

  const pushFeedback = (message: string) => {
    setActionFeedback(message)
    window.setTimeout(() => {
      setActionFeedback((current) => (current === message ? null : current))
    }, 2200)
  }

  useEffect(() => {
    return () => {
      setActiveConversation(null)
    }
  }, [setActiveConversation])

  if (activeConversation) {
    return <ConversationView conversation={activeConversation} onOpenProfile={onOpenProfile} />
  }

  return (
    <div className="min-h-screen bg-[#050508] pb-28 md:pb-32">
      <div className="sticky top-0 z-30 bg-[rgba(5,5,8,0.94)] px-4 pb-4 pt-5 backdrop-blur-2xl md:px-8 md:pt-7">
        <div className="mx-auto max-w-[1080px]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={34} className="select-none" />
            <div className="text-[18px] font-black leading-none tracking-[-0.045em] text-white">
              Only<span className="text-[#8B5CF6]">Day</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (highlightedAuctions.length > 0) {
                const nextConversation = highlightedAuctions[0]
                setActiveConversation(nextConversation)
                void markAsRead(nextConversation.id)
                pushFeedback('Abrimos a conversa premium com o lance mais quente agora.')
              } else {
                pushFeedback('As conversas premium em destaque vão aparecer aqui assim que houver atividade.')
              }
            }}
            aria-label="Abrir conversa premium em destaque"
            className="flex h-10 items-center gap-1.5 rounded-full border border-violet-500/28 px-4 text-[12px] font-medium text-violet-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Premium
          </button>
        </div>

        <div className="mb-4">
          <h1 className="text-[22px] font-black tracking-[-0.05em] text-white">Mensagens</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/30">CONVERSAS E CONEXÕES</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/26" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar conversas e conexões..."
            className="h-[50px] w-full rounded-[18px] border border-white/10 bg-white/[0.03] pl-11 pr-4 text-[14px] text-white outline-none placeholder:text-white/26"
          />
        </div>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-2 pt-3 md:mx-auto md:max-w-[1080px] md:px-8">
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100"
            >
              {actionFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {highlightedAuctions.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              const nextConversation = highlightedAuctions[0]
              setActiveConversation(nextConversation)
              void markAsRead(nextConversation.id)
            }}
            className="flex w-full items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-amber-300">⚡</span>
                <h2 className="text-[14px] font-semibold text-white">OnlyAuction em alta</h2>
              </div>
              <p className="mt-1.5 text-[12px] text-white/40">Conversas com lance ativo priorizadas pelo OD Core</p>
            </div>
            <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
              Auction
            </div>
          </button>
        ) : null}

        <div className="pt-1">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/34">Conversas</h2>
        </div>

        {conversations.length === 0 && (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.045] p-5 text-center shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <div className="text-sm font-semibold text-white">Seu chat VIP ainda está vazio</div>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              Quando você seguir criadores ou abrir uma conversa pelo perfil público, tudo aparece aqui.
            </p>
          </div>
        )}
        {filteredConversations.map((conv, i) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveConversation(conv)
              void markAsRead(conv.id)
            }}
            className="flex cursor-pointer items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.14)] md:px-5 md:py-4"
          >
            <button
              className="relative flex-shrink-0"
              aria-label={`Ver conexão premium com ${conv.userName}`}
              onClick={(event) => {
                event.stopPropagation()
                setPreviewProfile({
                  id: conv.userId,
                  name: conv.userName,
                  username: conv.userUsername,
                  avatar: conv.userAvatar,
                  isVerified: conv.isVerified,
                  isCreator: true,
                })
              }}
            >
              <img src={conv.userAvatar} alt={conv.userName} className="h-10 w-10 rounded-full object-cover" />
              {conv.isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050508] bg-green-500" />}
            </button>
            <button
              className="min-w-0 flex-1 text-left"
              aria-label={`Abrir conversa com ${conv.userName}`}
              onClick={(event) => {
                event.stopPropagation()
                setActiveConversation(conv)
                void markAsRead(conv.id)
              }}
            >
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-semibold text-white">{conv.userName}</span>
                    {conv.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />}
                  </div>
                  <div className="mt-0.5 text-[12px] text-white/42">{conv.userUsername}</div>
                </div>
                <span className="flex-shrink-0 text-[11px] text-white/34">
                  {formatConversationTime(conv.lastMessageTime)}
                </span>
              </div>

              {conv.auctionActive && conv.currentBid ? (
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/14 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  R${conv.currentBid.toFixed(2)} ativo
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[13px] text-white/50">{conv.lastMessage}</p>
                {conv.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold text-white">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
            <div className="flex flex-col items-center gap-2">
              <Heart className={conv.intimacyScore > 50 ? 'h-4 w-4 text-white/42' : 'h-4 w-4 text-white/20'} />
              <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {previewProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Conexão premium</h3>
                  <p className="text-xs text-white/40">Antes do perfil, veja o contexto da conversa</p>
                </div>
                <button onClick={() => setPreviewProfile(null)} aria-label="Fechar conexão premium" className="text-white/40">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <img src={previewProfile.avatar} alt={previewProfile.name} className="h-14 w-14 rounded-[20px] border border-violet-500/30" />
                <div>
                  <div className="flex items-center gap-1 text-white">
                    <span className="font-semibold">{previewProfile.name}</span>
                    {previewProfile.isVerified && <BadgeCheck className="h-4 w-4 text-violet-400" />}
                  </div>
                  <div className="text-xs text-white/35">{previewProfile.username}</div>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Em comum</div>
                  <div className="mt-1 text-sm text-white/70">Premium, criadores e conteúdo exclusivo</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Intimidade</div>
                  <div className="mt-1 text-sm font-semibold text-violet-300">Conexão aquecida</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    toggleFollow(previewProfile)
                    pushFeedback(
                      isFollowing(previewProfile.id)
                        ? `Você deixou de seguir ${previewProfile.name}.`
                        : `Agora você acompanha ${previewProfile.name}.`
                    )
                  }}
                  className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/75"
                >
                  {isFollowing(previewProfile.id) ? 'Seguindo' : 'Seguir agora'}
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const targetConversation = conversations.find(
                      (conversation) =>
                        conversation.userId === previewProfile.id ||
                        conversation.userUsername === previewProfile.username
                    )
                    if (targetConversation) {
                      setActiveConversation(targetConversation)
                      void markAsRead(targetConversation.id)
                    }
                    setPreviewProfile(null)
                  }}
                  className="rounded-2xl border border-violet-500/20 bg-violet-500/10 py-3 text-sm font-bold text-violet-100"
                >
                  Abrir conversa
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onOpenProfile?.(previewProfile)
                    setPreviewProfile(null)
                  }}
                  className="rounded-2xl btn-primary py-3 text-sm font-bold text-white"
                >
                  Ir para o perfil
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MessageBubble({
  message,
  isOwn,
  onUnlockMedia,
}: {
  message: Message
  isOwn: boolean
  onUnlockMedia?: () => void
}) {
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
            <button
              onClick={onUnlockMedia}
              className="rounded-lg bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-3 py-1.5 text-xs font-semibold text-white"
            >
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

function ConversationView({
  conversation,
  onOpenProfile,
}: {
  conversation: Conversation
  onOpenProfile?: (profile: PublicProfile) => void
}) {
  const { sendMessage, setActiveConversation, placeBid, updateIntimacy } = useMessages()
  const { isFollowing, toggleFollow } = useSocial()
  const { user } = useUser()
  const [message, setMessage] = useState('')
  const [showAuction, setShowAuction] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const [showAttachment, setShowAttachment] = useState(false)
  const [showProfilePeek, setShowProfilePeek] = useState(false)
  const [attachmentPrice, setAttachmentPrice] = useState('')
  const [attachmentLocked, setAttachmentLocked] = useState(true)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const pushFeedback = (messageText: string) => {
    setActionFeedback(messageText)
    window.setTimeout(() => {
      setActionFeedback((current) => (current === messageText ? null : current))
    }, 2200)
  }

  const previewProfile: PublicProfile = {
    id: conversation.userId,
    name: conversation.userName,
    username: conversation.userUsername,
    avatar: conversation.userAvatar,
    isVerified: conversation.isVerified,
    isCreator: true,
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages.length])

  const handleSend = () => {
    if (!message.trim()) return
    void sendMessage(conversation.id, {
      senderId: user?.id || 'user-001',
      receiverId: conversation.userId,
      content: message.trim(),
      type: 'text',
    })
    updateIntimacy(conversation.id, 2)
    setMessage('')
    pushFeedback('Mensagem enviada.')
  }

  const handleBid = () => {
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount < 10) {
      pushFeedback('Defina um lance mínimo de R$ 10,00 para continuar.')
      return
    }

    void placeBid(conversation.id, amount)
    updateIntimacy(conversation.id, 10)
    setShowAuction(false)
    setBidAmount('')
    pushFeedback(`Lance de R$ ${amount.toFixed(2)} enviado.`)
  }

  const handleSendAttachment = () => {
    const parsedAttachmentPrice = parseFloat(attachmentPrice)
    if (attachmentLocked && (!Number.isFinite(parsedAttachmentPrice) || parsedAttachmentPrice < 1)) {
      pushFeedback('Defina um valor mínimo de R$ 1,00 para bloquear esse conteúdo.')
      return
    }

    void sendMessage(conversation.id, {
      senderId: user?.id || 'user-001',
      receiverId: conversation.userId,
      content: attachmentLocked ? 'Conteúdo premium enviado no chat' : 'Conteúdo enviado no chat',
      type: 'media',
      mediaUrl: undefined,
      isLocked: attachmentLocked,
      price: attachmentLocked ? parsedAttachmentPrice : undefined,
    })

    setAttachmentPrice('')
    setAttachmentLocked(true)
    setShowAttachment(false)
    pushFeedback(attachmentLocked ? 'Conteúdo premium enviado no chat.' : 'Conteúdo enviado no chat.')
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] min-h-0 flex-col overflow-hidden bg-[#050508]">
      <div className="sticky top-0 z-30 border-b border-white/6 bg-[rgba(3,3,6,0.88)] px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveConversation(null)} aria-label="Voltar para a lista de conversas" className="rounded-xl border border-white/10 bg-white/6 p-2">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <button className="relative" aria-label={`Abrir resumo premium de ${conversation.userName}`} onClick={() => setShowProfilePeek(true)}>
            <img src={conversation.userAvatar} alt={conversation.userName} className="h-10 w-10 rounded-full border-2 border-violet-500/40" />
            {conversation.isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-dark bg-green-500" />}
          </button>
          <button className="flex-1 text-left" aria-label={`Ver resumo premium de ${conversation.userName}`} onClick={() => setShowProfilePeek(true)}>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white">{conversation.userName}</span>
              {conversation.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-violet-400" />}
            </div>
            <span className="text-xs text-white/40">{conversation.isOnline ? 'Online agora' : 'Offline'}</span>
          </button>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">Intimidade</div>
            <div className="text-xs font-bold text-violet-300">{conversation.intimacyScore}%</div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100"
            >
              {actionFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {conversation.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === (user?.id || 'user-001')}
            onUnlockMedia={() => pushFeedback('O desbloqueio real do chat entra na próxima etapa de monetização.')}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showProfilePeek && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Conexão premium</h3>
                  <p className="text-xs text-white/40">Contexto entre você e essa pessoa</p>
                </div>
                <button onClick={() => setShowProfilePeek(false)} aria-label="Fechar resumo premium" className="text-white/40">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <img src={previewProfile.avatar} alt={previewProfile.name} className="h-14 w-14 rounded-[20px] border border-violet-500/30" />
                <div>
                  <div className="flex items-center gap-1 text-white">
                    <span className="font-semibold">{previewProfile.name}</span>
                    {previewProfile.isVerified && <BadgeCheck className="h-4 w-4 text-violet-400" />}
                  </div>
                  <div className="text-xs text-white/35">{previewProfile.username}</div>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Afinidades</div>
                  <div className="mt-1 text-sm text-white/70">Relacionamento premium, conversa e recorrência</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">Intimidade</div>
                  <div className="mt-1 text-sm font-semibold text-violet-300">{conversation.intimacyScore}%</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    toggleFollow(previewProfile)
                    pushFeedback(
                      isFollowing(previewProfile.id)
                        ? `Você deixou de seguir ${previewProfile.name}.`
                        : `Agora você acompanha ${previewProfile.name}.`
                    )
                  }}
                  className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/75"
                >
                  {isFollowing(previewProfile.id) ? 'Seguindo' : 'Seguir agora'}
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onOpenProfile?.(previewProfile)
                    setShowProfilePeek(false)
                  }}
                  className="rounded-2xl btn-primary py-3 text-sm font-bold text-white"
                >
                  Ir para o perfil
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <button onClick={() => setShowAuction(false)} aria-label="Fechar painel de leilão">
                <X className="h-5 w-5 text-white/40" />
              </button>
            </div>
            <p className="mb-4 text-xs text-white/50">Lance mínimo de R$ 10,00. O criador responde imediatamente.</p>
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
                Lançar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAttachment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-2 rounded-3xl border border-violet-500/30 bg-white/[0.045] p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-violet-400" />
                <span className="font-bold text-white">Conteúdo do chat</span>
              </div>
              <button onClick={() => setShowAttachment(false)} aria-label="Fechar painel de conteúdo do chat">
                <X className="h-5 w-5 text-white/40" />
              </button>
            </div>
            <p className="mb-4 text-xs text-white/50">
              Envie foto, arquivo ou conteúdo bloqueado com cobrança direta no chat.
            </p>
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/6 p-4">
              <div className="text-sm text-white/75">Anexo real sera escolhido pelo usuario na proxima etapa.</div>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-white">Bloquear conteúdo</div>
                <div className="text-xs text-white/40">Liberado somente após pagamento</div>
              </div>
              <button
                onClick={() => setAttachmentLocked((prev) => !prev)}
                className={'rounded-full px-3 py-1 text-xs font-semibold ' + (attachmentLocked ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-white/60')}
              >
                {attachmentLocked ? 'Ativo' : 'Livre'}
              </button>
            </div>
            {attachmentLocked && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                <input
                  value={attachmentPrice}
                  onChange={(event) => setAttachmentPrice(event.target.value)}
                  type="number"
                  placeholder="Preço para desbloqueio"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSendAttachment}
              className="w-full rounded-2xl btn-primary py-3 text-sm font-bold text-white"
            >
              Enviar conteúdo no chat
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="shrink-0 border-t border-white/5 bg-[rgba(10,8,18,0.92)] px-3 py-3 backdrop-blur-2xl">
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
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowAuction((prev) => !prev)
              setShowAttachment(false)
            }}
            aria-label={showAuction ? 'Fechar painel de leilão' : 'Abrir painel de leilão'}
            className={'rounded-xl p-2 ' + (showAuction ? 'bg-violet-500/20 text-violet-300' : 'text-white/40')}
          >
            <Gavel className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowAttachment((prev) => !prev)
              setShowAuction(false)
            }}
            aria-label={showAttachment ? 'Fechar painel de conteúdo do chat' : 'Abrir painel de conteúdo do chat'}
            className={'rounded-xl p-2 ' + (showAttachment ? 'bg-violet-500/20 text-violet-300' : 'text-white/40')}
          >
            <ImagePlus className="h-5 w-5" />
          </motion.button>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Mensagem..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <button onClick={() => setShowEmojis(!showEmojis)} aria-label={showEmojis ? 'Fechar emojis' : 'Abrir emojis'} className="text-white/30 transition-colors hover:text-violet-400">
              <Smile className="h-4 w-4" />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="Enviar mensagem"
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
