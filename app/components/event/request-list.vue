<template>
  <div>
    <div class="flex items-center justify-between w-full mb-4">
      <h2>Judging Requests</h2>
      <span>{{ requests.length || 0 }} requests</span>
    </div>
    <div v-if="requests.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <UCard v-for="(request, i) in requests" :key="i" class="flex flex-col">
        <div class="text-sm text-muted">#{{ request.id }}</div>
        <p>{{ request.judge?.name ?? 'No Judge' }}</p>
        <p>{{ request.event?.name ?? 'No Event' }}</p>
      </UCard>
    </div>
    <div v-else class="flex justify-center items-center p-16 rounded-xl border my-4">
      <p class="text-lg">No judge requests</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JudgeRequestData } from '~~/shared/types/strapi-data'

type JudgeRequestResponse = StrapiListResponse<JudgeRequestData>
const requests = ref<JudgeRequestData[]>([])

try {
  const api = useStrapiApi()
  const response = await api.get<JudgeRequestResponse>('/judge-requests?populate=*')
  requests.value = response.data.data
} catch (error) {
  console.error('Failed to fetch judge requests', error)
}
</script>
