<template>
  <v-app
    :theme="theme.current"
    :class="theme.current === 'light' && 'light-bg'"
  >
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
.green-bg {
  background: #003b08;
  background: radial-gradient(circle, rgba(0, 59, 8, 1) 0%, rgba(30, 128, 17, 1) 100%);
}

.light-bg {
  background-color: #f5f5f5;
  background-image: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
}
.glassmorphism-light {
  background: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.glassmorphism-dark {
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

a:link,
a:visited,
a:hover,
a:active {
  text-decoration: none;
  color: inherit;
}

.selected-btn {
  color: #4caf50 !important; /* Green color */
}
</style>
