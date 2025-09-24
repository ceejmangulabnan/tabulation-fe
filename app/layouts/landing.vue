<template>
  <v-app :theme="theme.global.name.value">
    <div class="position-absolute top-0 right-0 pa-4">
      <v-btn
        :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
        variant="text"
        @click="toggleTheme"
      />
    </div>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { useTheme } from 'vuetify'

  const theme = useTheme()

  function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }
</script>
