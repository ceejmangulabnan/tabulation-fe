<script setup lang="ts">
  definePageMeta({
    middleware: ['auth'],
    layout: 'default',
  })
</script>

<template>
  <div>
    <DashboardDataTable />
  </div>
</template>
