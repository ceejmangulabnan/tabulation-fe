<template>
  <v-container>
    <v-card>
      <v-tabs
        v-model="tab"
        bg-color="green"
        @update:model-value="onTabChange"
      >
        <v-tab value="one">Event Info</v-tab>
        <v-tab value="two">Categories</v-tab>
        <v-tab value="three">Judges</v-tab>
        <v-tab value="four">Participants</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="one">
            <v-card-title>Event Information</v-card-title>
            <v-card-text>
              <v-text-field
                label="Title"
                v-model="event.name"
              />
              <v-textarea
                label="Description"
                v-model="event.description"
              />
              <v-text-field
                label="Status"
                :model-value="event.event_status"
                readonly
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green"
                @click="handleSave"
              >
                Update
              </v-btn>
            </v-card-actions>
          </v-window-item>

          <v-window-item value="two">
            <v-card-title class="d-flex align-center">
              Categories
              <v-spacer />
              <v-btn
                color="green"
                @click="showCategoryDialog()"
              >
                Add Category
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="categoryHeaders"
                :items="event.categories"
              >
                <template v-slot:item.actions="{ item }">
                  <v-icon
                    small
                    class="mr-2"
                    @click="showCategoryDialog(item as CategoryData)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    @click="deleteCategory(item as CategoryData)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
              <p class="mt-4">Total Weight: {{ totalWeight }} / 100</p>
            </v-card-text>
          </v-window-item>

          <v-window-item value="three">
            <v-card-title>Judges</v-card-title>
            <v-data-table
              :headers="judgeHeaders"
              :items="event.judges"
              class="mb-4"
            >
              <template v-slot:item.actions="{ item }">
                <v-icon
                  small
                  @click="removeJudge(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>

            <v-tabs
              v-model="judgeTab"
              bg-color="secondary"
            >
              <v-tab value="assign">Assign Existing</v-tab>
              <v-tab value="create">Create New</v-tab>
            </v-tabs>
            <v-window v-model="judgeTab">
              <v-window-item value="assign">
                <v-card-text>
                  <v-autocomplete
                    v-model="selectedJudge"
                    :items="availableJudges"
                    item-title="name"
                    item-value="id"
                    label="Search for a judge"
                  />
                  <v-btn
                    color="primary"
                    @click="assignJudge"
                    :disabled="!selectedJudge"
                  >
                    Assign
                  </v-btn>
                </v-card-text>
              </v-window-item>
              <v-window-item value="create">
                <v-card-text>
                  <v-text-field
                    v-model="newJudge.username"
                    label="Username"
                  />
                  <v-text-field
                    v-model="newJudge.email"
                    label="Email (optional)"
                  />
                  <v-text-field
                    v-model="newJudge.password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                  >
                    <template #append-inner>
                      <v-btn
                        tabindex="-1"
                        icon
                        variant="text"
                        @click="toggleShowPassword"
                      >
                        <v-icon size="small">
                          {{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off' }}
                        </v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                  <v-text-field
                    v-model="newJudge.confirmPassword"
                    label="Confirm Password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                  >
                    <template #append-inner>
                      <v-btn
                        tabindex="-1"
                        icon
                        variant="text"
                        @click="toggleShowConfirmPassword"
                      >
                        <v-icon size="small">
                          {{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off' }}
                        </v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                  <v-btn
                    color="green"
                    @click="createJudge"
                  >
                    Create and Assign
                  </v-btn>
                </v-card-text>
              </v-window-item>
            </v-window>
          </v-window-item>

          <v-window-item value="four">
            <v-card-title class="d-flex align-center">
              Participants
              <v-spacer />
              <v-btn
                color="green"
                @click="showParticipantDialog()"
              >
                Add Participant
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
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
                    @click="deleteParticipant(item as ParticipantData)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-window-item>
        </v-window>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="green"
          :disabled="!canActivate"
          @click="activateEvent"
        >
          Activate Event
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog
      v-model="categoryDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{ editedCategory.id ? 'Edit' : 'Add' }} Category</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedCategory.name"
            label="Name"
          />
          <v-text-field
            v-model.number="editedCategory.weight"
            label="Weight"
            type="number"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            @click="categoryDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            @click="saveCategory"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
  </v-container>
</template>

<script setup lang="ts">
// --- State ---
const tab = ref('one')
const judgeTab = ref('assign')
const route = useRoute()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const snackbar = useSnackbar()
const dataLoaded = ref(false)
const errorMsg = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const event = computed<Partial<EventData>>(() =>
  eventsStore.event
    ? {
        ...eventsStore.event,
        participants: eventsStore.event.participants || [],
      }
    : {
        documentId: '',
        id: 0,
        name: '',
        description: '',
        event_status: 'draft',
        categories: [],
        judges: [],
        participants: [],
      }
)
const categoryDialog = ref(false)
const editedCategory = ref<Partial<CategoryData>>({
  id: 0,
  name: '',
  weight: 0,
})
const availableJudges = ref<JudgeData[]>([])
const selectedJudge = ref<number | null>(null)
const newJudge = ref({ username: '', email: '', password: '', confirmPassword: '' })
const judgeRoleId = ref<number | null>(null)

// --- Participant State & Headers ---
const participantHeaders = [
  { title: 'Headshot', key: 'headshot', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Number', key: 'number' },
  { title: 'Gender', key: 'gender' },
  { title: 'Department', key: 'department.name' },
  { title: 'Actions', key: 'actions', sortable: false },
]
const participantDialog = ref(false)
const editedParticipant = ref<
  Omit<Partial<ParticipantData>, 'department'> & { department?: number }
>({
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

const showImagePreview = (url: string) => {
  imagePreviewUrl.value = getStrapiUrl(url)
  imagePreviewDialog.value = true
}

watch(headshotFile, (newValue, oldValue) => {
  console.log('headshotFile changed:', newValue)
  // Revoke old URL if it exists
  if (headshotPreviewUrl.value) {
    URL.revokeObjectURL(headshotPreviewUrl.value)
    headshotPreviewUrl.value = null
  }
  // Create new URL if a file is selected
  if (newValue) {
    headshotPreviewUrl.value = URL.createObjectURL(newValue)
    headshotCleared.value = false
  } else if (oldValue) {
    // If the new value is empty and there was an old value, it means the field was cleared
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

const departments = ref<any[]>([])
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function getStrapiUrl(url: string) {
  const config = useRuntimeConfig()
  return `${config.public.strapiUrl}${url}`
}

// --- Tab Headers ---
const categoryHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Weight', key: 'weight' },
  { title: 'Actions', key: 'actions', sortable: false },
]
const judgeHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const eventId = route.params.id as string
console.log('Event ID from params:', eventId)
console.log('New Event data:', eventsStore.newEvent)

const fetchAvailableJudges = async () => {
  try {
    const res = await api.get('/judges')
    availableJudges.value = res.data.data
    console.log(availableJudges.value)
  } catch (e) {
    console.error('Could not fetch judges', e)
  }
}

const fetchJudgeRole = async () => {
  try {
    const res = await api.get('/users-permissions/roles')
    const judgeRole = res.data.roles.find(
      (r: any) => r.type === 'authenticated' || r.name === 'Authenticated'
    )
    if (judgeRole) {
      judgeRoleId.value = judgeRole.id
    } else {
      // fallback to authenticated if no judge role is found
      const authRole = res.data.roles.find((r: any) => r.type === 'authenticated')
      judgeRoleId.value = authRole.id
    }
  } catch (e) {
    console.error('Could not fetch roles', e)
  }
}

const fetchDepartments = async () => {
  try {
    const res = await api.get('/departments')
    departments.value = res.data.data.map((d: any) => ({
      id: d.id,
      name: d.name,
    }))
  } catch (e) {
    console.error('Could not fetch departments', e)
  }
}

const onTabChange = (value: string) => {
  if ((value === 'two' || value === 'three' || value === 'four') && !dataLoaded.value) {
    eventsStore.fetchEvent(eventId)
  }
}

onMounted(async () => {
  const eventIdNum = Number(eventId)

  if (eventsStore.newEvent?.id === eventIdNum) {
    eventsStore.event = eventsStore.newEvent
    eventsStore.clearNewEvent()
  } else {
    await eventsStore.fetchEvent(eventId)
  }

  await fetchAvailableJudges()
  await fetchJudgeRole()
  await fetchCategories()
  await fetchDepartments()
  console.log('Event:', event.value)
  console.log('Available Judges', availableJudges.value)
})

// --- Event Info Tab ---
const handleSave = async () => {
  try {
    console.log('Current Event', event.value)
    const res = await api.put(`/events/${eventsStore.event?.documentId}`, {
      data: {
        name: event.value.name,
        description: event.value.description,
      },
    })
    if (res.status === 200) {
      snackbar.showSnackbar('Event updated successfully.', 'success')
    }
  } catch (error) {
    console.error('Error updating event:', error)
    snackbar.showSnackbar('Failed to udpate event.', 'error')
  }
}

// --- Categories Tab ---
const totalWeight = computed(() =>
  (event.value.categories || []).reduce(
    (sum: number, c: CategoryData) => sum + (Number(c.weight * 100) || 0),
    0
  )
)

const showCategoryDialog = (item: CategoryData | null = null) => {
  editedCategory.value = item ? { ...item } : { id: 0, name: '', weight: 0 }
  categoryDialog.value = true
}

const fetchCategories = async () => {
  try {
    const res = await api.get(`/categories?populate=event&filters[event][id][$eq]=${eventId}`)
    console.log('Event Categories response:', res)
    if (event) event.value.categories = res.data.data
  } catch (error) {
    console.error(`Failed to fetch categories for event ID ${eventId}`, error)
  }
}

const saveCategory = async () => {
  try {
    const updateCategoryPayload = {
      data: {
        name: editedCategory.value.name,
        weight: editedCategory.value.weight,
      },
    }
    console.log('Update Category Data:', updateCategoryPayload)
    if (editedCategory.value.documentId) {
      const res = await api.put(
        `/categories/${editedCategory.value.documentId}`,
        updateCategoryPayload
      )
      if (res.status === 200) {
        snackbar.showSnackbar('Category updated successfully', 'success')
      }
    } else {
      const createCategoryPayload = {
        data: {
          name: editedCategory.value.name,
          weight: editedCategory.value.weight,
          event: {
            connect: [event.value.documentId],
          },
        },
      }

      const createCategoryResponse = await api.post('/categories', createCategoryPayload)
      console.log('Create Category Response', createCategoryResponse)
      if (createCategoryResponse.status === 201) {
        snackbar.showSnackbar('Category created successfully!', 'success')
      }
    }
    await eventsStore.fetchEvent(eventId)
  } catch (error) {
    snackbar.showSnackbar('Failed to save changes', 'error')
    console.error('Error saving category:', error)
  } finally {
    categoryDialog.value = false
  }
}
const deleteCategory = async (item: CategoryData) => {
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`/categories/${item.id}`)
    await eventsStore.fetchEvent(eventId)
  } catch (error) {
    console.error('Error deleting category:', error)
  }
}

// --- Judges Tab ---
const assignJudge = async () => {
  console.log('selectedJudge:', selectedJudge.value)
  const selectedJudgeUserData = availableJudges.value.find((j) => j.id === selectedJudge.value)
  if (!selectedJudgeUserData) return
  console.log('Selected Judge Data:', selectedJudgeUserData)
  try {
    const res = await api.put(`/judges/${selectedJudgeUserData.documentId}`, {
      data: {
        events: {
          connect: [event.value.documentId],
        },
        name: selectedJudgeUserData.username,
      },
    })

    if (res.status === 200) {
      snackbar.showSnackbar('Judge assigned successfully', 'success')
    }

    await eventsStore.fetchEvent(eventId)
    selectedJudge.value = null
  } catch (e) {
    snackbar.showSnackbar('Failed to assign judge.', 'error')
    console.error('Could not assign judge', e)
  }
}

const removeJudge = async (judge: JudgeData) => {
  if (!confirm('Are you sure?')) return
  try {
    const res = await api.delete(`/judges/${judge.documentId}`)
    await eventsStore.fetchEvent(eventId)

    if (res.status === 204) {
      snackbar.showSnackbar('Judge assigned successfully', 'success')
    }
  } catch (e) {
    snackbar.showSnackbar('Failed to delete judge', 'error')
    console.error('Could not remove judge', e)
  }
}

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const toggleShowConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const createJudge = async () => {
  if (!judgeRoleId.value) {
    console.error('Judge role ID not found')
    return
  }
  try {
    if (newJudge.value.password !== newJudge.value.confirmPassword) {
      return (errorMsg.value = 'Passwords do not match!')
    }

    await authStore.register(newJudge.value.username, newJudge.value.email, newJudge.value.password)

    snackbar.showSnackbar('Judge created successfully!', 'success')
    await fetchAvailableJudges()
  } catch (e) {
    snackbar.showSnackbar('Failed to create judge', 'error')
    console.error('Could not create or assign judge', e)
  }
}

// --- Participants Tab ---
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
  console.log('Value of headshotFile at start of save:', headshotFile.value)
  try {
    const participantData: any = {
      name: editedParticipant.value.name,
      number: editedParticipant.value.number,
      gender: editedParticipant.value.gender,
      department: editedParticipant.value.department,
      notes: editedParticipant.value.notes,
      participant_status: 'active',
      event: event.value.id,
    }

    if (!participantData.name || !participantData.number || !participantData.gender) {
      snackbar.showSnackbar(
        'Name, number, and gender (maybe department too idk) are required.',
        'error'
      )
      return
    }

    if (headshotFile.value) {
      const file: File = headshotFile.value

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        snackbar.showSnackbar('Only JPEG, JPG, PNG, and WebP images are accepted.', 'error')
        return // Prevent upload
      }

      const formData = new FormData()
      formData.append('files', file)
      console.log('Uploading headshot file:', file.name)
      const uploadResponse = await api.post('/upload', formData)
      console.log('Upload response:', JSON.stringify(uploadResponse, null, 2))

      if (uploadResponse.data && uploadResponse.data.length > 0) {
        const uploadedFile = uploadResponse.data[0]
        console.log('Uploaded file object:', JSON.stringify(uploadedFile, null, 2))

        if (uploadedFile.id) {
          participantData.headshot = uploadedFile.id
        } else {
          console.error("Uploaded file is missing 'id'", uploadedFile)
          snackbar.showSnackbar('Failed to link headshot: uploaded file has no id.', 'error')
        }
      }
    } else if (headshotCleared.value) {
      participantData.headshot = null
    }

    if (editedParticipant.value.documentId) {
      console.log(
        'Updating participant with data payload:',
        JSON.stringify({ data: participantData }, null, 2)
      )
      await api.put(`/participants/${editedParticipant.value.documentId}`, {
        data: participantData,
      })
      snackbar.showSnackbar('Participant updated successfully', 'success')
    } else {
      console.log(
        'Creating participant with data:',
        JSON.stringify({ data: participantData }, null, 2)
      )
      await api.post('/participants', { data: participantData })
      snackbar.showSnackbar('Participant created successfully', 'success')
    }

    await eventsStore.fetchEvent(eventId)
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
    await eventsStore.fetchEvent(eventId)
    snackbar.showSnackbar('Participant deleted successfully', 'success')
  } catch (error) {
    snackbar.showSnackbar('Failed to delete participant', 'error')
    console.error('Error deleting participant:', error)
  }
}

// --- Activation ---
const canActivate = computed(
  () =>
    totalWeight.value === 100 &&
    (event.value.categories || []).length > 0 &&
    event.value.event_status !== 'active'
)

const activateEvent = async () => {
  if (!canActivate.value) return
  try {
    const res = await api.put(`/events/${event.value.documentId}`, {
      data: { event_status: 'active' },
    })

    if (event.value) {
      event.value.event_status = 'active'
    }

    if (res.status === 200) {
      snackbar.showSnackbar(`${event.value.name} is now active`, 'success')
    }
  } catch (error) {
    snackbar.showSnackbar(`Failed to activate ${event.value.name}`, 'error')
    console.error('Error activating event:', error)
  }
}
</script>
