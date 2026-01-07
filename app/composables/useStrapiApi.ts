// app/composables/useStrapiApi.ts
import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '~/stores/auth'

export function useStrapiApi(): AxiosInstance {
  const config = useRuntimeConfig()
  const STRAPI_API_URL = `${config.public.strapiUrl}/api`
  const api: AxiosInstance = axios.create({
    baseURL: STRAPI_API_URL,
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

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  return api
}
