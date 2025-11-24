<template>
  <v-app
    :theme="theme.current"
    :class="theme.current === 'light' && 'light-bg'"
  >
    <v-app-bar :class="theme.current === 'light' ? 'glassmorphism-light' : 'glassmorphism-dark'">
      <v-app-bar-title>
        <NuxtLink
          to="/"
          class=""
        >
          <p class="px-4 font-weight-bold text-xl">SNC Tabulation</p>
        </NuxtLink>
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center ga-3 px-4">
          <v-btn
            to="/auth"
            variant="tonal"
          >
            Login
          </v-btn>
          <v-btn
            to="/auth?initialTab=Sign%20Up"
            variant="text"
          >
            Sign Up
          </v-btn>
          <v-icon
            class="ml-4"
            :icon="theme.current == 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
            @click="theme.toggle()"
          />
        </div>
      </template>
    </v-app-bar>
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
</style>
