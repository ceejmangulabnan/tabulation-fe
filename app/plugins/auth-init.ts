// app/plugins/auth-initializer.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Run on client and server before component mounts to check JWT validity
  await authStore.initializeAuth()
})
