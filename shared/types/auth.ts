// shared/auth.d.ts
export interface StrapiUser {
  id: number
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  name?: string
  role?: {
    id: number
    name: string
    description: string
    type: string
  }
  userRole: 'admin' | 'judge'
}

export interface AuthResponse {
  jwt: string
  user: StrapiUser
}

export interface AuthState {
  user: StrapiUser | null
  jwt: string | null
  isLoading: boolean
}
