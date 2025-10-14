<template>
  <div class="text-center">
    <h1 class="text-h3 my-4 text-white font-weight-bold">SNC Pageant Tabulation</h1>
    <div>
      <v-btn to="/auth" class="ma-2">Login or Signup</v-btn>
      <v-btn to="/dashboard" class="ma-2">Go to Dashboard</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
  })
</script>

<style scoped>
  h1 {
    text-shadow: 0px 5px 5px rgba(0, 0, 0, 0.5);
  }
</style>
