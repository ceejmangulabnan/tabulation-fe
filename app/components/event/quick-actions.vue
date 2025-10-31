<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Quick Actions</h2>
    </div>
    <v-row no-gutters>
      <v-col cols="12" sm="6" class="d-flex">
        <v-card
          elevation="0"
          class="custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
        >
          <v-card-item>
            <v-card-title class="d-flex flex-column ga-4">
              <v-icon icon="mdi-plus"></v-icon>
              <span class="">Create a request to judge an event</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">Submit a request to judge an active event</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" class="d-flex">
        <v-card
          elevation="0"
          class="custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
        >
          <v-card-item>
            <v-card-title class="d-flex flex-column ga-4">
              <v-icon icon="mdi-eye"></v-icon>
              <span class="">View my scores</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">Review your scores for judged events</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .custom-hover-card {
    transition: all 0.25s ease;
  }

  .custom-hover-card:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
    transform: translateY(-3px);
  }
</style>

