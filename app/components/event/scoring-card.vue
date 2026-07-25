<template>
  <UCard>
    <UTabs
      v-model="activeGenderTab"
      :items="genderTabs"
      class="mb-4"
    />

    <div
      v-for="gender in genders"
      :key="gender.key"
    >
      <div v-if="activeGenderTab === gender.key">
        <form @submit.prevent="submitScores(segment)">
          <!-- Desktop View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full table-fixed border-collapse whitespace-nowrap">
              <thead>
                <tr class="border-b">
                  <th
                    v-for="header in getTableHeaders(segment)"
                    :key="header.value"
                    class="text-left p-2 font-bold text-sm whitespace-nowrap"
                  >
                    <div class="flex items-center gap-1">
                      <UIcon
                        v-if="getCategoryByHeader(header)?.locked"
                        name="i-lucide-lock"
                        class="size-3"
                      />
                      {{ header.title }}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in getParticipantsByGender(gender.key, segment)"
                  :key="item.id"
                  class="border-b hover:bg-muted/50"
                >
                  <td class="p-2 whitespace-nowrap w-[50px]">{{ idx + 1 }}</td>
                  <td class="p-2 whitespace-nowrap w-[250px]">
                    <div class="flex items-center gap-2">
                      <img
                        v-if="item.headshot?.formats?.thumbnail?.url"
                        :src="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                        class="w-10 h-10 shrink-0 rounded-full object-cover cursor-pointer"
                        @click="showImagePreview(item.headshot.url)"
                      />
                      <div
                        v-else
                        class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                      >
                        <UIcon name="i-lucide-user" />
                      </div>
                      <UBadge
                        v-if="
                          item.participant_status === 'eliminated' &&
                          item.eliminated_at_segment?.documentId === segment.documentId
                        "
                        color="error"
                        size="xs"
                      >
                        E
                      </UBadge>
                      <span class="font-bold">{{ item.name }}</span>
                    </div>
                  </td>
                  <td class="p-2 whitespace-nowrap">{{ item.department?.name || 'N/A' }}</td>
                  <td
                    v-for="category in getActiveCategories(segment)"
                    :key="category.documentId"
                    class="p-2 whitespace-nowrap"
                  >
                    <div
                      v-if="props.readonly"
                      class="font-medium"
                    >
                      {{ item.scores[category.documentId] ?? '-' }}
                    </div>
                    <UInput
                      v-else
                      :model-value="item.scores[category.documentId] as number"
                      @update:model-value="
                        (val: any) =>
                          (item.scores[category.documentId] =
                            val === '' || val === null ? null : Number(val))
                      "
                      type="number"
                      :min="getCategoryMin(category)"
                      :max="isRankingMode ? activeParticipantCount : category.weight * 100"
                      :step="isRankingMode ? 1 : 'any'"
                      class="w-20"
                      :disabled="
                        category.locked ||
                        segment.segment_status === 'closed' ||
                        segment.segment_status === 'inactive' ||
                        item.participant_status === 'eliminated'
                      "
                      @keydown="blockInvalidKeys"
                    />
                  </td>
                  <td
                    v-if="isAdmin"
                    class="p-2 font-bold"
                  >
                    {{ calculateTotalScore(item, segment) }}
                  </td>
                </tr>
                <tr v-if="getParticipantsByGender(gender.key, segment).length === 0">
                  <td
                    :colspan="getTableHeaders(segment).length"
                    class="p-4 text-center text-muted"
                  >
                    No participants found for this gender.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile View -->
          <div class="md:hidden space-y-3">
            <UCard
              v-for="item in getParticipantsByGender(gender.key, segment)"
              :key="item.id"
            >
              <div class="flex items-center gap-3 mb-3">
                <img
                  v-if="item.headshot?.formats?.thumbnail?.url"
                  :src="getStrapiUrl(item.headshot.formats.thumbnail.url)"
                  class="w-10 h-10 rounded-full object-cover cursor-pointer"
                  @click="showImagePreview(item.headshot.url)"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                >
                  <UIcon name="i-lucide-user" />
                </div>
                <div class="flex-1">
                  <div class="font-bold flex items-center gap-2">
                    {{ item.name }}
                    <UBadge
                      v-if="
                        item.participant_status === 'eliminated' &&
                        item.eliminated_at_segment?.documentId === segment.documentId
                      "
                      color="error"
                      size="xs"
                    >
                      E
                    </UBadge>
                  </div>
                  <div class="text-sm text-muted">{{ item.department?.name || 'N/A' }}</div>
                </div>
              </div>

              <div
                v-for="category in getActiveCategories(segment)"
                :key="category.documentId"
                class="flex items-center justify-between py-2 border-t"
              >
                <div class="text-sm">
                  <UIcon
                    v-if="category.locked"
                    name="i-lucide-lock"
                    class="size-3 mr-1"
                  />
                  {{ category.name }}
                  <template v-if="!isRankingMode">
                    ({{ (category.weight * 100).toFixed(0) }}%)
                  </template>
                </div>
                <div
                  v-if="props.readonly"
                  class="font-bold"
                >
                  {{ item.scores[category.documentId] ?? '-' }}
                </div>
                <UInput
                  v-else
                  :model-value="item.scores[category.documentId] as number"
                  @update:model-value="
                    (val: any) =>
                      (item.scores[category.documentId] =
                        val === '' || val === null ? null : Number(val))
                  "
                  type="number"
                  :min="getCategoryMin(category)"
                  :max="isRankingMode ? activeParticipantCount : category.weight * 100"
                  :step="isRankingMode ? 1 : 'any'"
                  class="w-20"
                  :disabled="
                    category.locked ||
                    segment.segment_status === 'closed' ||
                    segment.segment_status === 'inactive' ||
                    item.participant_status === 'eliminated'
                  "
                />
              </div>

              <div class="flex justify-end pt-2 border-t">
                <span class="font-bold text-sm">
                  {{ isRankingMode ? 'Avg Rank' : 'Segment Score' }}:
                  {{ calculateTotalScore(item, segment) }}{{ isRankingMode ? '' : ' / 100' }}
                </span>
              </div>
            </UCard>
          </div>

          <div
            v-if="!props.readonly"
            class="flex flex-col items-end gap-2 mt-4"
          >
            <UAlert
              v-if="isRankingMode"
              icon="i-lucide-alert-triangle"
              color="warning"
              variant="subtle"
              title="Ranking Required"
              description="You must assign a rank to every active participant before submitting."
              class="w-full"
            />
            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                color="neutral"
                variant="ghost"
                @click="$emit('cancel-scoring')"
              />
              <UButton
                v-if="segment.segment_status !== 'closed'"
                label="Submit Scores"
                type="submit"
                :loading="isLoading"
                :disabled="!hasAllRanks"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </UCard>

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

const genderTabs = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

function getScoreRules(maxScore: number) {
  return [
    (v: number | string | null | undefined) => {
      if (v === null || v === undefined || v === '') return true
      const str = String(v)
      if (!/^\d+(\.\d+)?$/.test(str)) return 'Invalid score'
      const num = Number(str)
      if (num < 0 || num > maxScore) return `Score must be from 0 to ${maxScore}`
      return true
    },
  ]
}

function getRankRules(maxRank: number) {
  return [
    (v: number | string | null | undefined) => {
      if (v === null || v === undefined || v === '') return true
      const str = String(v)
      if (!/^\d+$/.test(str)) return 'Rank must be a whole number'
      const num = Number(str)
      if (num < 1 || num > maxRank) return `Rank must be from 1 to ${maxRank}`
      return true
    },
  ]
}

function getRankDuplicateRule(categoryDocId: string, participantDocId: string) {
  return [
    (v: any) => {
      if (v === null || v === undefined || v === '') return true
      const num = Number(v)
      const otherHasSameRank = props.participants.some(
        (p) =>
          p.documentId !== participantDocId &&
          p.participant_status === 'active' &&
          Number(p.scores[categoryDocId]) === num
      )
      return !otherHasSameRank || 'Rank already assigned to another participant'
    },
  ]
}

const { showSnackbar } = useSnackbar()
const api = useStrapiApi()
const isLoading = ref<boolean>(false)

const formRefs = ref<Record<string, HTMLFormElement | null>>({})
const activeGenderTab = ref<string>('male')

const activeParticipantCount = computed(() => {
  return props.participants.filter((p) => p.participant_status === 'active').length
})

const isRankingMode = computed(() => props.segment.scoring_mode === 'ranking')

const hasAllRanks = computed(() => {
  if (!isRankingMode.value) return true
  const activeParticipants = props.participants.filter((p) => p.participant_status === 'active')
  const activeCategories = getActiveCategories(props.segment).filter((c) => !c.locked)
  if (activeCategories.length === 0 || activeParticipants.length === 0) return true
  return activeCategories.every((category) =>
    activeParticipants.every((p) => {
      const val = p.scores[category.documentId]
      return val !== null && val !== undefined && String(val) !== ''
    })
  )
})

const config = useRuntimeConfig()

function getCategoryMin(category: CategoryData): number {
  if (isRankingMode.value) return 1
  if (!config.public.minScoreCap) return 0
  const categoryMax = category.weight * 100
  return Math.floor(categoryMax / 2)
}

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

const genders = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
]

function getActiveCategories(segment: SegmentData) {
  if (!segment.categories) return []
  const categoriesToProcess = props.isAdmin
    ? segment.categories
    : segment.categories.filter((category) => category.active)
  return categoriesToProcess.map((category) => {
    const isJudgeAssignedToCategory = category.active_judges?.some(
      (judge) => String(judge.documentId) === String(props.judgeId)
    )
    const shouldBeLockedBecauseOfJudgeAssignment =
      category.active_judges && category.active_judges.length > 0 && !isJudgeAssignedToCategory
    return {
      ...category,
      locked: category.locked || shouldBeLockedBecauseOfJudgeAssignment,
    }
  })
}

function getCategoryByHeader(header: { title: string; value: string }) {
  if (!header.value.startsWith('category_')) return null
  const docId = header.value.replace('category_', '')
  return getActiveCategories(props.segment).find((c) => c.documentId === docId)
}

function getTableHeaders(segment: SegmentData) {
  const staticHeaders = [
    { title: 'No.', value: 'number', sortable: true, width: '10' },
    { title: 'Name', value: 'name', sortable: true, width: '250' },
    { title: 'Department', value: 'department', sortable: true },
  ]
  const categoryHeaders =
    getActiveCategories(segment).map((category: CategoryData) => ({
      title: isRankingMode.value ? category.name : `${category.name} (${category.weight * 100}%)`,
      value: `category_${category.documentId}`,
      sortable: false,
    })) || []
  const totalScoreHeaders = {
    title: isRankingMode.value ? 'Avg Rank' : 'Total Score',
    value: 'total_score',
    align: 'center',
    sortable: false,
    width: '120',
  }
  if (props.isAdmin) return [...staticHeaders, ...categoryHeaders, totalScoreHeaders]
  return [...staticHeaders, ...categoryHeaders]
}

function getParticipantsByGender(gender: string, segment: SegmentData) {
  let genderFiltered = props.participants.filter((p) => p.gender === gender)
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
      return segment.scoring_mode === 'ranking' ? scoreA - scoreB : scoreB - scoreA
    })
  }
  return genderFiltered.sort((a, b) => a.number - b.number)
}

function calculateTotalScore(participant: ParticipantWithScores, segment: SegmentData): string {
  if (segment.scoring_mode === 'ranking') {
    const activeCats = getActiveCategories(segment)
    let totalRank = 0
    let rankedCount = 0
    for (const category of activeCats) {
      const value = participant.scores[category.documentId]
      if (value === null || value === undefined || String(value) === '') continue
      const rank = Number(value)
      if (Number.isNaN(rank)) continue
      totalRank += rank
      rankedCount++
    }
    if (rankedCount === 0) return '-'
    return (totalRank / rankedCount).toFixed(2)
  }

  const rawSegmentTotal = getActiveCategories(segment).reduce((acc, category) => {
    const value = participant.scores[category.documentId]
    if (value === null || value === undefined || String(value) === '') return acc
    const score = Number(value)
    if (Number.isNaN(score)) return acc
    return acc + score
  }, 0)

  let finalSegmentScore = rawSegmentTotal
  if (segment.scoring_mode === 'normalized') {
    finalSegmentScore = rawSegmentTotal * segment.weight
  }
  return finalSegmentScore.toFixed(2)
}

function blockInvalidKeys(e: KeyboardEvent) {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']
  if (allowedKeys.includes(e.key)) return
  if (e.key === '.' && !(e.target as HTMLInputElement).value.includes('.')) return
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

async function submitScores(segment: SegmentData) {
  isLoading.value = true

  if (!props.judgeId) {
    showSnackbar('Judge ID not found.', 'error')
    isLoading.value = false
    return
  }

  const activeCategories = getActiveCategories(segment)
  const promises = []
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
        if (scoreValue === null || scoreValue === undefined || String(scoreValue) === '') {
          promises.push(api.delete(`/scores/${existingScore.documentId}`))
        } else if (existingScore.value !== scoreValue) {
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
      } else {
        if (scoreValue !== null && scoreValue !== undefined && String(scoreValue) !== '') {
          promises.push(
            api.post('/scores/create', {
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
