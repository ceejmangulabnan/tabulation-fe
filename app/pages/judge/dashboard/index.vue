<script setup lang="ts">
  definePageMeta({
    middleware: ['admin', 'auth'],
    layout: 'judge',
  })
  const authStore = useAuthStore()

  console.log('User', authStore.user)
</script>

<template>
  <div>
    <div class="bg-yellow text-black text-center">Judge View</div>
    <EventList />
  </div>
</template>
