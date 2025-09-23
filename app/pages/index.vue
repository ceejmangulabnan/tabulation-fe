<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
  })
</script>

<template>
  <div class="d-flex align-stretch justify-between ga-10">
    <AuthRegisterForm />
    <AuthLoginForm />
  </div>
</template>
