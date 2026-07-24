<template>
  <div class="flex flex-col items-center px-8 text-center">
    <img
      src="/lakan_at_mutya_gold.png"
      alt="Lakan at Mutya"
      class="w-[90vw] max-w-[800px] object-contain sm:w-[80vw]"
    />
    <p class="max-w-2xl text-lg italic leading-snug text-default md:text-xl">
      Streamline your pageant judging with our elegant, real-time tabulation system designed for
      accuracy and transparency.
    </p>
    <UButton
      to="/auth"
      size="lg"
      class="mt-6"
    >
      Get Started
    </UButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})
</script>
