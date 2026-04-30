<template>
  <v-card-text class="d-flex flex-column flex-grow-1">
    <v-form
      class="d-flex flex-column flex-grow-1 justify-space-between"
      @submit.prevent="login"
    >
      <div>
        <v-text-field
          ref="usernameField"
          v-model="user.username"
          label="Username"
          :autofocus="true"
          :rules="requiredRule"
        />
        <v-text-field
          v-model="user.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :rules="requiredRule"
        >
          <template #append-inner>
            <v-btn
              tabindex="-1"
              icon
              variant="text"
              @click="toggleShowPassword"
            >
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
        color="green"
        block
        :loading="authStore.isLoading"
      >
        Sign In
      </v-btn>
    </v-form>

    <div
      v-if="errorMsg"
      class="mt-2"
      style="color: red"
    >
      ❌ {{ errorMsg }}
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits(['success'])
const authStore = useAuthStore()
const { showSnackbar } = useSnackbar()

const user = ref({ username: '', password: '' })
const errorMsg = ref<string | null>(null)
const showPassword = ref(false)

const requiredRule = [(v: string) => !!v || 'Field is required']
function toggleShowPassword() {
  showPassword.value = !showPassword.value
}

async function login() {
  try {
    await authStore.login(user.value.username, user.value.password)
    emit('success')
    showSnackbar('User signed in successfully!', 'success')
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || 'Login failed'
    showSnackbar(`User sign in failed`, 'error')
  }
}
</script>
