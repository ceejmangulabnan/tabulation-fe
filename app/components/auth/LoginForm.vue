<template>
  <v-card width="400" class="py-4">
    <v-card-item>
      <v-card-title class="text-center">Login</v-card-title>
      <v-card-text class="py-4 gap-10">
        <v-form @submit.prevent="login">
          <v-text-field ref="usernameField" v-model="username" focused label="Username" />
          <v-text-field v-model="password" label="Password" type="password" />
          <v-btn type="submit" variant="elevated" block>Submit</v-btn>
        </v-form>

        <div v-if="result">
          ✅ Registered Usere{{ result.user.username }}
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
  const password = ref('')
  const errorMsg = ref()
  const result = ref()

  const usernameField = ref()

  async function login() {
    try {
      result.value = await $fetch('/api/auth/local', {
        method: 'POST',
        body: {
          identifier: username.value,
          password: password.value,
        },
      })
    } catch (error) {
      errorMsg.value = error?.data?.error?.message || 'Login failed'
    }
  }

  watch(result, () => {
    console.log(result.value)
  })
</script>
