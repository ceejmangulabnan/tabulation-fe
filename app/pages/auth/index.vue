<template>
  <div class="text-center pb-10">
    <img
      src="/logo.png"
      alt="Logo"
      class="mx-auto mb-4 h-[200px] object-contain"
    />
    <h1 class="text-2xl font-bold text-default">Welcome Back</h1>
    <p class="mb-6 px-8 text-muted">Sign in to access your account</p>

    <UCard class="mx-auto w-full max-w-[400px]">
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        class="mb-4"
      />

      <div v-if="activeTab === 'sign-in'">
        <AuthLoginForm @success="onAuthSuccess" />
      </div>
      <div v-else>
        <AuthRegisterForm @success="onAuthSuccess" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  middleware: 'guest',
})

const route = useRoute()

const tabItems = [
  { label: 'Sign In', value: 'sign-in' },
  { label: 'Sign Up', value: 'sign-up' },
]

const initialTab = route.query.initialTab
const activeTab = ref(initialTab === 'sign-up' ? 'sign-up' : 'sign-in')
function onAuthSuccess() {
  navigateTo('/admin/dashboard')
}
</script>
