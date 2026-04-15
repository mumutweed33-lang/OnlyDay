import type { AppUser, AuthSession, CreateAccountInput } from '@/types/domain'

export interface SignInInput {
  emailOrUsername: string
  password: string
}

export interface AuthService {
  getSession(): Promise<AuthSession>
  signUp(input: CreateAccountInput): Promise<AuthSession>
  signIn(input: SignInInput): Promise<AuthSession>
  signOut(): Promise<void>
  updateProfile(updates: Partial<AppUser>): Promise<AppUser | null>
}
