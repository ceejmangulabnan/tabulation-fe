<template>
  <div>
    <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
      <span>Participants</span>
      <v-btn
        color="green"
        icon="mdi-plus"
        density="compact"
        @click="showParticipantDialog()"
      />
    </v-card-title>
    <v-card-text>
      <v-data-table
        v-if="!smAndDown"
        :headers="participantHeaders"
        :items="event.participants"
      >
        <template #item.headshot="{ item }">
          <v-avatar
            v-if="item.headshot"
            @click="showImagePreview(item.headshot.url)"
          >
            <v-img :src="getStrapiUrl(item.headshot.formats.thumbnail.url)" />
          </v-avatar>
        </template>
        <template #item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="showParticipantDialog(item as ParticipantData)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            color="error"
            @click="deleteParticipant(item as ParticipantData)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
      <v-list
        v-else
        lines="two"
      >
        <v-list-item
          v-for="participant in event.participants"
          :key="participant.id"
          :title="participant.name"
          :subtitle="`#${participant.number}`"
        >
          <template #prepend>
            <v-avatar
              v-if="participant.headshot"
              @click="showImagePreview(participant.headshot.url)"
            >
              <v-img :src="getStrapiUrl(participant.headshot.formats.thumbnail.url)" />
            </v-avatar>
            <v-avatar v-else>
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </template>
          <template #append>
            <v-icon
              class="mr-2"
              @click="showParticipantDialog(participant as ParticipantData)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              color="error"
              @click="deleteParticipant(participant as ParticipantData)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-list-item>
        <v-list-item v-if="event.participants.length === 0">
          <v-list-item-title class="text-center text-grey-darken-2">
            No Participants
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-dialog
      v-model="imagePreviewDialog"
      max-width="500px"
    >
      <v-card>
        <v-img :src="imagePreviewUrl" />
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="participantDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ editedParticipant.id ? 'Edit' : 'Add' }} Participant</span>
        </v-card-title>
        <v-card-text>
          <v-img
            v-if="headshotPreviewUrl"
            :src="headshotPreviewUrl"
            max-height="150"
            class="mb-2"
          />
          <v-img
            v-else-if="editedParticipant.headshot"
            :src="getStrapiUrl(editedParticipant.headshot.url)"
            max-height="150"
            class="mb-2"
            style="cursor: pointer"
            @click="showImagePreview(editedParticipant.headshot.url)"
          />
          <v-file-input
            v-model="headshotFile"
            :label="
              editedParticipant.headshot?.url ? 'Replace Headshot Image' : 'Upload Headshot Image'
            "
            accept="image/*"
            prepend-icon="mdi-camera"
            clearable
          />
          <v-text-field
            v-model="editedParticipant.name"
            label="Name"
            required
          />
          <v-text-field
            v-model.number="editedParticipant.number"
            label="Number"
            type="number"
            required
          />
          <v-select
            v-model="editedParticipant.gender"
            :items="['male', 'female']"
            label="Gender"
            required
          />
          <v-autocomplete
            v-model="editedParticipant.department"
            :items="departments"
            item-title="name"
            item-value="id"
            label="Department"
          />
          <v-textarea
            v-model="editedParticipant.notes"
            label="Notes"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            @click="participantDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            @click="saveParticipant"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
  departments: {
    type: Array as PropType<any[]>,
    required: true,
  },
})

const api = useStrapiApi()
const eventsStore = useEventsStore()
const snackbar = useSnackbar()
const { smAndDown } = useDisplay()

interface EditedParticipantData extends Omit<Partial<ParticipantData>, 'department'> {
  department?: number | undefined
}

const participantHeaders = [
  { title: 'Headshot', key: 'headshot', sortable: false, class: 'd-none d-sm-table-cell' },
  { title: 'Name', key: 'name' },
  { title: 'Number', key: 'number' },
  { title: 'Gender', key: 'gender', class: 'd-none d-md-table-cell' },
  { title: 'Department', key: 'department.name', class: 'd-none d-md-table-cell' },
  { title: 'Actions', key: 'actions', sortable: false },
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

    if (!participantData.name || !participantData.number || !participantData.gender) {
      snackbar.showSnackbar('Name, number, and gender are required.', 'error')
      return
    }

    if (headshotFile.value) {
      const file: File = headshotFile.value
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        snackbar.showSnackbar('Only JPEG, JPG, PNG, and WebP images are accepted.', 'error')
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
      snackbar.showSnackbar('Participant updated successfully', 'success')
    } else {
      await api.post('/participants/create', { data: participantData })
      snackbar.showSnackbar('Participant created successfully', 'success')
    }

    await eventsStore.fetchEvent(props.event.documentId)
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
  } catch (error) {
    console.error('Error saving participant:', error)
  } finally {
    participantDialog.value = false
  }
}

const deleteParticipant = async (item: ParticipantData) => {
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`/participants/${item.documentId}`)
    await eventsStore.fetchEvent(props.event.documentId)
    snackbar.showSnackbar('Participant deleted successfully', 'success')
  } catch (error) {
    snackbar.showSnackbar('Failed to delete participant', 'error')
    console.error('Error deleting participant:', error)
  }
}
</script>
