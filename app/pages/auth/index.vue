<template>
  <div class="text-center pb-10">
    <v-img
      src="/logo.png"
      max-width="200px"
      class="mx-auto"
    ></v-img>
    <h1
      :class="[
        'text-h4',
        'font-weight-bold',
        theme.current === 'light' ? 'text-grey-darken-4' : 'text-white',
      ]"
    >
      Welcome Back
    </h1>
    <p
      :class="[
        'text-body',
        'px-8',
        'mb-6',
        theme.current === 'light' ? 'text-grey-darken-3' : 'text-white',
      ]"
    >
      Sign in to access your account
    </p>
    <v-card
      width="400"
      class="py-4 d-flex flex-column rounded-xl"
      elevation="0"
      :class="theme.current === 'light' ? 'glassmorphism-light' : 'glassmorphism-dark'"
    >
      <v-card-item>
        <v-card-title>
          <div
            class="d-flex mb-2 position-relative"
            style="height: 40px"
          >
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
    <Snackbar />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  middleware: 'guest',
})
type Tab = 'Sign In' | 'Sign Up'
const tabs: Tab[] = ['Sign In', 'Sign Up']

const route = useRoute()
const initialTab = route.query.initialTab
const activeTab = ref<Tab>('Sign In')
if (initialTab && tabs.includes(initialTab as Tab)) {
  activeTab.value = initialTab as Tab
}

const theme = useThemeStore()
const isDark = computed(() => theme.current === 'dark')
const activeColor = computed(() => (isDark.value ? 'white' : 'black'))
const inactiveColor = computed(() => (isDark.value ? 'grey-lighten-1' : 'grey-darken-1'))
const underlineColor = computed(() => (isDark.value ? 'white' : 'black'))

function onAuthSuccess() {
  navigateTo('/admin/dashboard')
}
</script>

<style scoped>
.glassmorphism-light {
  background: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.glassmorphism-dark {
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
