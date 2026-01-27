<template>
  <div
    ref="pdfRoot"
    class="pdf-root"
  >
    <header class="d-flex align-center">
      <img
        src="/logo.png"
        width="150px"
        height="150px"
      />
      <h1>{{ event.name }}</h1>
    </header>
    <h2 class="title primary">{{ title }}</h2>

    <!-- MALE TABLE -->
    <section v-if="male?.length">
      <h2 class="gender">Male Participants</h2>

      <table class="ranking-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Department</th>
            <th>Average Score</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in male"
            :key="row.participantId"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.department || '—' }}</td>
            <td>{{ row.averaged_score.toFixed(3) }}</td>
            <td>{{ row.rank }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- PAGE BREAK -->
    <div
      v-if="male?.length && female?.length"
      class="page-break"
    />

    <!-- FEMALE TABLE -->
    <section v-if="female?.length">
      <h2 class="gender">Female Participants</h2>

      <table class="ranking-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Department</th>
            <th>Average Score</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in female"
            :key="row.participantId"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.department || '—' }}</td>
            <td>{{ row.averaged_score.toFixed(3) }}</td>
            <td>{{ row.rank }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const props = defineProps<{
  event: EventData
  title: string
  male: any[]
  female: any[]
}>()

const pdfRoot = ref<HTMLElement | null>(null)

const generatePdf = async () => {
  if (!pdfRoot.value) return

  const canvas = await html2canvas(pdfRoot.value, {
    scale: 2,
    useCORS: true,
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.printHeaderRow
  pdf.output('pdfobjectnewwindow', { filename: `${props.title}.pdf` })
  // pdf.save(`${props.title}.pdf`)
}

defineExpose({
  generatePdf,
})
</script>

<style>
.pdf-root {
  font-family: Roboto, Arial, sans-serif;
  color: #000;
  width: 794px; /* A4 width in px @ 96dpi */
  padding: 24px;
}

.title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 24px;
}

.gender {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 16px;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.ranking-table th,
.ranking-table td {
  border: 1px solid #000;
  padding: 6px;
  text-align: center;
}

.ranking-table th {
  background: #f0f0f0;
  font-weight: bold;
}

.page-break {
  page-break-before: always;
}
</style>
