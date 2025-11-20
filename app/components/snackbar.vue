<template>
  <v-snackbar
    v-model="snackbar.snackbar.show"
    :color="snackbar.snackbar.color"
    :timeout="snackbar.snackbar.timeout"
    location="top right"
  >
    {{ snackbar.snackbar.message }}
    <template #actions>
      <v-btn
        variant="text"
        @click="snackbar.snackbar.show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const snackbar = useSnackbar()
</script>
