<template>
  <div ref="pdfRoot">
    <!-- PAGE 1 -->
    <section class="page">
      <div class="content">
        <!-- HEADER -->
        <header class="header">
          <img
            src="/ginoo_ning_sta_ana_logo_clean.png"
            width="100"
            height="100"
            class="logo"
          />
          <div class="header-text">
            <h1 class="event-org">St. Nicolas College of Business and Technology</h1>
            <h2 class="event-title">{{ event.name }}</h2>
            <h3 class="title">{{ title }}</h3>
          </div>
        </header>

        <!-- MALE TABLE -->
        <section v-if="filteredMale.length">
          <h4 class="gender">Male Participants</h4>

          <div class="ranking-table">
            <div class="ranking-row header-row">
              <div class="cell col-no">No.</div>
              <div class="cell col-name">Name</div>
              <div class="cell col-dept">Department</div>
              <div class="cell col-score">Average Score</div>
              <div class="cell col-rank">Rank</div>
            </div>
            <div
              class="ranking-row"
              v-for="row in filteredMale"
              :key="row.participant_number"
            >
              <div class="cell col-no">{{ row.participant_number }}</div>
              <div class="cell col-name">{{ row.name }}</div>
              <div class="cell col-dept">{{ row.department || '-' }}</div>
              <div class="cell col-score">{{ row.averaged_score }}</div>
              <div class="cell col-rank">{{ row.rank }}</div>
            </div>
          </div>
        </section>

        <div class="spacer" />

        <!-- FEMALE TABLE -->
        <section v-if="filteredFemale.length">
          <h4 class="gender">Female Participants</h4>

          <div class="ranking-table">
            <div class="ranking-row header-row">
              <div class="cell col-no">No.</div>
              <div class="cell col-name">Name</div>
              <div class="cell col-dept">Department</div>
              <div class="cell col-score">Average Score</div>
              <div class="cell col-rank">Rank</div>
            </div>
            <div
              class="ranking-row"
              v-for="row in filteredFemale"
              :key="row.participant_number"
            >
              <div class="cell col-no">{{ row.participant_number }}</div>
              <div class="cell col-name">{{ row.name }}</div>
              <div class="cell col-dept">{{ row.department || '-' }}</div>
              <div class="cell col-score">{{ row.averaged_score }}</div>
              <div class="cell col-rank">{{ row.rank }}</div>
            </div>
          </div>
        </section>
      </div>
    </section>

    <!-- PAGE 2 -->
    <section class="page">
      <div class="content center bottom-margin">
        <!-- <h1 class="event-org-large">St. Nicolas College of Business and Technology</h1>

        <img
          src="/logo.png"
          class="logo-large"
        /> -->
        <h1 class="event-org-large">Ginoo ning Sta. Ana 2026</h1>
        <img
          src="/ginoo_ning_sta_ana_logo_clean.png"
          class="logo-med"
        />
        <h3 class="title">
          {{
            gender === 'both'
              ? 'ALL PARTICIPANTS'
              : `${gender.toUpperCase()} PARTICIPANTS`
          }}
        </h3>
      
        <h3 class="title">{{ title }}</h3>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'

const props = defineProps<{
  gender: 'male' | 'female' | 'both'
  event: EventData
  title: string
  male: any[]
  female: any[]
}>()

const filteredMale = computed(() => props.male.filter(Boolean))
const filteredFemale = computed(() => props.female.filter(Boolean))

const pdfRoot = ref<HTMLElement | null>(null)

const generatePdf = async (target?: Window) => {
  if (!pdfRoot.value) return

  const pages = pdfRoot.value.querySelectorAll('.page')

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i] as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    if (i > 0) pdf.addPage()

    // bottom-aligned placement
    pdf.addImage(imgData, 'PNG', 0, pageHeight - imgHeight, imgWidth, imgHeight)
  }

  const blob = pdf.output('blob')
  const blobUrl = URL.createObjectURL(blob)

  if (target) {
    target.location.href = blobUrl
  } else {
    window.open(blobUrl, '_blank')
  }
}

defineExpose({ generatePdf })
</script>

<style>
/* A4 PAGE */
.page {
  width: 794px;
  height: 1123px;
  background: white;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  box-sizing: border-box;
}

/* CONTENT - BOTTOM ALIGNED */
.content {
  margin-top: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  font-family: Roboto, Arial, sans-serif;
  color: #000;
}

.content.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
}

.bottom-margin {
  margin-bottom: 3rem;
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.logo {
  margin-right: 16px;
}


.logo-med {
  width: 100px;
  margin: 1.2rem 0;
}


.logo-large {
  width: 350px;
  margin: -1.2rem 0;
}

.header-text {
  flex: 1;
  text-align: center;
  margin-left: -100px;
}

.event-org {
  font-size: 14px;
  margin: 0;
}

.event-org-large {
  font-size: 24px;
  margin: 0;
}

.event-title {
  font-size: 18px;
  margin: 4px 0;
}

.title {
  font-size: 16px;
  margin-top: 4px;
}

/* TABLE */
.gender {
  font-size: 14px;
  margin-bottom: 6px;
}

.ranking-table {
  width: 100%;
  border: 1px solid #000;
  font-size: 11px;
  box-sizing: border-box;
}

.ranking-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr 60px;
  border-bottom: 1px solid #000;
  height: 28px;
}

.ranking-row:last-child {
  border-bottom: none;
}

.header-row {
  background: #f0f0f0;
  font-weight: bold;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 4px;
  border-right: 1px solid #000;
  box-sizing: border-box;
  height: 100%;
  line-height: 1;
}

.cell:last-child {
  border-right: none;
}

.spacer {
  height: 16px;
}
</style>
