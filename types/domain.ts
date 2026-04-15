export type UserPlan = 'free' | 'bronze' | 'gold' | 'diamond'

export interface AppUser {
  id: string
  name: string
  username: string
  email?: string
  avatar: string
  bio: string
  isCreator: boolean
  isVerified: boolean
  isPremium: boolean
  followers: number
  following: number
  posts: number
  balance: number
  plan: UserPlan
  joinedAt: string
  coverImage?: string
  website?: string
  location?: string
  intimacyScore?: number
}

export interface AuthSession {
  user: AppUser | null
  isAuthenticated: boolean
}

export interface CreateAccountInput {
  name: string
  username: string
  email: string
  password: string
  isCreator: boolean
  bio?: string
  avatar?: string | null
}
