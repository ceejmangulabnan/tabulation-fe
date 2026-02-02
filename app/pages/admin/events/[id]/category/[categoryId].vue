<template>
  <div>
    <h1>Category Page</h1>
    <p>Event ID: {{ eventId }}</p>
    <p>Category ID: {{ categoryId }}</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const eventId = computed(() => route.params.id)
const categoryId = computed(() => route.params.categoryId)
</script>

