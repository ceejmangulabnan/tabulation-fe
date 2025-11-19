<template>
  <section>
    <header class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Judging Requests</h2>
      <span>{{ judgeRequests.length || 0 }} requests</span>
    </header>
    <v-table
      class="border-sm rounded-lg"
      striped="even"
    >
      <thead>
        <tr>
          <th class="font-weight-bold text-subtitle-1 text-left">Event Name</th>
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
          <td>{{ item.event.name || 'No Event' }}</td>
          <td>{{ item.judge.name }}</td>
          <td>{{ item.request_status }}</td>
          <td><v-btn>Cancel</v-btn></td>
        </tr>
      </tbody>
    </v-table>
  </section>
</template>

<script setup lang="ts">
const { judgeRequests, fetchJudgeRequests } = useJudgeRequestsStore()
await fetchJudgeRequests()
</script>
