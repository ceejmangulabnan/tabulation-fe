<template>
  <v-card-text class="py-4 h-100 d-flex flex-column">
    <v-form
      ref="formRef"
      class="h-100 d-flex flex-column"
      @submit.prevent="register"
    >
      <div>
        <v-text-field
          v-model="newUser.name"
          label="Name"
          :rules="requiredRule"
          :autofocus="true"
        />
        <v-text-field
          v-model="newUser.username"
          label="Username"
          :rules="requiredRule"
        />
        <v-text-field
          v-model="newUser.email"
          label="Email"
          :rules="[...emailRule, ...requiredRule]"
        />
        <v-text-field
          v-model="newUser.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :rules="[...requiredRule, ...passwordLengthRule]"
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

        <v-text-field
          v-model="newUser.confirmPassword"
          label="Confirm Password"
          :type="showConfirmPassword ? 'text' : 'password'"
          :rules="[...requiredRule, ...passwordLengthRule, ...passwordMatchRule]"
        >
          <template #append-inner>
            <v-btn
              tabindex="-1"
              icon
              variant="text"
              @click="toggleShowConfirmPassword"
            >
              <v-icon size="small">
                {{ showConfirmPassword ? 'mdi-eye-outline' : 'mdi-eye-off' }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>
      <div class="flex-grow-1"></div>
      <v-btn
        class="mt-4"
        type="submit"
        variant="elevated"
        block
        :loading="authStore.isLoading"
      >
        Create Account
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
const emit = defineEmits(['success'])
const authStore = useAuthStore()
const { showSnackbar } = useSnackbar()

// const username = ref('')
// const email = ref('')
// const password = ref('')
// const confirmPassword = ref('')

const formRef = ref<HTMLFormElement | null>(null)
const newUser = ref({ name: '', username: '', email: '', password: '', confirmPassword: '' })

const errorMsg = ref<string | null>(null)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const requiredRule = [(v: string) => !!v || 'Field is required']
const emailRule = [(v: string) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid']
const passwordLengthRule = [
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
]
const passwordMatchRule = [(v: string) => v === newUser.value.password || 'Passwords do not match']

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}

function toggleShowConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value
}

async function register() {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const response = await authStore.register(
      newUser.value.name,
      newUser.value.username,
      newUser.value.password,
      newUser.value.email
    )
    emit('success')
    showSnackbar('User registered successfully!', 'success')
    console.log('Register Response', response)
  } catch (error: any) {
    showSnackbar(`Failed to register user: `, 'error')
    errorMsg.value = error.response?.data?.message || 'Registration failed'
  }
}
</script>
