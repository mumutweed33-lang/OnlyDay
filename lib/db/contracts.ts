import type { AppUser } from '@/types/domain'

export interface DatabaseUserRecord extends AppUser {
  email?: string
  updatedAt?: string
}

export interface UserRepository {
  findById(id: string): Promise<DatabaseUserRecord | null>
  findByUsername(username: string): Promise<DatabaseUserRecord | null>
  create(user: DatabaseUserRecord): Promise<DatabaseUserRecord>
  update(id: string, updates: Partial<DatabaseUserRecord>): Promise<DatabaseUserRecord | null>
}

export interface DatabaseProvider {
  users: UserRepository
}
