<template>
  <v-app id="inspire" :theme="theme.global.name.value">
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Tabulation System</v-app-bar-title>

      <template #append>
        <div class="px-4">
          <v-icon
            :icon="
              theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'
            "
            @click="theme.toggle()"
          />
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list-nav>
        <v-list-item to="/">Home</v-list-item>
        <v-list-item to="/dashboard">Dashboard</v-list-item>
      </v-list-nav>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <v-row dense>
          <v-col v-for="n in 8" :key="n" cols="3">
            <v-sheet color="surface-variant-alt" height="96" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useTheme } from 'vuetify'

  const drawer = ref(false)
  const theme = useTheme()

  function toggleTheme() {
    theme.toggle()
  }
</script>
