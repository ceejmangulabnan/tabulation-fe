<template>
  <div class="text-center">
    <div class="d-flex flex-column my-4 my-md-8 ga-4">
      <h1 class="text-h2 my-4 text-white font-weight-bold">SNC Pageant Tabulation</h1>
      <p class="text-h6 text-white px-8">
        Streamline your pageant judging with our elegant, real-time tabulation system designed for
        accuracy and transparency.
      </p>
    </div>
    <div>
      <v-btn to="/auth" size="large" class="ma-2 font-weight-bold">Get Started</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'landing',
  })
</script>

<style scoped>
  h1 {
    text-shadow: 0px 5px 5px rgba(0, 0, 0, 0.5);
  }

  p {
    line-height: 1.2;
    font-weight: 200;
    max-width: 700px;
  }
</style>
