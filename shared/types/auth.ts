// // shared/auth.d.ts
// declare module '#auth-utils' {
//   interface User {
//     id: number
//     documentId: string
//     username: string
//     email: string
//     provider?: string
//     confirmed?: boolean
//     blocked?: boolean
//     createdAt?: string
//     updatedAt?: string
//     publishedAt?: string
//   }
//
//   interface UserSession {
//     user: User
//     secure: {
//       jwt: string
//     }
//     loggedInAt: Date
//   }
// }

// shared/types/auth.ts

// The basic structure of a Strapi User object returned from /auth/local or /users/me
export interface StrapiUser {
  id: number
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  // Add other fields you expect from your Strapi User model
  name?: string
  role?: {
    id: number
    name: string
    description: string
    type: string
  }
}

// The structure of the data returned on successful login
export interface AuthResponse {
  jwt: string
  user: StrapiUser
}

// The state structure for your Pinia store
export interface AuthState {
  user: StrapiUser | null
  jwt: string | null
  isLoading: boolean
}
