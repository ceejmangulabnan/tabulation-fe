<template>
  <section>
    <header class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Judging Requests</h2>
      <span>{{ judgeRequests.length || 0 }} requests</span>
    </header>
    <v-table
      class="border-md"
      striped="even"
    >
      <thead>
        <tr>
          <th class="font-weight-bold text-subtitle-1 text-left">Name</th>
          <th class="font-weight-bold text-subtitle-1 text-left">Judge</th>
          <th class="font-weight-bold text-subtitle-1 text-left">Request Status</th>
          <th class="font-weight-bold text-subtitle-1 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in judgeRequests"
          :key="item.id"
        >
          <td>{{ item.name || 'No Event' }}</td>
          <td>{{ item.judge.name }}</td>
          <td>{{ item.request_status }}</td>
        </tr>
      </tbody>
    </v-table>
  </section>
</template>

<script setup lang="ts">
import type { JudgeRequestData } from '~~/shared/types/strapi-data'

type JudgeRequestResponse = StrapiListResponse<JudgeRequestData>
const judgeRequests = ref<JudgeRequestData[]>([])
const eventsStore = useEventsStore()
const api = useStrapiApi()
async function fetchJudgeRequests() {
  try {
    const response = await api.get<JudgeRequestResponse>('/judge-requests?populate=*')
    judgeRequests.value = response.data.data
    console.log(judgeRequests.value)
  } catch (error) {
    console.error('Failed to fetch judge requests')
  }
}

onMounted(fetchJudgeRequests)
</script>
