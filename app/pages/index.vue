<template>
  <div :class="theme.current === 'light' ? 'text-white' : 'text-white'">
    <div class="text-center">
      <!-- Colors to convert to black in logo svg -->
      <!-- f9fbca f8fbca f7f8c6 -->

      <!-- <div class="d-flex flex-column my-4 my-md-8 ga-4"> -->
      <v-img
        src="/lakan_at_mutya_logo.png"
        max-width="1400px"
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
      <p :class="['text-h6', 'px-8', theme.current === 'light' ? 'text-white' : 'text-white']">
        Streamline your pageant judging with our elegant, real-time tabulation system designed for
        accuracy and transparency.
      </p>
      <!-- </div> -->
      <div>
        <v-btn
          to="/auth"
          size="large"
          class="ma-2 font-weight-bold"
          :color="theme.current === 'light' ? 'white' : 'green'"
        >
          Get Started
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const theme = useThemeStore()
definePageMeta({
  layout: 'landing',
})
</script>

<style scoped>
p {
  line-height: 1.2;
  font-weight: 200;
  max-width: 700px;
}
</style>
