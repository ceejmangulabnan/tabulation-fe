<template>
  <v-card width="400" class="py-4 h-100">
    <v-card-item>
      <v-card-title class="text-center">Register</v-card-title>
      <v-card-text class="py-4 h-100 d-flex flex-column">
        <div v-if="!errorMsg">
          <v-form class="h-100 d-flex flex-column" @submit.prevent="register">
            <div>
              <v-text-field v-model="username" label="Username" />
              <v-text-field v-model="email" label="Email" />
              <v-text-field v-model="password" label="Password" type="password" />
            </div>
            <div class="flex-grow-1"></div>
            <v-btn type="submit" variant="elevated" block :loading="authStore.isLoading">
              Submit
            </v-btn>
          </v-form>
        </div>
        <div v-if="errorMsg" style="color: red">❌ {{ errorMsg }}</div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth'

  const emit = defineEmits(['success'])
  const authStore = useAuthStore()

  const username = ref('')
  const email = ref('')
  const password = ref('')
  const errorMsg = ref<string | null>(null)

  async function register() {
    try {
      await authStore.register(username.value, email.value, password.value)
      emit('success')
    } catch (error: any) {
      errorMsg.value = error.response?.data?.message || 'Registration failed'
    }
  }
</script>
