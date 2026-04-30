<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})
</script>

<template>
  <div class="my-2 mx-6 d-flex flex-column ga-6">
    <div class="mb-6">
      <h1 class="my-0">Admin Dashboard</h1>
      <p class="my-0 text-subtitle">Overview of your pageant system and pending actions</p>
    </div>
    <AdminEventList />
    <!-- <AdminEventRequestTable /> -->
    <!-- <AdminQuickActions /> -->
  </div>
</template>
