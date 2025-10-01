<script setup lang="ts">
  definePageMeta({
    middleware: ['auth'],
    layout: 'default',
  })
</script>

<template>
  <div>
    Dashboard
    <DashboardDataTable />
  </div>
</template>
