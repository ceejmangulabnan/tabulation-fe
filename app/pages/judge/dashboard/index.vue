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
    Judge View
    <DashboardDataTable />
  </div>
</template>
