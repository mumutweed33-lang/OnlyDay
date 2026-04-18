'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getDatabaseProvider } from '@/lib/db'
import type { FeedPost, NewFeedPost } from '@/types/domain'
import { useUser } from '@/components/providers/UserContext'

export type Post = FeedPost

interface PostContextType {
  posts: Post[]
  addPost: (post: NewFeedPost) => Promise<void>
  likePost: (postId: string) => Promise<void>
  savePost: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export function PostProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useUser()
  const [posts, setPosts] = useState<Post[]>([])

  const loadPosts = useCallback(async () => {
    try {
      const nextPosts = await getDatabaseProvider().posts.listFeed(user?.id)
      setPosts(nextPosts)
    } catch (error) {
      console.error('[posts] failed to load community feed', error)
      setPosts([])
    }
  }, [user?.id])

  useEffect(() => {
    void loadPosts()

    const refreshOnFocus = () => {
      void loadPosts()
    }
    const refreshInterval = window.setInterval(() => {
      void loadPosts()
    }, 30000)

    window.addEventListener('focus', refreshOnFocus)

    return () => {
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', refreshOnFocus)
    }
  }, [loadPosts])

  const addPost = useCallback(async (postData: NewFeedPost) => {
    const isOwnPost = postData.userId === user?.id

    try {
      const created = await getDatabaseProvider().posts.create(postData)
      setPosts((prev) => [created, ...prev])
      if (isOwnPost && user) {
        await updateUser({ posts: (user.posts ?? 0) + 1 })
      }
    } catch (error) {
      console.error('[posts] failed to create post', error)
      throw error
    }
  }, [updateUser, user])

  const likePost = useCallback(
    async (postId: string) => {
      if (!user?.id) return

      try {
        const updated = await getDatabaseProvider().posts.toggleLike(postId, user.id)
        if (!updated) return
        setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)))
      } catch (error) {
        console.error('[posts] failed to toggle like', error)
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likes: post.isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
                }
              : post
          )
        )
      }
    },
    [user?.id]
  )

  const savePost = useCallback(
    async (postId: string) => {
      if (!user?.id) return

      try {
        const updated = await getDatabaseProvider().posts.toggleSave(postId, user.id)
        if (!updated) return
        setPosts((prev) => prev.map((post) => (post.id === postId ? updated : post)))
      } catch (error) {
        console.error('[posts] failed to toggle save', error)
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, isSaved: !post.isSaved } : post
          )
        )
      }
    },
    [user?.id]
  )

  const deletePost = useCallback(async (postId: string) => {
    const deletedPost = posts.find((post) => post.id === postId)

    try {
      await getDatabaseProvider().posts.delete(postId)
    } catch (error) {
      console.error('[posts] failed to delete post', error)
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId))

    if (deletedPost?.userId === user?.id && user) {
      await updateUser({ posts: Math.max(0, (user.posts ?? 0) - 1) })
    }
  }, [posts, updateUser, user])

  return (
    <PostContext.Provider value={{ posts, addPost, likePost, savePost, deletePost }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostContext)
  if (!context) throw new Error('usePosts must be used within PostProvider')
  return context
}
