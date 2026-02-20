<template>
  <v-card flat>
    <v-card-text>
      <v-tabs
        v-model="activeGenderTab"
        background-color="secondary"
        color="green"
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
          <v-form @submit.prevent="submitScores(segment)">
            <v-data-table
              v-if="!smAndDown"
              :headers="getTableHeaders(segment)"
              :items="getParticipantsByGender(gender.key, segment)"
              item-value="id"
              class="elevation-1 text-body-1"
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
                    size="80"
                    @click="showImagePreview(item.headshot.url)"
                  />
                  <v-avatar
                    v-else
                    icon="mdi-account"
                    class="mr-3"
                    size="40"
                  />
                  <v-chip
                    v-if="
                      item.participant_status === 'eliminated' &&
                      item.eliminated_at_segment?.documentId === segment.documentId
                    "
                    color="red"
                    class="mr-2"
                    size="small"
                    label
                  >
                    E
                  </v-chip>
                  <div class="font-weight-bold">{{ item.name }}</div>
                </div>
              </template>

              <template #item.department="{ item }">
                {{ item.department?.name || 'N/A' }}
              </template>

              <template
                v-for="category in getActiveCategories(segment)"
                :key="category.documentId"
                #[`item.category_${category.documentId}`]="{ item }"
              >
                <div class="my-2">
                  <span v-if="props.readonly">
                    {{ item.scores[category.documentId] ?? '-' }}
                  </span>
                  <v-text-field
                    v-else
                    v-model.number="item.scores[category.documentId]"
                    class="flex-shrink-0 score-input"
                    type="number"
                    variant="outlined"
                    density="compact"
                    :rules="getScoreRules(category.weight * 100)"
                    validate-on="input"
                    min="0"
                    :max="category.weight * 100"
                    step="1"
                    maxlength="4"
                    style="max-width: 80px"
                    :readonly="
                      category.locked ||
                      segment.segment_status === 'closed' ||
                      segment.segment_status === 'inactive' ||
                      item.participant_status === 'eliminated'
                    "
                    @keydown="blockInvalidKeys"
                  />
                </div>
              </template>

              <template
                #item.total_score="{ item }"
                v-if="isAdmin"
              >
                <div class="font-weight-bold">
                  {{ calculateTotalScore(item, segment) }}
                </div>
              </template>

              <template #no-data>
                <div class="pa-4 text-center">No participants found for this gender.</div>
              </template>

              <template
                v-for="category in getActiveCategories(segment)"
                :key="category.documentId"
                #[`header.category_${category.documentId}`]="{ column }"
              >
                <div class="d-flex ga-2 align-start">
                  <v-icon
                    v-if="category.locked"
                    size="small"
                  >
                    mdi-lock
                  </v-icon>
                  {{ column.title }}
                </div>
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
                        @click="showImagePreview(item.headshot.url)"
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
                        item.participant_status === 'eliminated' &&
                        item.eliminated_at_segment?.documentId === segment.documentId
                      "
                      color="red"
                      class="mt-1 ml-4"
                      label
                    >
                      E
                    </v-chip>
                  </v-card-title>
                  <v-card-text>
                    <div
                      v-for="category in getActiveCategories(segment)"
                      :key="category.documentId"
                      align="center"
                      class="d-flex justify-space-between my-2 align-center ga-3 flex-wrap"
                    >
                      <div class="text-subtitle-1">
                        <v-icon
                          v-if="category.locked"
                          size="small"
                          class="mr-1"
                        >
                          mdi-lock
                        </v-icon>
                        {{ category.name }} ({{ (category.weight * 100).toFixed(0) }}%)
                      </div>
                      <div v-if="props.readonly">
                        <span class="ml-auto font-weight-bold text-subtitle-1">
                          {{ item.scores[category.documentId] ?? '-' }}
                        </span>
                      </div>
                      <div v-else>
                        <v-text-field
                          align="end"
                          class="ml-auto flex-shrink-0 score-input"
                          v-model.number="item.scores[category.documentId]"
                          type="number"
                          variant="outlined"
                          density="compact"
                          :rules="getScoreRules(category.weight * 100)"
                          validate-on="input"
                          min="0"
                          :max="category.weight * 100"
                          step="1"
                          maxlength="4"
                          style="max-width: 80px"
                          :readonly="
                            category.locked ||
                            segment.segment_status === 'closed' ||
                            segment.segment_status === 'inactive' ||
                            item.participant_status === 'eliminated'
                          "
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

            <v-card-actions v-if="!props.readonly">
              <v-spacer />
              <v-btn
                variant="text"
                @click="$emit('cancel-scoring')"
              >
                Cancel
              </v-btn>
              <v-btn
                v-if="segment.segment_status !== 'closed'"
                type="submit"
                color="green"
                variant="flat"
                class="text-wrap"
                :loading="isLoading"
              >
                Submit Scores for {{ segment.name }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>

  <ImagePreviewDialog
    v-model="imagePreviewDialog"
    :image-url="imagePreviewUrl"
  />
</template>

<script setup lang="ts">
type ParticipantScoreMap = Record<string, number | null | undefined>
type ParticipantWithScores = Omit<ParticipantData, 'scores'> & { scores: ParticipantScoreMap }

const imagePreviewDialog = ref(false)
const imagePreviewUrl = ref<string | undefined>('')

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiUrl(url)
  imagePreviewDialog.value = true
}

const props = defineProps<{
  isAdmin: boolean
  segment: SegmentData
  event: EventData
  participants: ParticipantWithScores[]
  judgeId: string
  readonly?: boolean
}>()

const emit = defineEmits(['scores-submitted', 'cancel-scoring', 'refetch-event'])
console.log('Segment in event card props', props.segment)
console.log('Participants in event card props', props.participants)

function getScoreRules(maxScore: number) {
  return [
    (v: number | string | null | undefined) => {
      if (v === null || v === undefined || v === '') return true
      const str = String(v)
      if (!/^\d+(\.\d+)?$/.test(str)) {
        return 'Invalid score'
      }
      const num = Number(str)
      if (num < 0 || num > maxScore) {
        return `Score must be from 0 to ${maxScore}`
      }
      return true
    },
  ]
}

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
]

// Filter scoreable categories based on locked value and active_judges
function getActiveCategories(segment: SegmentData) {
  if (!segment.categories) {
    return []
  }

  const categoriesToProcess = props.isAdmin
    ? segment.categories // If admin, consider all categories from the segment
    : segment.categories.filter((category) => category.active) // If not admin, only consider active categories

  return categoriesToProcess.map((category) => {
    // Check if the current judge is in the category's active_judges list
    const isJudgeAssignedToCategory = category.active_judges?.some(
      (judge) => String(judge.documentId) === String(props.judgeId)
    )

    // A category should be locked if:
    // 1. Its 'locked' property from the backend is true.
    // 2. OR it has active_judges defined, and the current judge is NOT among them.
    //    If active_judges is not defined or is empty, it implies all judges can score (unless category.locked is true).
    const shouldBeLockedBecauseOfJudgeAssignment =
      category.active_judges && category.active_judges.length > 0 && !isJudgeAssignedToCategory

    return {
      ...category,
      // The category is locked if it's explicitly locked from the backend,
      // OR if it has active judges specified and the current judge is not one of them.
      locked: category.locked || shouldBeLockedBecauseOfJudgeAssignment,
    }
  })
}

function getTableHeaders(segment: SegmentData) {
  const staticHeaders = [
    { title: 'No.', value: 'number', sortable: true, width: '10' },
    { title: 'Name', value: 'name', sortable: true, width: '250' },
    { title: 'Department', value: 'department', sortable: true },
  ]

  const categoryHeaders =
    getActiveCategories(segment).map((category: CategoryData) => ({
      title: `${category.name} (${category.weight * 100}%)`,
      value: `category_${category.documentId}`,
      sortable: false,
      locked: category.locked,
    })) || []

  const totalScoreHeaders = {
    title: 'Total Score',
    value: 'total_score',
    align: 'center',
    sortable: false,
    width: '120',
  }

  if (props.isAdmin) {
    return [...staticHeaders, ...categoryHeaders, totalScoreHeaders]
  }

  return [...staticHeaders, ...categoryHeaders]
}

function getParticipantsByGender(gender: string, segment: SegmentData) {
  let genderFiltered = props.participants.filter((p) => p.gender === gender)

  // Filter out participants eliminated in previous segments
  genderFiltered = genderFiltered.filter((p) => {
    if (p.participant_status === 'eliminated' && p.eliminated_at_segment) {
      return p.eliminated_at_segment.order >= segment.order
    }
    return true
  })

  if (segment.segment_status === 'closed') {
    return genderFiltered.sort((a, b) => {
      const scoreA = parseFloat(calculateTotalScore(a, segment))
      const scoreB = parseFloat(calculateTotalScore(b, segment))
      return scoreB - scoreA
    })
  }
  return genderFiltered.sort((a, b) => a.number - b.number)
}

function calculateTotalScore(participant: ParticipantWithScores, segment: SegmentData): string {
  // sum category scores directly (they are already weighted)
  const rawSegmentTotal = getActiveCategories(segment).reduce((acc, category) => {
    const value = participant.scores[category.documentId]

    if (value === null || value === undefined || String(value) === '') {
      return acc
    }

    const score = Number(value)
    if (Number.isNaN(score)) return acc

    return acc + score
  }, 0)

  // apply segment rule
  let finalSegmentScore = rawSegmentTotal

  if (segment.scoring_mode === 'normalized') {
    finalSegmentScore = rawSegmentTotal * segment.weight
  }

  // raw_category → no multiplication

  return finalSegmentScore.toFixed(2)
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
    if (s.participant?.documentId && s.category?.documentId && s.judge?.documentId) {
      const key = `${s.participant.documentId}-${s.category.documentId}-${s.judge.documentId}`
      existingScoreMap.set(key, s)
    }
  })

  for (const p of props.participants) {
    for (const category of activeCategories) {
      const scoreValue = p.scores[category.documentId]
      const key = `${p.documentId}-${category.documentId}-${props.judgeId}`
      const existingScore = existingScoreMap.get(key)

      if (existingScore) {
        // Case 1: Existing score found
        if (scoreValue === null || scoreValue === undefined || String(scoreValue) === '') {
          // If the score is now null/undefined/empty, delete it
          promises.push(api.delete(`/scores/${existingScore.documentId}`))
        } else if (existingScore.value !== scoreValue) {
          // If the score has changed, update it
          promises.push(
            api.put(`/scores/update/${existingScore.documentId}`, {
              data: {
                value: scoreValue,
                participant: p.documentId,
                category: category.documentId,
                judge: props.judgeId,
                event: props.event.documentId,
                segment: segment.documentId,
              },
            })
          )
        }
        // If existingScore and scoreValue are the same, no action needed
      } else {
        // Case 2: No existing score found
        if (scoreValue !== null && scoreValue !== undefined && String(scoreValue) !== '') {
          const createScorePayload = {
            data: {
              value: scoreValue,
              participant: p.documentId,
              category: category.documentId,
              judge: props.judgeId,
              event: props.event.documentId,
              segment: segment.documentId,
            },
          }

          console.log('Create Score Payload', createScorePayload)
          // If a new score is provided, create it
          promises.push(api.post('/scores/create', createScorePayload))
        }
        // If no existing score and scoreValue is null/undefined/empty, no action needed
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
    emit('refetch-event')
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
