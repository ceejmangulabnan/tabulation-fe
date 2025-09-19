<script setup lang="ts">
const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <div class="p-top">
    Hello World
    {{ count }}
    <button @click="increment">Increment Count</button>
  </div>
</template>

<style>
.p-top {
  padding-top: 10rem;
}
</style>
