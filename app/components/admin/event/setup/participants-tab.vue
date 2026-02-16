<template>
  <div>
    <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
      <span class="font-weight-bold">Participants</span>

      <v-btn
        v-if="smAndDown"
        density="compact"
        color="green"
        icon="mdi-plus"
        @click="showParticipantDialog()"
      />

      <v-btn
        v-else
        prepend-icon="mdi-plus"
        color="green"
        @click="showParticipantDialog()"
      >
        Add participant
      </v-btn>
    </v-card-title>
    <v-card-text>
      <div v-if="!smAndDown">
        <div class="text-h6">Male Participants</div>
        <v-data-table
          :headers="participantHeaders"
          :items="maleParticipants"
          no-data-text="No male participants yet"
          :sort-by="[{ key: 'number', order: 'asc' }]"
          hide-default-footer
        >
          <template #headers="{ columns, getSortIcon, isSorted, toggleSort }">
            <tr>
              <template
                v-for="column in columns"
                ::key="column.key"
              >
                <th @click="toggleSort(column)">
                  <div class="font-weight-bold d-flex cursor-pointer">
                    <span
                      class="me-2 cursor-pointer"
                      v-text="column.title"
                    ></span>

                    <v-icon
                      v-if="isSorted(column)"
                      :icon="getSortIcon(column)"
                      color="medium-emphasis"
                    ></v-icon>
                  </div>
                </th>
              </template>
            </tr>
          </template>
          <template #item.headshot="{ item }">
            <v-avatar
              v-if="item.headshot"
              @click="showImagePreview(item.headshot.url)"
            >
              <v-img :src="getStrapiUrl(item.headshot.formats.thumbnail.url)" />
            </v-avatar>
          </template>
          <template #item.name="{ item }">
            <div class="d-flex align-center py-2">
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
        <div class="text-h6 mt-4">Female Participants</div>
        <v-data-table
          :headers="participantHeaders"
          :items="femaleParticipants"
          no-data-text="No female participants yet"
          :sort-by="[{ key: 'number', order: 'asc' }]"
          hide-default-footer
        >
          <template #headers="{ columns, getSortIcon, isSorted, toggleSort }">
            <tr>
              <template
                v-for="column in columns"
                ::key="column.key"
              >
                <th @click="toggleSort(column)">
                  <div class="font-weight-bold d-flex cursor-pointer">
                    <span
                      class="me-2 cursor-pointer"
                      v-text="column.title"
                    ></span>

                    <v-icon
                      v-if="isSorted(column)"
                      :icon="getSortIcon(column)"
                      color="medium-emphasis"
                    ></v-icon>
                  </div>
                </th>
              </template>
            </tr>
          </template>
          <template #item.headshot="{ item }">
            <v-avatar
              v-if="item.headshot"
              @click="showImagePreview(item.headshot.url)"
            >
              <v-img :src="getStrapiUrl(item.headshot.formats.thumbnail.url)" />
            </v-avatar>
          </template>
          <template #item.name="{ item }">
            <div class="d-flex align-center py-2">
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
      </div>
      <div v-else>
        <div class="text-h6">Male Participants</div>
        <v-list lines="two">
          <v-list-item
            v-for="participant in maleParticipants"
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
            <template #title>
              <div class="d-flex align-center">
                <span>{{ participant.name }}</span>
                <v-chip
                  v-if="participant.participant_status === 'eliminated'"
                  color="red"
                  class="ml-2"
                  size="small"
                  label
                >
                  Eliminated
                </v-chip>
              </div>
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
          <v-list-item v-if="maleParticipants.length === 0">
            <v-list-item-title class="text-center text-grey-darken-2">
              No Male Participants
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <div class="text-h6 mt-4">Female Participants</div>
        <v-list lines="two">
          <v-list-item
            v-for="participant in femaleParticipants"
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
            <template #title>
              <div class="d-flex align-center">
                <span>{{ participant.name }}</span>
                <v-chip
                  v-if="participant.participant_status === 'eliminated'"
                  color="red"
                  class="ml-2"
                  size="small"
                  label
                >
                  Eliminated
                </v-chip>
              </div>
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
          <v-list-item v-if="femaleParticipants.length === 0">
            <v-list-item-title class="text-center text-grey-darken-2">
              No Female Participants
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
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
      <v-form @submit.prevent="saveParticipant">
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
              :autofocus="true"
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
              color="green"
              @click="participantDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="green"
              type="submit"
              variant="tonal"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
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
const snackbar = useSnackbar()
const { smAndDown } = useDisplay()

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
  {
    title: 'Headshot',
    key: 'headshot',
    sortable: false,
    class: 'font-weight-bold d-none d-sm-table-cell',
  },
  { title: 'Name', key: 'name', class: 'font-weight-bold' },
  { title: 'Number', key: 'number', class: 'font-weight-bold' },
  { title: 'Gender', key: 'gender', class: 'font-weight-bold d-none d-md-table-cell' },
  { title: 'Department', key: 'department.name', class: 'font-weight-bold d-none d-md-table-cell' },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
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

    // If it's an existing participant and no new headshot is uploaded and not explicitly cleared,
    // retain the existing headshot ID.
    if (
      editedParticipant.value.documentId &&
      editedParticipant.value.headshot &&
      !headshotFile.value &&
      !headshotCleared.value
    ) {
      participantData.headshot = editedParticipant.value.headshot.id
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
      snackbar.showSnackbar(
        'An existing participant already has this number. Please input a different participant number.',
        'error'
      )
    } else {
      snackbar.showSnackbar('Error saving participant', 'error')
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
    snackbar.showSnackbar('Participant deleted successfully', 'success')
  } catch (error) {
    snackbar.showSnackbar('Failed to delete participant', 'error')
    console.error('Error deleting participant:', error)
  }
}
</script>
