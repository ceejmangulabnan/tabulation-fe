<template>
  <v-card-text class="py-4 h-100 d-flex flex-column">
    <v-form class="h-100 d-flex flex-column" @submit.prevent="register">
      <div>
        <v-text-field v-model="username" label="Username" />
        <v-text-field v-model="email" label="Email" />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
        >
          <template #append-inner>
            <v-btn tabindex="-1" icon variant="text" @click="toggleShowPassword">
              <v-icon size="small">
                {{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off' }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          :type="showConfirmPassword ? 'text' : 'password'"
        >
          <template #append-inner>
            <v-btn tabindex="-1" icon variant="text" @click="toggleShowConfirmPassword">
              <v-icon size="small">
                {{ showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off' }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>
      <div class="flex-grow-1"></div>
      <v-btn type="submit" variant="elevated" block :loading="authStore.isLoading">
        Create Account
      </v-btn>
    </v-form>
    <div v-if="errorMsg" class="mt-2" style="color: red">❌ {{ errorMsg }}</div>
  </v-card-text>
</template>

<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth'

  const emit = defineEmits(['success'])
  const authStore = useAuthStore()

  const username = ref('')
  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const errorMsg = ref<string | null>(null)

  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  function toggleShowPassword() {
    showPassword.value = !showPassword.value
  }

  function toggleShowConfirmPassword() {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  async function register() {
    try {
      if (password.value !== confirmPassword.value) {
        return (errorMsg.value = 'Passwords do not match!')
      }
      await authStore.register(username.value, email.value, password.value)
      emit('success')
    } catch (error: any) {
      errorMsg.value = error.response?.data?.message || 'Registration failed'
    }
  }
</script>
