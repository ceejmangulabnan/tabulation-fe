import type { User } from '#auth-utils'

export interface StrapiAuthResponse {
  jwt: string
  user: User
}
