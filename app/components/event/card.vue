<template>
  <v-card class="ma-5 w-20">
    <v-card-item>
      <v-card-title>{{ event?.name }}</v-card-title>
    </v-card-item>
    <v-card-text>
      <p>{{ event.description }}</p>
      <v-card-actions>
        <v-btn variant="tonal">Register</v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  const { event } = defineProps<{
    event: EventData
  }>()
</script>

<style scoped></style>
