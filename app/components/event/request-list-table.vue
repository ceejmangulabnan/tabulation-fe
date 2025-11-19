<template>
  <section>
    <header class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Judging Requests</h2>
      <span>
        {{
          judgeRequestsStore.judgeRequests.length == 1
            ? `${judgeRequestsStore.judgeRequests.length} event`
            : `${judgeRequestsStore.judgeRequests.length} events`
        }}
      </span>
    </header>
    <v-table
      class="border-sm rounded-lg"
      striped="even"
    >
      <thead>
        <tr>
          <th class="font-weight-bold text-subtitle-1 text-left">Event Name</th>
          <th class="font-weight-bold text-subtitle-1 text-center">Judge</th>
          <th class="font-weight-bold text-subtitle-1 text-center">Request Status</th>
          <th class="font-weight-bold text-subtitle-1 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="judgeRequestsStore.judgeRequests.length == 0">
          <td
            colspan="4"
            class="text-center text-grey-darken-2"
          >
            No Judge Requests
          </td>
        </tr>
        <tr
          v-for="item in judgeRequestsStore.judgeRequests"
          :key="item.id"
        >
          <td>{{ item.event.name || 'No Event' }}</td>
          <td align="center">{{ item.judge.name }}</td>
          <td align="center">
            <v-chip
              :color="getStatusColor(item.request_status)"
              label
              class="text-capitalize"
            >
              {{ item.request_status }}
            </v-chip>
          </td>
          <td align="center">
            <v-btn
              variant="tonal"
              color="error"
            >
              Cancel
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </section>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const judgeRequestsStore = useJudgeRequestsStore()
await judgeRequestsStore.fetchJudgeRequests()

const theme = useTheme()

const getStatusColor = (status: string) => {
  const isDark = theme.global.name.value === 'dark'
  switch (status) {
    case 'approved':
      return isDark ? 'success' : 'green-darken-2'
    case 'pending':
      return isDark ? 'warning' : 'yellow-darken-2'
    case 'rejected':
      return isDark ? 'error' : 'red-darken-2'
    default:
      return 'info'
  }
}
</script>
