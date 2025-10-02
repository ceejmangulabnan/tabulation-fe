<template>
  <div class="text-center">
    <h1 class="text-h3 my-4">Tabulation App</h1>
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
