// app/composables/useServerApi.ts
import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '~/stores/auth'

export function useServerApi(): AxiosInstance {
  const config = useRuntimeConfig()
  const SERVER_API_URL = `${config.public.appUrl}/api`
  const api: AxiosInstance = axios.create({
    baseURL: SERVER_API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request Interceptor: Attaches the JWT to headers
  api.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      const token = authStore.token

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  return api
}
