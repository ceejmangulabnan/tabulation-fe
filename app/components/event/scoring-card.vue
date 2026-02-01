<template>
  <v-card flat>
    <v-card-text>
      <v-tabs
        v-model="activeGenderTab"
        background-color="secondary"
        show-arrows
        dark
      >
        <v-tab
          v-for="gender in genders"
          :key="gender.key"
          :value="gender.key"
        >
          {{ gender.label }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeGenderTab">
        <v-window-item
          v-for="gender in genders"
          :key="gender.key"
          :value="gender.key"
        >
          <v-form>
            <v-data-table
              v-if="!smAndDown"
              :headers="getTableHeaders(segment)"
              :items="getParticipantsByGender(gender.key, segment)"
              item-value="id"
              class="elevation-1"
              :loading="isLoading"
              :readonly="
                segment.segment_status === 'inactive' || segment.segment_status === 'closed'
              "
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
                  <v-chip
                    v-if="
                      segment.segment_status === 'closed' &&
                      item.participant_status === 'eliminated' &&
                      item.eliminated_at_segment?.id === segment.id
                    "
                    color="red"
                    class="ml-2"
                    size="small"
                    label
                  >
                    Eliminated
                  </v-chip>
                </div>
              </template>

              <template #item.department="{ item }">
                {{ item.department?.name || 'N/A' }}
              </template>

              <template
                v-for="category in getActiveCategories(segment)"
                :key="category.id"
                #[`item.category_${category.id}`]="{ item }"
              >
                <div class="my-2">
                  <v-text-field
                    v-model.number="item.scores[category.id]"
                    class="flex-shrink-0 score-input"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    :rules="scoreRules"
                    validate-on="input"
                    min="0"
                    max="10"
                    step="0.1"
                    maxlength="4"
                    style="max-width: 80px"
                    :readonly="
                      segment.segment_status === 'closed' || segment.segment_status === 'inactive'
                    "
                    @keydown="blockInvalidKeys"
                  />
                </div>
              </template>

              <template #item.total_score="{ item }">
                <div class="font-weight-bold">
                  {{ calculateTotalScore(item, segment) }}
                </div>
              </template>

              <template #no-data>
                <div class="pa-4 text-center">No participants found for this gender.</div>
              </template>
            </v-data-table>

            <!-- Mobile View -->
            <v-list
              v-else
              lines="three"
            >
              <v-list-item
                v-for="item in getParticipantsByGender(gender.key, segment)"
                :key="item.id"
                class="pa-0"
              >
                <v-card>
                  <v-card-title class="d-flex align-start flex-wrap">
                    <div class="d-flex align-center">
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
                      <div>
                        <div class="font-weight-bold text-wrap text-subtitle-1">
                          {{ item.name }}
                        </div>
                        <div class="text-caption">
                          {{ item.department?.name || 'N/A' }}
                        </div>
                      </div>
                    </div>
                    <v-chip
                      v-if="
                        segment.segment_status === 'closed' &&
                        item.participant_status === 'eliminated' &&
                        item.eliminated_at_segment?.id === segment.id
                      "
                      color="red"
                      class="mt-1 ml-4"
                      label
                    >
                      Eliminated
                    </v-chip>
                  </v-card-title>
                  <v-card-text>
                    <div
                      v-for="category in getActiveCategories(segment)"
                      :key="category.id"
                      align="center"
                      class="d-flex justify-space-between my-2 align-center ga-3 flex-wrap"
                    >
                      <div class="text-subtitle-1">
                        {{ category.name }} ({{ (category.weight * 100).toFixed(0) }}%)
                      </div>
                      <div>
                        <v-text-field
                          align="end"
                          class="ml-auto flex-shrink-0 score-input"
                          v-model.number="item.scores[category.id]"
                          type="number"
                          variant="outlined"
                          density="compact"
                          hide-details="auto"
                          :rules="scoreRules"
                          validate-on="input"
                          min="0"
                          max="10"
                          step="0.1"
                          maxlength="4"
                          style="max-width: 80px"
                          :readonly="segment.segment_status === 'closed'"
                        />
                      </div>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <span class="font-weight-bold text-sm-subtitle-1 text-body-1">
                      Segment Score: {{ calculateTotalScore(item, segment) }} / 100
                    </span>
                  </v-card-actions>
                </v-card>
              </v-list-item>
            </v-list>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        v-if="segment.segment_status !== 'closed'"
        color="primary"
        variant="flat"
        class="text-wrap"
        @click="submitScores(segment)"
        :loading="isLoading"
      >
        Submit Scores for {{ segment.name }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
type ParticipantScoreMap = Record<number, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const props = defineProps<{
  isAdmin: boolean
  segment: SegmentData
  event: EventData
  participants: ParticipantWithScores[]
  judgeId: number
}>()

const emit = defineEmits(['scores-submitted'])

const scoreRules = [
  (v: number | string | null | undefined) => {
    if (v === null || v === undefined || v === '') return true
    const str = String(v)
    if (!/^\d+(\.\d+)?$/.test(str)) {
      return 'Invalid score'
    }
    const num = Number(str)
    if (num < 0 || num > 10) {
      return 'Score must be between 0 and 10'
    }
    return true
  },
]

const { smAndDown } = useDisplay()
const { showSnackbar } = useSnackbar()
const api = useStrapiApi()
const isLoading = ref<boolean>(false)

// For form validation
const formRefs = ref<Record<string, HTMLFormElement | null>>({})

const activeGenderTab = ref<string>('male')

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

const genders = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
]

function getActiveCategories(segment: SegmentData) {
  if (!segment.categories) {
    return []
  }

  if (props.isAdmin) return segment.categories

  return segment.categories.filter((category) => category.active)
}

function getTableHeaders(segment: SegmentData) {
  const categoryHeaders =
    getActiveCategories(segment).map((category: CategoryData) => ({
      title: `${category.name} (${category.weight * 100}%)`,
      value: `category_${category.id}`,
      sortable: false,
    })) || []

  return [
    { title: 'No.', value: 'number', sortable: true, width: '10' },
    { title: 'Name', value: 'name', sortable: true, width: '250' },
    { title: 'Department', value: 'department', sortable: true },
    ...categoryHeaders,
    { title: 'Total Score', value: 'total_score', sortable: false, width: '120' },
  ]
}

function getParticipantsByGender(gender: string, segment: SegmentData) {
  const genderFiltered = props.participants.filter((p) => p.gender === gender)

  if (segment.segment_status === 'closed') {
    return genderFiltered.sort((a, b) => {
      const scoreA = parseFloat(calculateTotalScore(a, segment))
      const scoreB = parseFloat(calculateTotalScore(b, segment))
      return scoreB - scoreA
    })
  }
  return genderFiltered
    .filter((p) => p.participant_status !== 'eliminated')
    .sort((a, b) => a.number - b.number)
}

function calculateTotalScore(participant: ParticipantWithScores, segment: SegmentData): string {
  const total = getActiveCategories(segment).reduce((acc, category) => {
    const score = participant.scores[category.id]
    if (score !== null && score !== undefined && score !== '') {
      return acc + parseFloat(score as string) * category.weight
    }
    return acc
  }, 0)
  const finalTotal = total * 10
  return finalTotal.toFixed(2)
}

function blockInvalidKeys(e: KeyboardEvent) {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']
  if (allowedKeys.includes(e.key)) {
    return
  }
  if (e.key === '.' && !(e.target as HTMLInputElement).value.includes('.')) {
    return
  }
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

async function submitScores(segment: SegmentData) {
  isLoading.value = true

  const currentFormRef = formRefs.value[`${props.segment.id}-${activeGenderTab.value}`]
  if (currentFormRef) {
    const { valid } = await currentFormRef.validate()
    if (!valid) {
      showSnackbar('Please correct the invalid scores before submitting.', 'error')
      isLoading.value = false
      return
    }
  }

  if (!props.judgeId) {
    showSnackbar('Judge ID not found.', 'error')
    isLoading.value = false
    return
  }

  const activeCategories = getActiveCategories(segment)
  const promises = []

  // Create a map for quick lookup of existing scores by participantId-categoryId-judgeId
  const existingScoreMap = new Map<string, ScoreData>()
  props.event?.scores?.forEach((s: ScoreData) => {
    if (s.participant?.id && s.category?.id && s.judge?.id) {
      const key = `${s.participant.id}-${s.category.id}-${s.judge.id}`
      existingScoreMap.set(key, s)
    }
  })

  for (const p of props.participants) {
    for (const category of activeCategories) {
      const scoreValue = p.scores[category.id]
      const key = `${p.id}-${category.id}-${props.judgeId}`
      const existingScore = existingScoreMap.get(key)

      if (existingScore) {
        // Case 1: Existing score found
        if (scoreValue === null || scoreValue === undefined) {
          // If the score is now null/undefined, delete it
          promises.push(api.delete(`/scores/${existingScore.documentId}`))
        } else if (existingScore.value !== scoreValue) {
          // If the score has changed, update it
          promises.push(
            api.put(`/scores/${existingScore.documentId}`, { data: { value: scoreValue } })
          )
        }
        // If existingScore and scoreValue are the same, no action needed
      } else {
        // Case 2: No existing score found
        if (scoreValue !== null && scoreValue !== undefined) {
          // If a new score is provided, create it
          promises.push(
            api.post('/scores', {
              data: {
                value: scoreValue,
                participant: p.id,
                category: category.id,
                judge: props.judgeId,
                event: props.event.documentId,
                segment: segment.id,
              },
            })
          )
        }
        // If no existing score and scoreValue is null/undefined, no action needed
      }
    }
  }

  if (promises.length === 0) {
    showSnackbar('No changes to submit.', 'info')
    isLoading.value = false
    return
  }

  try {
    await Promise.all(promises)
    showSnackbar('Scores submitted successfully!', 'success')
    emit('scores-submitted')
  } catch (error: any) {
    console.error('Failed to submit scores:', error)
    const errorMessage =
      error.response?.data?.error?.message || 'Failed to submit some scores. Please try again.'
    showSnackbar(errorMessage, 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="css" scoped>
.score-input {
  min-width: 100px;
}
</style>
