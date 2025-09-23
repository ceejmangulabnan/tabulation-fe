<template>
  <v-card width="400" class="py-4 h-100">
    <v-card-item>
      <v-card-title class="text-center">Register</v-card-title>
      <v-card-text class="py-4 h-100 d-flex flex-column">
        <div v-if="!result && !errorMsg">
          <v-form class="h-100 d-flex flex-column" @submit.prevent="register">
            <div>
              <v-text-field v-model="username" focused label="Username" />
              <v-text-field v-model="email" label="Email" />
              <v-text-field v-model="password" label="Password" type="password" />
            </div>
            <div class="flex-grow-1"></div>
            <v-btn type="submit" variant="elevated" block>Submit</v-btn>
          </v-form>
        </div>
        <div v-if="result">
          ✅ Registered User {{ result.user.username }}
          <br />
          🔑 JWT Generated
        </div>
        <div v-if="errorMsg" style="color: red">❌ {{ errorMsg }}</div>
      </v-card-text>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
  const username = ref('')
  const email = ref('')
  const password = ref('')
  const errorMsg = ref()
  const result = ref()

  async function register() {
    try {
      result.value = await $fetch('/api/auth/local/register', {
        method: 'POST',
        body: {
          username: username.value,
          email: email.value,
          password: password.value,
        },
      })
    } catch (error) {
      errorMsg.value = error?.data?.error?.message || 'Registration failed'
    }
  }

  watch(result, () => {
    console.log(result.value)
  })
</script>
