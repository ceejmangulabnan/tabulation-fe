<template>
  <div class="print-page">
    <h2 class="title">{{ title }}</h2>

    <h3>MALE</h3>
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Department</th>
          <th>Average</th>
          <th>Rank</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in male"
          :key="row.id"
        >
          <td>{{ row.number }}</td>
          <td>{{ row.name }}</td>
          <td>{{ row.department }}</td>
          <td>{{ row.average.toFixed(2) }}</td>
          <td>{{ row.rank }}</td>
        </tr>
      </tbody>
    </table>

    <h3 class="mt">FEMALE</h3>
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Department</th>
          <th>Average</th>
          <th>Rank</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in female"
          :key="row.id"
        >
          <td>{{ row.number }}</td>
          <td>{{ row.name }}</td>
          <td>{{ row.department }}</td>
          <td>{{ row.average.toFixed(2) }}</td>
          <td>{{ row.rank }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  male: Array,
  female: Array,
})
</script>

<style scoped>
@media screen {
  .print-page {
    display: none;
  }
}

@media print {
  body * {
    visibility: hidden;
  }

  .print-page,
  .print-page * {
    visibility: visible;
  }

  .print-page {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 24px;
    font-family: Arial, sans-serif;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border-bottom: 1px solid #000;
    padding: 6px;
  }

  h2,
  h3 {
    text-align: center;
  }
}
</style>
