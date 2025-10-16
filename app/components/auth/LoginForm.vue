<template>
  <v-card-text class="d-flex flex-column flex-grow-1">
    <v-form class="d-flex flex-column flex-grow-1 justify-space-between" @submit.prevent="login">
      <div>
        <v-text-field ref="usernameField" v-model="username" label="Username" />
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
      </div>

      <v-btn
        class="mt-4 flex-grow-0"
        type="submit"
        variant="elevated"
        block
        :loading="authStore.isLoading"
      >
        Sign In
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
  const password = ref('')
  const errorMsg = ref<string | null>(null)
  const showPassword = ref(false)

  function toggleShowPassword() {
    showPassword.value = !showPassword.value
  }

  const usernameField = ref()

  async function login() {
    try {
      await authStore.login(username.value, password.value)
      emit('success')
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      errorMsg.value = err.response?.data?.message || 'Login failed'
    }
  }
</script>
