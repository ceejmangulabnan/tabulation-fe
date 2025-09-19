<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <!-- Drawer content goes here -->
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Tabulation System</v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

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

<script setup>
import { ref } from 'vue'

const drawer = ref(false) // Default value for the drawer
</script>
