<template>
  <div
    class="relative flex flex-col items-center justify-center px-8 py-12 text-center min-h-screen w-screen bg-foreground"
  >
    <img
      src="/ginoo_ning_sta_ana_logo_clean.png"
      alt="Ginoo ning Sta. Ana 2026"
      class="w-[50vw] max-w-[200px] object-contain sm:w-[30vw] sm:max-w-[300px] mb-6 sm:mb-12"
    />
    <div class="relative z-10 space-y-3 sm:space-y-4">
      <h1 class="text-2xl font-bold sm:text-4xl md:text-7xl mx-auto">Pageant Tabulation</h1>
      <p class="max-w-2xl text-sm italic leading-snug text-default sm:text-lg md:text-xl mx-auto">
        Streamline your pageant judging with our elegant, real-time tabulation system designed for
        accuracy and transparency.
      </p>
      <UButton
        to="/auth"
        size="lg"
        class="mt-4 sm:mt-6"
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
