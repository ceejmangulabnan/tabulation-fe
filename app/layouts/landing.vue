<template>
  <v-app
    :theme="theme.current"
    :class="theme.current === 'light' && 'light-bg'"
  >
    <v-app-bar
      elevation="0"
      :class="theme.current === 'light' ? 'glassmorphism-light' : 'glassmorphism-dark'"
    >
      <template #prepend>
        <NuxtLink
          to="/"
          class=""
        >
          <div class="pl-4 d-flex align-center">
            <v-img
              class="px-4"
              width="20px"
              height="20px"
              :src="theme.current === 'light' ? '/trophy-dark.svg' : '/trophy-light.svg'"
            ></v-img>
            <p class="font-weight-bold">SNC Tabulation</p>
          </div>
        </NuxtLink>
      </template>
      <template #append>
        <div class="px-4">
          <v-icon
            :icon="theme.current == 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
            @click="theme.toggle()"
          />
        </div>
      </template>
    </v-app-bar>
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
.glassmorphism-light {
  background: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}
.glassmorphism-dark {
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

a:link,
a:visited,
a:hover,
a:active {
  text-decoration: none;
  color: inherit;
}
</style>
