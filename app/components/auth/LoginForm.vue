<template>
  <form
    class="flex flex-col gap-4"
    @submit.prevent="login"
  >
    <UInput
      v-model="user.username"
      label="Username"
      placeholder="Enter your username"
      autofocus
      :rules="[(v: string) => !!v || 'Field is required']"
    />

    <UInput
      v-model="user.password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="Enter your password"
      :ui="{ trailing: 'pe-1' }"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          :padded="false"
          aria-label="Toggle password visibility"
          @click="showPassword = !showPassword"
        />
      </template>
    </UInput>

    <div
      v-if="errorMsg"
      class="text-sm text-error"
    >
      {{ errorMsg }}
    </div>

    <UButton
      type="submit"
      label="Sign In"
      block
      :loading="authStore.isLoading"
    />
  </form>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits(['success'])
const authStore = useAuthStore()
const { showSnackbar } = useSnackbar()

const user = ref({ username: '', password: '' })
const errorMsg = ref<string | null>(null)
const showPassword = ref(false)

async function login() {
  try {
    await authStore.login(user.value.username, user.value.password)
    emit('success')
    showSnackbar('User signed in successfully!', 'success')
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || 'Login failed'
    showSnackbar('User sign in failed', 'error')
  }
}
</script>
