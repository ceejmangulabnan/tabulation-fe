<script setup lang="ts">
definePageMeta({
  middleware: ['judge'],
  layout: 'judge',
})
</script>

<template>
  <div class="my-2 mx-6 d-flex flex-column ga-10">
    <div class="mb-6">
      <h1>Judge Dashboard</h1>
      <p class="text-subtitle">Manage your scoring assignments and view your active events</p>
    </div>
    <EventList />
    <!-- <EventRequestListTable /> -->
    <!-- <EventQuickActions /> -->
  </div>
</template>
