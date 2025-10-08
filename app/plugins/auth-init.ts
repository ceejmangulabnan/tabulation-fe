// app/plugins/auth-initializer.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.initializeAuth()
})
