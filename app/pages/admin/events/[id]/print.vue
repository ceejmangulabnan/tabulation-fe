<template>
  <div class="print-wrapper">
    <h1 class="title">
      {{ type === 'segment' ? 'Segment Ranking' : 'Category Ranking' }}
    </h1>

    <template v-if="!loading">
      <PrintableTable
        v-if="gender !== 'female'"
        title="Male"
        :rows="rankings.filter((r) => r.gender === 'male')"
      />

      <PrintableTable
        v-if="gender !== 'male'"
        title="Female"
        :rows="rankings.filter((r) => r.gender === 'female')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#app'

const route = useRoute()

const eventId = route.params.id as string

const {
  type,
  segmentId,
  categoryId,
  gender = 'both',
} = route.query as {
  type: 'segment' | 'category'
  segmentId: string
  categoryId?: string
  gender?: 'male' | 'female' | 'both'
}

const loading = ref(true)
const rankings = ref<any[]>([])

const fetchRankings = async () => {
  loading.value = true

  if (type === 'segment') {
    rankings.value = await $fetch(`/api/rankings/segment/${segmentId}`, { params: { gender } })
  }

  if (type === 'category' && categoryId) {
    rankings.value = await $fetch(`/api/rankings/category/${categoryId}`, { params: { gender } })
  }

  loading.value = false

  nextTick(() => window.print())
}

onMounted(fetchRankings)
</script>

<style>
@media print {
  body {
    margin: 0;
  }
}

.print-wrapper {
  padding: 24px;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 24px;
}

.table-section {
  margin-bottom: 40px;
  page-break-inside: avoid;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #000;
  padding: 6px 8px;
  font-size: 12px;
}

th {
  text-align: left;
}
</style>
