'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  BadgeCheck,
  Crown,
  Edit3,
  Grid3X3,
  Heart,
  ImagePlus,
  Lock,
  LogOut,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { PostDetailModal } from '@/components/feed/PostDetailModal'
import { usePosts } from '@/components/providers/PostContext'
import { useSocial } from '@/components/providers/SocialContext'
import { useUser } from '@/components/providers/UserContext'
import type { FeedPost } from '@/types/domain'

interface ProfilePageProps {
  onOpenDashboard?: () => void
  onOpenTag?: (tag: string) => void
}

export function ProfilePage({ onOpenDashboard, onOpenTag }: ProfilePageProps) {
  const { user, logout, updateUser } = useUser()
  const { posts } = usePosts()
  const { getFollowingCount } = useSocial()
  const [activeTab, setActiveTab] = useState('posts')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftUsername, setDraftUsername] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [draftLocation, setDraftLocation] = useState('')
  const [draftAvatar, setDraftAvatar] = useState('')
  const [draftCoverImage, setDraftCoverImage] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveProfileError, setSaveProfileError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const userPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          post.userId === (user?.id || 'user-001') ||
          post.userUsername === user?.username
      ),
    [posts, user?.id, user?.username]
  )
  const premiumPosts = userPosts.filter((post) => post.isLocked)
  const likedPosts = posts.filter((post) => post.isLiked)

  if (!user) return null

  const visiblePosts =
    activeTab === 'locked' ? premiumPosts : activeTab === 'liked' ? likedPosts : userPosts

  const openEditModal = () => {
    setDraftName(user.name ?? '')
    setDraftUsername(user.username ?? '')
    setDraftBio(user.bio ?? '')
    setDraftLocation(user.location || '')
    setDraftAvatar(user.avatar || '')
    setDraftCoverImage(user.coverImage || '')
    setSaveProfileError(null)
    setShowEditModal(true)
  }

  useEffect(() => {
    if (!showEditModal) return
    setDraftName(user.name ?? '')
    setDraftUsername(user.username ?? '')
    setDraftBio(user.bio ?? '')
    setDraftLocation(user.location || '')
    setDraftAvatar(user.avatar || '')
    setDraftCoverImage(user.coverImage || '')
    setSaveProfileError(null)
  }, [showEditModal, user.avatar, user.bio, user.coverImage, user.location, user.name, user.username])

  const readImageFile = (file: File, onLoad: (value: string) => void) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoad(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setSaveProfileError(null)
    try {
      await updateUser({
        name: draftName.trim() || user.name,
        username: draftUsername,
        bio: draftBio.trim() || user.bio,
        location: draftLocation.trim() || undefined,
        avatar: draftAvatar || user.avatar,
        coverImage: draftCoverImage || undefined,
      })
      setShowEditModal(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar seu perfil agora.'
      setSaveProfileError(message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
  }

  return (
    <div className="min-h-screen bg-dark pb-28">
      <PostDetailModal
        post={selectedPost}
        viewerId={user.id}
        onClose={() => setSelectedPost(null)}
        onOpenTag={onOpenTag}
      />
      <div className="relative">
        <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,#1a0938_0%,#34125f_38%,#18122f_100%)]">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
          <div className="absolute -right-8 top-6 h-28 w-28 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="px-4 pb-4">
          <div className="mb-4 flex items-end justify-between -mt-12">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 rounded-[28px] border-4 border-dark object-cover shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-dark bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.45)]">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={openEditModal}
                className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/70 backdrop-blur-xl"
              >
                <Edit3 className="h-4 w-4" />
                Editar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLogoutConfirm(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/40 transition-colors hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <div className="mb-4 rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{user.name}</h2>
              {user.isCreator && <Crown className="h-5 w-5 text-violet-400" />}
            </div>
            <p className="mb-2 text-sm text-violet-400">{user.username}</p>
            <p className="text-sm leading-relaxed text-white/60">{user.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Perfil privado do dono da conta
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Outros usuários veem somente seu perfil público
              </span>
            </div>

            {user.isCreator && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onOpenDashboard}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#9b5cff_0%,#7C3AED_55%,#4f46e5_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.28)]"
              >
                <BarChart3 className="h-4 w-4" />
                Abrir meu dashboard
              </motion.button>
            )}
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Posts', value: userPosts.length },
              { label: 'Seguidores', value: user.followers.toLocaleString('pt-BR') },
              { label: 'Seguindo', value: getFollowingCount(user.following).toLocaleString('pt-BR') },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-4 text-center">
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (user.isCreator) {
                  onOpenDashboard?.()
                  return
                }
                openEditModal()
              }}
              className={
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ' +
                (user.plan === 'diamond'
                  ? 'border border-violet-500/30 bg-violet-500/20 text-violet-300'
                  : 'border border-white/10 bg-white/6 text-white/45 hover:border-violet-500/30 hover:text-white')
              }
            >
              {user.plan === 'diamond' ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
              {user.plan === 'free' ? 'Plano Free' : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
            </motion.button>
            {user.isVerified && (
              <div className="flex items-center gap-1.5 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                <BadgeCheck className="h-3 w-3" />
                Verificado
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-white/5">
        <div className="flex">
          {[
            { id: 'posts', icon: Grid3X3, label: 'Posts' },
            { id: 'locked', icon: Lock, label: 'Premium' },
            { id: 'liked', icon: Heart, label: 'Curtidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                'relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors ' +
                (activeTab === tab.id ? 'text-violet-300' : 'text-white/30')
              }
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'liked' && (
          <div className="mb-4 rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Heart className="h-4 w-4 text-violet-400" />
              Seus curtidos
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/45">
              Essa área é visível para você e para quem visitar seu perfil público, como você pediu.
            </p>
          </div>
        )}

        {visiblePosts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-violet-500/20 bg-white/6">
              <Sparkles className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-sm text-white/50">
              {activeTab === 'locked'
                ? 'Nenhum post premium ainda'
                : activeTab === 'liked'
                  ? 'Você ainda não curtiu nada'
                  : 'Nenhum post ainda'}
            </p>
            <p className="mt-1 text-xs text-white/30">
              {activeTab === 'locked'
                ? 'Seus conteúdos premium vão aparecer aqui'
                : activeTab === 'liked'
                  ? 'Quando você curtir algo, ele aparece aqui'
                  : 'Comece a compartilhar seu conteúdo'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {visiblePosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square overflow-hidden rounded-2xl bg-violet-900/20 ring-1 ring-white/6"
              >
                {post.media?.[0] ? (
                  <img src={post.media[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2">
                    <p className="line-clamp-3 text-center text-[10px] text-white/50">{post.content}</p>
                  </div>
                )}
                {post.isLocked && (
                  <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-dark/80">
                    <Lock className="h-3 w-3 text-violet-400" />
                  </div>
                )}
                {activeTab === 'liked' && (
                  <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-dark/80">
                    <Heart className="h-3 w-3 fill-violet-400 text-violet-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Editar meu perfil</h3>
                  <p className="text-xs text-white/40">Seu perfil premium, do seu jeito.</p>
                </div>
                <button onClick={() => setShowEditModal(false)} aria-label="Fechar edição de perfil" className="text-white/35">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  <div className="relative h-32 bg-[linear-gradient(135deg,#1a0938_0%,#34125f_38%,#18122f_100%)]">
                    {draftCoverImage && (
                      <img src={draftCoverImage} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="absolute bottom-3 right-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Trocar capa
                    </button>
                  </div>
                  <div className="-mt-8 flex items-end gap-3 px-4 pb-4">
                    <img
                      src={draftAvatar || user.avatar}
                      alt={draftName || user.name}
                      className="h-20 w-20 rounded-[24px] border-4 border-[#0f0a18] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="mb-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-white/75"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Trocar foto
                    </button>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) readImageFile(file, setDraftAvatar)
                      event.target.value = ''
                    }}
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) readImageFile(file, setDraftCoverImage)
                      event.target.value = ''
                    }}
                  />
                  <p className="px-4 pb-4 text-[11px] leading-relaxed text-white/40">
                    A imagem escolhida e preservada sem compressao no preview. Para 8K real em producao, o proximo passo e ligar um storage dedicado.
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/45">Nome</label>
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/45">Username</label>
                  <div className="flex items-center rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                    <span className="mr-1 text-sm font-semibold text-violet-300">@</span>
                    <input
                      value={draftUsername.replace(/^@+/, '')}
                      onChange={(event) => {
                        const nextUsername = event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, '')
                        setDraftUsername(`@${nextUsername}`)
                        if (saveProfileError) setSaveProfileError(null)
                      }}
                      placeholder="seuusername"
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/35">
                    Se esse @ ja estiver sendo usado por outra conta, o app vai pedir para escolher outro.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/45">Bio premium</label>
                  <textarea
                    value={draftBio}
                    onChange={(event) => setDraftBio(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/45">Local</label>
                  <input
                    value={draftLocation}
                    onChange={(event) => setDraftLocation(event.target.value)}
                    placeholder="Cidade ou região"
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4 text-violet-300" />
                    Direção de bio
                  </div>
                  <p className="text-xs leading-relaxed text-white/55">
                    Foque em presença, nicho, valor e energia. Poucas linhas, identidade forte e sem poluir.
                  </p>
                </div>

                {saveProfileError && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                    {saveProfileError}
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  aria-label="Cancelar edição de perfil"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/70"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex-1 rounded-2xl btn-primary py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingProfile ? 'Salvando...' : 'Salvar perfil'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0f0a18] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15">
                  <LogOut className="h-5 w-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Sair da conta?</h3>
                  <p className="text-xs text-white/45">Você vai voltar para a home inicial.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  aria-label="Cancelar saída da conta"
                  className="rounded-2xl border border-white/10 bg-white/6 py-3 text-sm font-semibold text-white/70"
                >
                  Continuar aqui
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-bold text-rose-100"
                >
                  Sim, sair agora
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
