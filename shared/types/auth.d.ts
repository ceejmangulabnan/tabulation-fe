// shared/auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: number
    documentId: string
    username: string
    email: string
    provider?: string
    confirmed?: boolean
    blocked?: boolean
    createdAt?: string
    updatedAt?: string
    publishedAt?: string
  }

  interface UserSession {
    user: User
    secure: {
      jwt: string
    }
    loggedInAt: Date
  }
}
