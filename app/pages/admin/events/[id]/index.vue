<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4 flex-wrap">
          <h1 class="text-h4 mb-2 mb-sm-0">Event Dashboard: {{ event?.name }}</h1>
          <div class="d-flex">
            <NuxtLink
              :to="`/admin/events/${eventId}/manage`"
              class="mr-2"
            >
              <v-btn color="blue">Manage Event</v-btn>
            </NuxtLink>
            <NuxtLink :to="`/admin/events/${eventId}/setup`">
              <v-btn color="green">Go to Setup</v-btn>
            </NuxtLink>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Event Info & Status -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card>
          <v-card-title>Event Information</v-card-title>
          <v-card-text>
            <p>
              <strong>Status:</strong>
              <v-chip
                :color="statusColor"
                size="small"
              >
                {{ event?.event_status }}
              </v-chip>
            </p>
            <p class="mt-2">
              <strong>Description:</strong>
              {{ event?.description || 'No description provided.' }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Segment Status -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card>
          <v-card-title>Segment Status</v-card-title>
          <v-card-text>
            <div v-if="event?.segments?.length">
              <p>Total Segments: {{ event.segments.length }}</p>
              <div
                v-for="segment in event.segments"
                :key="segment.id"
                class="mb-1"
              >
                <strong>{{ segment.name }}</strong>
                ({{ segment.weight * 100 }}%) - {{ segment.categories?.length || 0 }} categories
              </div>
              <p class="mt-2 font-weight-bold">Total Weight: {{ totalSegmentWeight }} / 100</p>
            </div>
            <p v-else>No segments configured.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Judges -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card>
          <v-card-title>Assigned Judges ({{ event?.judges?.length || 0 }})</v-card-title>
          <v-list lines="one">
            <v-list-item
              v-if="!event?.judges?.length"
              class="text-grey-darken-1"
            >
              No judges assigned.
            </v-list-item>
            <v-list-item
              v-for="judge in event?.judges"
              :key="judge.id"
              :title="judge.name"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Participants -->
      <v-col
        md="6"
        cols="12"
      >
        <v-card>
          <v-card-title>Participants ({{ event?.participants?.length || 0 }})</v-card-title>
          <v-list lines="one">
            <v-list-item
              v-if="!event?.participants?.length"
              class="text-grey-darken-1"
            >
              No participants registered.
            </v-list-item>
            <v-list-item
              v-for="participant in event?.participants"
              :key="participant.id"
              :title="participant.name"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Judge Requests -->
      <v-col cols="12">
        <v-card>
          <v-card-title>Judge Requests</v-card-title>
          <AdminEventRequestTable
            :requests="judgeRequests"
            @request-updated="fetchJudgeRequests"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useEventsStore } from '~/stores/events'
import { useJudgeRequestsStore } from '~/stores/judge-requests'

const route = useRoute()
const eventsStore = useEventsStore()
const judgeRequestsStore = useJudgeRequestsStore()

const eventId = route.params.id as string

const event = computed(() => eventsStore.event)
const judgeRequests = computed(() => judgeRequestsStore.judgeRequests)

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
  // await fetchJudgeRequests()
})

const statusColor = computed(() => {
  switch (event.value?.event_status) {
    case 'draft':
      return 'grey'
    case 'active':
      return 'green'
    case 'inactive':
      return 'orange'
    case 'finished':
      return 'blue'
    default:
      return 'grey'
  }
})

const totalSegmentWeight = computed(() => {
  if (!event.value?.segments) return 0
  return event.value.segments.reduce((sum, s) => sum + s.weight * 100, 0)
})
</script>
