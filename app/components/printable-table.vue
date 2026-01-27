<script setup lang="ts">
defineProps<{
  title: string
  rows: {
    number: number
    name: string
    department: string
    average: number
    rank: number
  }[]
}>()
</script>

<template>
  <section class="table-section">
    <h2>{{ title }}</h2>

    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Department</th>
          <th>Avg Score</th>
          <th>Rank</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="row in rows"
          :key="row.rank"
        >
          <td>{{ row.number }}</td>
          <td>{{ row.name }}</td>
          <td>{{ row.department }}</td>
          <td>{{ row.average.toFixed(2) }}</td>
          <td>{{ row.rank }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
