<template>
  <v-card width="400" class="py-4 d-flex flex-column">
    <v-card-item>
      <v-card-title class="text-center">Login</v-card-title>
    </v-card-item>

    <v-card-text class="d-flex flex-column flex-grow-1">
      <v-form class="d-flex flex-column flex-grow-1 justify-space-between" @submit.prevent="login">
        <div>
          <v-text-field ref="usernameField" v-model="username" label="Username" />
          <v-text-field v-model="password" label="Password" type="password" />
        </div>

        <v-btn
          class="mt-4 flex-grow-0"
          type="submit"
          variant="elevated"
          block
          :loading="authStore.isLoading"
        >
          Submit
        </v-btn>
      </v-form>

      <div v-if="errorMsg" class="mt-2" style="color: red">❌ {{ errorMsg }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth'

  const emit = defineEmits(['success'])
  const authStore = useAuthStore()

  const username = ref('')
  const password = ref('')
  const errorMsg = ref<string | null>(null)

  const usernameField = ref()

  async function login() {
    try {
      await authStore.login(username.value, password.value)
      emit('success')
    } catch (error) {
      errorMsg.value = error.response?.data?.message || 'Login failed'
    }
  }
</script>
