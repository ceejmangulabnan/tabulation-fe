<template>
  <form ref="formRef" class="flex flex-col gap-4" @submit.prevent="register">
    <UInput
      v-model="newUser.name"
      label="Name"
      placeholder="Enter your full name"
      autofocus
    />

    <UInput
      v-model="newUser.username"
      label="Username"
      placeholder="Choose a username"
    />

    <UInput
      v-model="newUser.email"
      label="Email"
      type="email"
      placeholder="Enter your email"
    />

    <UInput
      v-model="newUser.password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="Create a password"
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

    <UInput
      v-model="newUser.confirmPassword"
      label="Confirm Password"
      :type="showConfirmPassword ? 'text' : 'password'"
      placeholder="Confirm your password"
      :ui="{ trailing: 'pe-1' }"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          :icon="showConfirmPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          :padded="false"
          aria-label="Toggle password visibility"
          @click="showConfirmPassword = !showConfirmPassword"
        />
      </template>
    </UInput>

    <div v-if="errorMsg" class="text-sm text-error">
      {{ errorMsg }}
    </div>

    <UButton
      type="submit"
      label="Create Account"
      block
      :loading="authStore.isLoading"
    />
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(['success'])
const authStore = useAuthStore()
const { showSnackbar } = useSnackbar()

const newUser = ref({ name: '', username: '', email: '', password: '', confirmPassword: '' })
const errorMsg = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

async function register() {
  if (!newUser.value.name || !newUser.value.username || !newUser.value.password) {
    errorMsg.value = 'Please fill in all required fields'
    return
  }
  if (newUser.value.password !== newUser.value.confirmPassword) {
    errorMsg.value = 'Passwords do not match'
    return
  }
  if (newUser.value.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters'
    return
  }

  try {
    await authStore.register(
      newUser.value.name,
      newUser.value.username,
      newUser.value.password,
      newUser.value.email,
    )
    emit('success')
    showSnackbar('User registered successfully!', 'success')
  } catch (error: any) {
    showSnackbar('Failed to register user', 'error')
    errorMsg.value = error.response?.data?.message || 'Registration failed'
  }
}
</script>
