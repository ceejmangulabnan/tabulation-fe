<template>
  <div class="my-2 mx-6 d-flex flex-column ga-10">
    <div class="mb-6">
      <h1>Your Events</h1>
      <p class="text-subtitle">List of events you are assigned to as a judge.</p>
    </div>

    <EventList />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'judge',
})
</script>
