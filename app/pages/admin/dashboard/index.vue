<script setup lang="ts">
definePageMeta({
  middleware: ['admin', 'auth'],
  layout: 'admin',
})
const authStore = useAuthStore()
console.log('User', authStore.user)
</script>

<template>
  <div class="my-2 mx-6 d-flex flex-column ga-10">
    <div class="mb-6">
      <h1>Admin Dashboard</h1>
      <p class="text-subtitle">Overview of your pageant system and pending actions</p>
    </div>
    <AdminEventList />
    <AdminEventRequestTable />
    <AdminQuickActions />
  </div>
</template>
