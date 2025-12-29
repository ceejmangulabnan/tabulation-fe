<template>
  <div>
    Admin Event Details Page
    <NuxtLink :to="`/admin/event/${eventId}/setup`">
      <v-btn>Go to Setup</v-btn>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const eventId = route.params.id as string
</script>
