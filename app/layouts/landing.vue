<template>
  <v-app :theme="theme.current" :class="theme.current === 'light' && 'light-bg'">
    <div class="position-absolute top-0 right-0 pa-4">
      <v-icon
        :icon="theme.current == 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
        variant="text"
        @click="theme.toggle()"
      />
    </div>
    <v-main
      class="d-flex align-center justify-center"
      style="min-height: 100vh"
      :class="{ 'light-bg': theme.current === 'light' }"
    >
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  const theme = useThemeStore()
</script>

<style scoped>
  .light-bg {
    background: #00c251;
    background: radial-gradient(circle, rgba(0, 194, 81, 1) 0%, rgba(128, 245, 2, 1) 100%);
  }
</style>
