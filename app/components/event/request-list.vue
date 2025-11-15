<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Judging Requests</h2>
      <span>{{ requests.length || 0 }} requests</span>
    </div>
    <v-row
      v-if="requests.length > 0"
      no-gutters
    >
      <v-col
        v-for="(request, i) in requests"
        :key="i"
        cols="12"
        sm="6"
        md="4"
        class="d-flex"
      >
        <v-card class="d-flex flex-column w-100 pa-2 ma-2 rounded-xl">
          <v-card-item>
            <v-card-title>
              <span class="text-body-2">#{{ request.id }}</span>
            </v-card-title>
          </v-card-item>
          <v-card-text>
            <p>{{ request.judge?.name ?? 'No Judge' }}</p>
            <p>{{ request.event?.name ?? 'No Event' }}</p>
          </v-card-text>
          <v-spacer></v-spacer>
        </v-card>
      </v-col>
    </v-row>
    <v-sheet
      v-else
      class="d-flex justify-center align-center pa-16 rounded-xl border-sm my-4"
    >
      <p class="text-h6">No judge requests</p>
    </v-sheet>
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
  console.log('Judge Requests', response.data)
} catch (error) {
  console.error('Failed to fetch judge requests', error)
}
</script>
