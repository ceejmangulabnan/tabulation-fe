<template>
  <div>
    <UTable
      :data="participants"
      :columns="tableHeaders"
    >
      <template #headshot-cell="{ row }">
        <div class="cursor-pointer" @click="openDialog(row.original.headshot?.url)">
          <img
            v-if="row.original.headshot"
            :src="`${baseApiUrl}${row.original.headshot.url}`"
            alt="Headshot"
            class="w-[100px] object-cover rounded"
          />
        </div>
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3 py-2">
          <img
            v-if="row.original.headshot"
            :src="`${baseApiUrl}${row.original.headshot.url}`"
            class="w-10 h-10 rounded-full object-cover cursor-pointer"
            @click="openDialog(row.original.headshot.url)"
          />
          <div v-else class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <UIcon name="i-lucide-user" />
          </div>
          <div class="font-bold">{{ row.original.name }}</div>
          <UBadge
            v-if="row.original.participant_status === 'eliminated'"
            color="error"
            size="xs"
            label="Eliminated"
          />
        </div>
      </template>
    </UTable>

    <UModal v-model:open="dialog">
      <UCard>
        <img
          :src="currentImgUrl"
          class="max-h-[80vh] w-full object-contain"
        />
        <div class="flex justify-end mt-4">
          <UButton label="Close" color="neutral" variant="ghost" @click="dialog = false" />
        </div>
      </UCard>
    </UModal>
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
} catch (error) {
  console.error('Failed to fetch populated participants:', error)
}

const tableHeaders = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department.name', header: 'Department' },
  { accessorKey: 'headshot.url', header: 'Headshot' },
]
</script>
