<template>
  <div>
    <v-data-table></v-data-table>
  </div>
</template>

<script setup lang="ts">
  const response = await $fetch('/api/participants')
  // const data = response.data
  console.log('response from /api/participants', response)
</script>
