<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>All Events</h2>
      <span>
        {{
          eventsStore.events.length == 1
            ? `${eventsStore.events.length} event`
            : `${eventsStore.events.length} events`
        }}
      </span>
    </div>

    <v-row
      v-if="eventsStore.isLoading"
      no-gutters
    >
      <v-col
        v-for="n in 3"
        :key="n"
        cols="12"
        sm="6"
        md="4"
        class="d-flex"
      >
        <EventCardSkeleton />
      </v-col>
    </v-row>

    <v-row
      v-else-if="eventsStore.events.length > 0"
      no-gutters
    >
      <v-col
        v-for="(event, i) in eventsStore.events"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        class="d-flex"
      >
        <EventCard :event="event" />
      </v-col>
    </v-row>

    <v-sheet
      v-else
      class="d-flex justify-center align-center pa-16 rounded-xl border-sm my-4"
    >
      <p class="text-h6">No active events</p>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
const eventsStore = useEventsStore()
await eventsStore.fetchEvents()
</script>
