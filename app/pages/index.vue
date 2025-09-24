<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
  })

  const { loggedIn, user, session, clear } = useUserSession()
</script>

<template>
  <div class="d-flex align-stretch justify-between ga-10">
    <AuthRegisterForm />
    <AuthLoginForm />
    <div v-if="loggedIn">
      <h1>Welcome {{ user.username }} {{ user.email }}!</h1>
      <p>Logged in since {{ session.loggedInAt }}</p>
      <button @click="clear">Logout</button>
    </div>
    <div v-else>
      <h1>Not logged in</h1>
    </div>
  </div>
</template>
