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

        <v-btn class="mt-4 flex-grow-0" type="submit" variant="elevated" block>Submit</v-btn>
      </v-form>

      <div v-if="errorMsg" class="mt-2" style="color: red">❌ {{ errorMsg }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  const emit = defineEmits(['success'])
  const { loggedIn } = useUserSession()
  const username = ref('')
  const password = ref('')
  const errorMsg = ref()
  const result = ref()

  const usernameField = ref()

  async function login() {
    try {
      result.value = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          identifier: username.value,
          password: password.value,
        },
      })
      emit('success')
    } catch (error) {
      errorMsg.value = error?.data?.error?.message || 'Login failed'
    }
  }
</script>
