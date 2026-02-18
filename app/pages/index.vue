<template>
  <div :class="theme.current === 'light' ? 'text-white' : 'text-white'">
    <div class="text-center d-flex flex-column align-center">
      <!-- <div class="d-flex flex-column my-4 my-md-8 ga-4"> -->
      <v-img
        :width="imageWidth"
        src="/lakan_at_mutya_gold.png"
      ></v-img>
      <!-- <h1 -->
      <!--   :class="[ -->
      <!--     'text-h2', -->
      <!--     'my-4', -->
      <!--     'font-weight-bold', -->
      <!--     theme.current === 'light' ? 'text-grey-darken-4' : 'text-white', -->
      <!--   ]" -->
      <!--   :style="{ -->
      <!--     textShadow: theme.current === 'dark' ? '0px 5px 5px rgba(0, 0, 0, 0.5)' : 'none', -->
      <!--   }" -->
      <!-- > -->
      <!--   SNC Pageant Tabulation -->
      <!-- </h1> -->
      <p
        :class="[
          'text-body-1',
          'text-md-h5',
          'px-8',
          'text-center',
          theme.current === 'light' ? 'text-black' : 'text-white',
        ]"
      >
        Streamline your pageant judging with our elegant, real-time tabulation system designed for
        accuracy and transparency.
      </p>
      <v-btn
        rounded="xl"
        class="ma-2 mt-6 font-weight-bold"
        :color="theme.current === 'light' ? 'black' : 'white'"
        size="x-large"
        to="/auth"
      >
        Get Started
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const theme = useThemeStore()
const { name } = useDisplay()

const imageWidth = computed(() => {
  switch (name.value) {
    case 'xs':
      return '90vw'
    case 'sm':
      return '80vw'
    case 'md':
      return 800
    case 'lg':
      return 800
    case 'xl':
      return 1400
    default:
      return '100%'
  }
})

definePageMeta({
  layout: 'landing',
})
</script>

<style scoped>
p {
  line-height: 1.2;
  font-weight: 400;
  font-style: italic;
  font-size: 24px;
  padding: 1rem 0;
  /* max-width: 1000px; */
}
</style>
