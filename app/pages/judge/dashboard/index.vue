<script setup lang="ts">
definePageMeta({
  middleware: ['judge'],
  layout: 'judge',
})
</script>

<template>
  <div class="mx-6 my-2 flex flex-col gap-10">
    <div class="mb-6">
      <h1>Judge Dashboard</h1>
      <p class="text-muted">Manage your scoring assignments and view your active events</p>
    </div>
    <EventList />
  </div>
</template>
