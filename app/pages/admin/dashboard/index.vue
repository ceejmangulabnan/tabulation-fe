<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})
</script>

<template>
  <div class="mx-6 my-2 flex flex-col gap-6">
    <div class="mb-6">
      <h1 class="my-0">Admin Dashboard</h1>
      <p class="my-0 text-muted">Overview of your pageant system and pending actions</p>
    </div>
    <AdminEventList />
  </div>
</template>
