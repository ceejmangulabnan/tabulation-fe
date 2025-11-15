<template>
  <v-card
    hover
    class="d-flex flex-column w-100 ma-2 pa-2 rounded-xl"
    @click="router.push(`/judge/event/${event.id}`)"
  >
    <v-card-item>
      <v-card-title>{{ event?.name }}</v-card-title>
    </v-card-item>
    <v-card-text>
      <p>{{ event.description }}</p>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions class="d-flex ml-auto">
      <v-btn variant="tonal">View Details</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const { event } = defineProps<{
  event: EventData
}>()
const router = useRouter()
</script>

<style scoped></style>
