<script setup lang="ts">
definePageMeta({
  middleware: ['admin', 'auth'],
  layout: 'admin',
})
const authStore = useAuthStore()
console.log('User', authStore.user)
</script>

<template>
  <div>Admin View - Events</div>
</template>
