<template>
  <div class="text-center">
    <h1 class="text-h3 my-4">Tabulation App</h1>
    <div v-if="formType === 'login'">
      <AuthLoginForm @success="onAuthSuccess" />
      <p class="my-4">
        Don't have an account?
        <a href="#" class="text-green" @click.prevent="toggleForm('register')">Register</a>
      </p>
    </div>
    <div v-else>
      <AuthRegisterForm @success="onAuthSuccess" />
      <p class="my-4">
        Already have an account?
        <a href="#" class="text-green" @click.prevent="toggleForm('login')">Login</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
    middleware: 'guest',
  })

  const formType = ref('login')

  function toggleForm(type: 'login' | 'register') {
    formType.value = type
  }

  function onAuthSuccess() {
    navigateTo('/dashboard')
  }
</script>
