<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <span class="font-bold text-lg">Participants</span>

      <UButton
        class="md:hidden"
        icon="i-lucide-plus"
        size="xs"
        @click="showParticipantDialog()"
      />

      <UButton
        class="hidden md:inline-flex"
        icon="i-lucide-plus"
        label="Add participant"
        @click="showParticipantDialog()"
      />
    </div>

    <div class="hidden md:block">
      <div class="text-base font-semibold mb-2">Male Participants</div>
      <UTable
        :data="maleParticipants"
        :columns="participantHeaders"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-2">
            <img
              v-if="row.original.headshot"
              :src="getStrapiUrl(row.original.headshot.formats.thumbnail.url)"
              class="w-10 h-10 rounded-full object-cover cursor-pointer"
              @click="showImagePreview(row.original.headshot.url)"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-user"
                class="size-4"
              />
            </div>
            <span>{{ row.original.name }}</span>
          </div>
        </template>
      </UTable>
      <div class="text-base font-semibold mt-4 mb-2">Female Participants</div>
      <UTable
        :data="femaleParticipants"
        :columns="participantHeaders"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-2">
            <img
              v-if="row.original.headshot"
              :src="getStrapiUrl(row.original.headshot.formats.thumbnail.url)"
              class="w-10 h-10 rounded-full object-cover cursor-pointer"
              @click="showImagePreview(row.original.headshot.url)"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-user"
                class="size-4"
              />
            </div>
            <span>{{ row.original.name }}</span>
          </div>
        </template>
      </UTable>
    </div>
    <div class="md:hidden">
      <div class="text-base font-semibold mb-2">Male Participants</div>
      <div class="space-y-1">
        <div
          v-for="participant in maleParticipants"
          :key="participant.id"
          class="flex items-center justify-between p-2"
        >
          <div class="flex items-center gap-2">
            <img
              v-if="participant.headshot"
              :src="getStrapiUrl(participant.headshot.formats.thumbnail.url)"
              class="w-10 h-10 rounded-full object-cover cursor-pointer"
              @click="showImagePreview(participant.headshot.url)"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <UIcon name="i-lucide-user" />
            </div>
            <div>
              <div class="font-bold flex items-center gap-2">
                {{ participant.name }}
                <UBadge
                  v-if="participant.participant_status === 'eliminated'"
                  color="error"
                  size="xs"
                  label="Eliminated"
                />
              </div>
              <div class="text-sm text-muted">#{{ participant.number }}</div>
            </div>
          </div>
          <div class="flex gap-1">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              size="xs"
              @click="showParticipantDialog(participant as ParticipantData)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              @click="deleteParticipant(participant as ParticipantData)"
            />
          </div>
        </div>
        <div
          v-if="maleParticipants.length === 0"
          class="text-center text-muted py-4"
        >
          No Male Participants
        </div>
      </div>

      <div class="text-base font-semibold mt-4 mb-2">Female Participants</div>
      <div class="space-y-1">
        <div
          v-for="participant in femaleParticipants"
          :key="participant.id"
          class="flex items-center justify-between p-2"
        >
          <div class="flex items-center gap-2">
            <img
              v-if="participant.headshot"
              :src="getStrapiUrl(participant.headshot.formats.thumbnail.url)"
              class="w-10 h-10 rounded-full object-cover cursor-pointer"
              @click="showImagePreview(participant.headshot.url)"
            />
            <div
              v-else
              class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <UIcon name="i-lucide-user" />
            </div>
            <div>
              <div class="font-bold flex items-center gap-2">
                {{ participant.name }}
                <UBadge
                  v-if="participant.participant_status === 'eliminated'"
                  color="error"
                  size="xs"
                  label="Eliminated"
                />
              </div>
              <div class="text-sm text-muted">#{{ participant.number }}</div>
            </div>
          </div>
          <div class="flex gap-1">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              size="xs"
              @click="showParticipantDialog(participant as ParticipantData)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              @click="deleteParticipant(participant as ParticipantData)"
            />
          </div>
        </div>
        <div
          v-if="femaleParticipants.length === 0"
          class="text-center text-muted py-4"
        >
          No Female Participants
        </div>
      </div>
    </div>

    <ImagePreviewDialog
      v-model="imagePreviewDialog"
      :image-url="imagePreviewUrl"
    />

    <UModal
      v-model:open="participantDialog"
      :title="editedParticipant.id ? 'Edit Participant' : 'Add Participant'"
    >
      <template #body>
        <img
          v-if="headshotPreviewUrl"
          :src="headshotPreviewUrl"
          class="max-h-[150px] rounded mb-2"
        />
        <img
          v-else-if="editedParticipant.headshot"
          :src="getStrapiUrl(editedParticipant.headshot.url)"
          class="max-h-[150px] rounded mb-2 cursor-pointer"
          @click="showImagePreview(editedParticipant.headshot.url)"
        />

        <UForm @submit.prevent="saveParticipant">
          <div class="space-y-4">
            <UFormField label="Headshot Image">
              <UInput
                type="file"
                accept="image/*"
                class="w-full"
                :label="
                  editedParticipant.headshot?.url
                    ? 'Replace Headshot Image'
                    : 'Upload Headshot Image'
                "
                @change="
                  (e: Event) => (headshotFile = (e.target as HTMLInputElement).files?.[0] || null)
                "
              />
            </UFormField>
            <UFormField label="Name">
              <UInput
                v-model="editedParticipant.name"
                class="w-full"
                autofocus
                required
              />
            </UFormField>
            <UFormField label="Number">
              <UInput
                v-model.number="editedParticipant.number"
                class="w-full"
                type="number"
                required
              />
            </UFormField>
            <UFormField label="Gender">
              <USelect
                v-model="editedParticipant.gender"
                class="w-full"
                :items="['male', 'female']"
              />
            </UFormField>
            <UFormField label="Department">
              <USelectMenu
                :model-value="
                  editedParticipant.department != null
                    ? {
                        label:
                          departments.find((d: any) => d.id === editedParticipant.department)
                            ?.name || '',
                        value: editedParticipant.department as number,
                      }
                    : undefined
                "
                :items="departments.map((d: any) => ({ label: d.name, value: d.id }))"
                class="w-full"
                searchable
                @update:model-value="
                  (val: any) => (editedParticipant.department = val?.value ?? val)
                "
              />
            </UFormField>
            <UFormField label="Notes">
              <UTextarea
                v-model="editedParticipant.notes"
                class="w-full"
              />
            </UFormField>
          </div>
        </UForm>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="participantDialog = false"
          />
          <UButton
            label="Save"
            color="success"
            variant="subtle"
            @click="saveParticipant"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { AxiosError } from 'axios'
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
  departments: {
    type: Array as PropType<DepartmentData[]>,
    required: true,
  },
})

const api = useStrapiApi()
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()

const maleParticipants = computed(
  () => props.event.participants?.filter((p) => p.gender === 'male') || []
)
const femaleParticipants = computed(
  () => props.event.participants?.filter((p) => p.gender === 'female') || []
)

interface EditedParticipantData extends Omit<Partial<ParticipantData>, 'department'> {
  department?: number | undefined
}

const participantHeaders = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'number', header: 'Number' },
  { accessorKey: 'gender', header: 'Gender' },
  { accessorKey: 'department.name', header: 'Department' },
  { accessorKey: 'actions', header: '' },
]

const participantDialog = ref(false)
const editedParticipant = ref<EditedParticipantData>({
  name: '',
  number: undefined,
  gender: undefined,
  notes: '',
  department: undefined,
})
const headshotFile = ref<File | null>(null)
const headshotPreviewUrl = ref<string | null>(null)
const headshotCleared = ref(false)
const imagePreviewDialog = ref(false)
const imagePreviewUrl = ref<string | undefined>('')
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiUrl(url)
  imagePreviewDialog.value = true
}

watch(headshotFile, (newValue, oldValue) => {
  if (headshotPreviewUrl.value) {
    URL.revokeObjectURL(headshotPreviewUrl.value)
    headshotPreviewUrl.value = null
  }
  if (newValue) {
    headshotPreviewUrl.value = URL.createObjectURL(newValue)
    headshotCleared.value = false
  } else if (oldValue) {
    headshotCleared.value = true
  }
})

watch(participantDialog, (isOpen) => {
  if (!isOpen) {
    if (headshotPreviewUrl.value) {
      URL.revokeObjectURL(headshotPreviewUrl.value)
      headshotPreviewUrl.value = null
    }
  }
})

const showParticipantDialog = (item: ParticipantData | null = null) => {
  headshotFile.value = null
  headshotCleared.value = false
  editedParticipant.value = item
    ? { ...item, department: item.department?.id }
    : {
        name: '',
        number: undefined,
        gender: undefined,
        notes: '',
        department: undefined,
        participant_status: 'active',
      }
  participantDialog.value = true
}

const saveParticipant = async () => {
  try {
    const participantData: any = {
      name: editedParticipant.value.name,
      number: editedParticipant.value.number,
      gender: editedParticipant.value.gender,
      department: editedParticipant.value.department,
      notes: editedParticipant.value.notes,
      participant_status: 'active',
      event: props.event.id,
    }

    if (
      editedParticipant.value.documentId &&
      editedParticipant.value.headshot &&
      !headshotFile.value &&
      !headshotCleared.value
    ) {
      participantData.headshot = editedParticipant.value.headshot.id
    }

    if (!participantData.name || !participantData.number || !participantData.gender) {
      showSnackbar('Name, number, and gender are required.', 'error')
      return
    }

    if (headshotFile.value) {
      const file: File = headshotFile.value
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        showSnackbar('Only JPEG, JPG, PNG, and WebP images are accepted.', 'error')
        return
      }
      const formData = new FormData()
      formData.append('files', file)
      const uploadResponse = await api.post('/upload', formData)
      if (uploadResponse.data && uploadResponse.data.length > 0) {
        participantData.headshot = uploadResponse.data[0].id
      }
    } else if (headshotCleared.value) {
      participantData.headshot = null
    }

    if (editedParticipant.value.documentId) {
      await api.put(`/participants/${editedParticipant.value.documentId}`, {
        data: participantData,
      })
      showSnackbar('Participant updated successfully', 'success')
    } else {
      await api.post('/participants/create', { data: participantData })
      showSnackbar('Participant created successfully', 'success')
    }

    await eventsStore.fetchEvent(props.event.id?.toString() || '')
    if (editedParticipant.value.id) {
      const updatedParticipant = eventsStore.event?.participants?.find(
        (p) => p.id === editedParticipant.value.id
      )
      if (updatedParticipant) {
        editedParticipant.value = {
          ...updatedParticipant,
          department: updatedParticipant.department?.id,
        }
      }
    }
  } catch (error: unknown) {
    const err = error as AxiosError<any>

    if (err.response?.status === 409) {
      showSnackbar(
        'An existing participant already has this number. Please input a different participant number.',
        'error'
      )
    } else {
      showSnackbar('Error saving participant', 'error')
    }

    console.error('Error saving participant:', err)
  } finally {
    participantDialog.value = false
  }
}

const deleteParticipant = async (item: ParticipantData) => {
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`/participants/${item.documentId}`)
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
    showSnackbar('Participant deleted successfully', 'success')
  } catch (error) {
    showSnackbar('Failed to delete participant', 'error')
    console.error('Error deleting participant:', error)
  }
}
</script>
