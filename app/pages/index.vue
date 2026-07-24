<template>
  <div
    class="relative flex flex-col items-center justify-center px-8 text-center overflow-hidden h-screen w-screen bg-foreground"
  >
    <img
      src="/ginoo_ning_sta_ana_logo_clean.png"
      alt="Ginoo ning Sta. Ana 2026"
      class="w-[90vw] max-w-[300px] object-contain sm:w-[30vw] mb-12"
    />
    <div class="relative z-10 space-y-4">
      <h1 class="text-4xl font-bold md:text-7xl mx-auto">Pageant Tabulation</h1>
      <p class="max-w-2xl text-lg italic leading-snug text-default md:text-xl mx-auto">
        Streamline your pageant judging with our elegant, real-time tabulation system designed for
        accuracy and transparency.
      </p>
      <UButton
        to="/auth"
        size="xl"
        class="mt-6"
      >
        Get Started
      </UButton>
    </div>
    <p class="absolute bottom-4 text-xs text-default/60">Built by Ceej Mangulabnan</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})
</script>
