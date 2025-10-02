<template>
  <div>
    <v-data-table :items="participants"></v-data-table>
  </div>
</template>

<script setup lang="ts">
  type FullParticipantsResponse = StrapiListResponse<StrapiFullParticipant>
  const participants = ref<StrapiFullParticipant[]>([])

  try {
    const api = useStrapiApi()
    const response = await api.get<FullParticipantsResponse>('/participants?populate=*')

    participants.value = response.data.data

    console.log('participants', participants.value)
  } catch (error) {
    console.error('Failed to fetch populated participants:', error)
  }
</script>
