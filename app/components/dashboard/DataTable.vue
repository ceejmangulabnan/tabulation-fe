<template>
  <div>
    <v-data-table
      :headers="tableHeaders"
      :items="participants"
    >
      <template #[`item.headshot.url`]="{ value }">
        <div @click="openDialog(value)">
          <v-img
            :src="`${baseApiUrl}${value}`"
            alt="Headshot"
            :aspect-ratio="0.8"
            :tile="true"
            width="100px"
          ></v-img>
        </div>
      </template>
      <template #[`item.name`]="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar
            v-if="item.headshot"
            :src="`${baseApiUrl}${item.headshot.url}`"
            class="mr-3"
            size="40"
            @click="openDialog(item.headshot.url)"
          />
          <v-avatar
            v-else
            icon="mdi-account"
            class="mr-3"
            size="40"
          />
          <div class="font-weight-bold">{{ item.name }}</div>
          <v-chip
            v-if="item.participant_status === 'eliminated'"
            color="red"
            class="ml-2"
            size="small"
            label
          >
            Eliminated
          </v-chip>
        </div>
      </template>
    </v-data-table>

    <v-dialog
      v-model="dialog"
      max-width="600"
    >
      <template #default="{ isActive }">
        <v-card>
          <v-img
            :src="currentImgUrl"
            contain
            max-height="80vh"
          ></v-img>

          <v-card-actions class="justify-end">
            <v-btn
              color="primary"
              variant="text"
              text="Close Dialog"
              @click="isActive.value = false"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
type FullParticipantsResponse = StrapiListResponse<StrapiFullParticipant>
const participants = ref<StrapiFullParticipant[]>([])
const config = useRuntimeConfig()
const baseApiUrl = config.public.strapiUrl
const dialog = ref(false)
const currentImgUrl = ref('')
function openDialog(url: string) {
  currentImgUrl.value = `${baseApiUrl}${url}`
  dialog.value = true
}

try {
  const api = useStrapiApi()
  const response = await api.get<FullParticipantsResponse>('/participants?populate=*')

  participants.value = response.data.data

  console.log('participants', participants.value)
} catch (error) {
  console.error('Failed to fetch populated participants:', error)
}

const tableHeaders = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Department',
    key: 'department.name',
  },
  {
    title: 'Headshot',
    key: `headshot.url`,
  },
]
</script>

<styles scoped>

</styles>
