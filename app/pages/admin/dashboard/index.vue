<script setup lang="ts">
  definePageMeta({
    middleware: ['auth'],
    layout: 'admin',
  })
  const authStore = useAuthStore()
  console.log('User', authStore.user)
</script>

<template>
  <div>
    Admin View
    <DashboardDataTable />
  </div>
</template>
