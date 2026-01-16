<template>
  <v-container>
    <v-row v-if="event">
      <v-col cols="12">
        <header class="d-flex flex-column ga-sm-4 align-start ga-1 flex-sm-row mb-8">
          <v-chip
            :color="statusColor"
            size="large"
            class="font-weight-bold flex-shrink-0"
          >
            {{ event?.event_status.toUpperCase() }}
          </v-chip>
          <div>
            <h1 class="text-h4 mb-2 mb-sm-0">
              {{ event?.name }}
            </h1>
            <p>
              {{ event?.description || 'No description provided.' }}
            </p>
          </div>
        </header>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Participant Scores</span>
            <v-chip
              color="primary"
              variant="flat"
            >
              My Judge ID: {{ judgeId }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="scoreTableHeaders"
              :items="participantsWithScores"
              item-key="id"
              class="elevation-1"
              :loading="eventsStore.isLoading"
            >
              <template #item.name="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar
                    v-if="item.headshot?.formats?.thumbnail?.url"
                    :image="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                    icon="mdi-account"
                    class="mr-3"
                    size="40"
                  />
                  <v-avatar
                    v-else
                    icon="mdi-account"
                    class="mr-3"
                    size="40"
                  />
                  <div class="font-weight-bold">{{ item.name }}</div>
                </div>
              </template>

              <template
                v-for="header in categoryHeaders"
                #[`item.${header.value}`]="{ item }"
              >
                <div
                  :key="header.value"
                  class="my-2"
                >
                  <v-text-field
                    v-model.number="item.scores[header.categoryId]"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @change="
                      (value) =>
                        handleScoreChange(item.id, header.categoryId, header.segmentId, value)
                    "
                  />
                </div>
              </template>

              <template #no-data>
                <div class="pa-4 text-center">No participants found for this event.</div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['judge', 'auth'],
  layout: 'judge',
})

const route = useRoute()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const { showSnackbar } = useSnackbar()
const api = useStrapiApi()

const eventId = route.params.id as string
const event = computed(() => eventsStore.event)
const judgeId = computed(() => authStore.user?.judge?.id)

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

onMounted(async () => {
  await eventsStore.fetchEvent(eventId)
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

const activeSegments = computed(() => {
  return event.value?.segments?.filter((s) => s.segment_status === 'active') || []
})

const categoryHeaders = computed(() => {
  if (!activeSegments.value) return []
  return activeSegments.value.flatMap((segment) =>
    segment.categories
      ? segment.categories.map((category) => ({
          title: `${segment.name} - ${category.name} (${category.weight * 100}%)`,
          value: `category_${category.id}`,
          categoryId: category.id,
          segmentId: segment.id,
          sortable: false,
          align: 'center',
        }))
      : []
  )
})

const scoreTableHeaders = computed(() => {
  return [
    { title: 'No.', value: 'number', sortable: true, width: '10' },
    { title: 'Name', value: 'name', sortable: true, width: '250' },
    ...categoryHeaders.value,
  ]
})

const participantsWithScores = computed(() => {
  if (!event.value?.participants || !judgeId.value) return []

  return event.value.participants
    .map((participant) => {
      const scores: { [key: string]: number | undefined | null } = {}
      if (activeSegments.value) {
        activeSegments.value.forEach((segment) => {
          segment.categories?.forEach((category) => {
            const score = event.value?.scores?.find(
              (s) =>
                s.participant?.id === participant.id &&
                s.category?.id === category.id &&
                s.judge?.id === judgeId.value
            )
            scores[`category_${category.id}`] = score?.value
          })
        })
      }

      return {
        ...participant,
        scores,
      }
    })
    .sort((a, b) => a.number - b.number)
})

async function handleScoreChange(
  participantId: number,
  categoryId: number,
  segmentId: number,
  value: any
) {
  if (!judgeId.value) return

  const scoreValue = value ? parseFloat(value) : null
  const existingScore = event.value?.scores?.find(
    (s) =>
      s.participant?.id === participantId &&
      s.category?.id === categoryId &&
      s.judge?.id === judgeId.value
  )

  try {
    if (existingScore) {
      if (scoreValue === null || isNaN(scoreValue)) {
        // Delete score
        await api.delete(`/scores/${existingScore.documentId}`)
        showSnackbar('Score deleted successfully!', 'success')
      } else {
        // Update score
        await api.put(`/scores/${existingScore.documentId}`, {
          data: { value: scoreValue },
        })
        showSnackbar('Score updated successfully!', 'success')
      }
    } else if (scoreValue !== null && !isNaN(scoreValue)) {
      // Create score
      await api.post('/scores', {
        data: {
          value: scoreValue,
          participant: participantId,
          category: categoryId,
          judge: judgeId.value,
          event: eventId,
          segment: segmentId,
        },
      })
      showSnackbar('Score saved successfully!', 'success')
    }
    // Refresh event data to get the latest scores
    await eventsStore.fetchEvent(eventId)
  } catch (error) {
    console.error('Failed to save score:', error)
    showSnackbar('Failed to save score.', 'error')
  }
}
</script>
