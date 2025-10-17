<template>
  <div class="text-center">
    <h1 class="text-h4 text-white font-weight-bold">Welcome Back</h1>
    <p class="text-body text-white px-8 mb-6">Sign in to access your account</p>
    <v-card width="400" class="py-4 d-flex flex-column">
      <v-card-item>
        <v-card-title>
          <div class="d-flex mb-2 position-relative" style="height: 40px">
            <v-btn
              v-for="tab in tabs"
              :key="tab"
              variant="text"
              class="flex-grow-1 text-none"
              :color="activeTab === tab ? activeColor : inactiveColor"
              @click="activeTab = tab"
            >
              {{ tab }}
            </v-btn>

            <div
              class="position-absolute bottom-0"
              :style="{
                left: activeTab === 'Sign In' ? '0%' : '50%',
                width: '50%',
                height: '3px',
                background: underlineColor,
                transition: 'left 0.3s ease',
              }"
            />
          </div>
        </v-card-title>
        <div v-if="activeTab === 'Sign In'">
          <AuthLoginForm @success="onAuthSuccess" />
        </div>
        <div v-else>
          <AuthRegisterForm @success="onAuthSuccess" />
        </div>
      </v-card-item>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
    middleware: 'guest',
  })
  type Tab = 'Sign In' | 'Sign Up'
  const tabs: Tab[] = ['Sign In', 'Sign Up']
  const activeTab = ref<Tab>('Sign In')

  const theme = useThemeStore()
  const activeColor = computed(() => (theme.current === 'dark' ? 'white' : 'black'))
  const inactiveColor = computed(() =>
    theme.current === 'dark' ? 'grey-lighten-1' : 'grey-darken-1'
  )
  const underlineColor = computed(() => (theme.current === 'dark' ? 'white' : 'black'))

  function onAuthSuccess() {
    navigateTo('/admin/dashboard')
  }
</script>
