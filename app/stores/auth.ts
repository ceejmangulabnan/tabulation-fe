// app/stores/auth.ts
import { defineStore } from 'pinia'
import type { AuthState, StrapiUser, AuthResponse } from '#shared/types/auth'
import { useStrapiApi } from '~/composables/useStrapiApi'

const JWT_COOKIE_NAME = 'strapi_jwt'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    jwt: null,
    isLoading: false,
    view: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.jwt && !!state.user,
    token: (state): string | null => state.jwt,
    userInfo: (state): StrapiUser | null => state.user,
  },

  actions: {
    async login(identifier: string, password: string): Promise<StrapiUser> {
      this.isLoading = true
      try {
        const api = useStrapiApi()
        const response = await api.post<AuthResponse>('/auth/local', {
          identifier,
          password,
        })

        const { jwt, user } = response.data

        this.jwt = jwt
        this.user = user

        const tokenCookie = useCookie<string | null>(JWT_COOKIE_NAME, { maxAge: 60 * 60 * 24 * 7 })
        tokenCookie.value = jwt

        await this.fetchUser()
        return this.user
      } catch (error) {
        this.user = null
        this.jwt = null

        // Let caller handle auth error
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async register(
      name: string,
      username: string,
      password: string,
      email?: string,
      eventId?: string,
      autoLogin = true
    ): Promise<StrapiUser> {
      this.isLoading = true
      try {
        const api = useStrapiApi()
        const response = await api.post<AuthResponse>('/auth/local/register', {
          name,
          username,
          email,
          password,
          eventId,
        })

        const { jwt, user } = response.data

        if (autoLogin) {
          this.jwt = jwt
          this.user = user

          const tokenCookie = useCookie<string | null>(JWT_COOKIE_NAME, { maxAge: 60 * 60 * 24 * 7 })
          tokenCookie.value = jwt
        }

        return user
      } catch (error) {
        this.user = null
        this.jwt = null
        return Promise.reject(error)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.user = null
      this.jwt = null

      const tokenCookie = useCookie<string | null>(JWT_COOKIE_NAME)
      tokenCookie.value = null

      await navigateTo('/')
    },

    async initializeAuth(): Promise<void> {
      if (this.isAuthenticated) return

      const tokenCookie = useCookie<string | null>(JWT_COOKIE_NAME)
      const storedToken = tokenCookie.value

      if (storedToken) {
        this.jwt = storedToken
        await this.fetchUser()
      }
    },

    // Validate token and fetch user
    async fetchUser(): Promise<void> {
      this.isLoading = true
      try {
        const api = useStrapiApi()
        const response = await api.get<StrapiUser>('/users/me?populate=*')
        this.user = response.data

        // Check role, assign view.
      } catch (error) {
        // If token is invalid/expired
        console.error('User token is invalid, refresh failed', error)
        this.logout()
      } finally {
        this.isLoading = false
      }
    },
  },
})
