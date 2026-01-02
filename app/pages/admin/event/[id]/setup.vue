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
                    @click="showCategoryDialog(item)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    @click="deleteCategory(item)"
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
const event = computed<Partial<EventData>>(
  () =>
    eventsStore.event || {
      documentId: '',
      id: 0,
      name: '',
      description: '',
      event_status: 'draft',
      categories: [],
      judges: [],
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

// --- Tab Headers ---
const categoryHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Weight', key: 'weight' },
  { title: 'Actions', key: 'actions', sortable: false },
]
const judgeHeaders = [
  { title: 'Name', key: 'users_permissions_user.username' },
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

const onTabChange = (value: string) => {
  if ((value === 'two' || value === 'three') && !dataLoaded.value) {
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
  console.log('Event:', event.value)
  console.log('Available Judges', availableJudges.value)
})

// --- Event Info Tab ---
const handleSave = async () => {
  try {
    console.log('Current Event', event.value)
    await api.put(`/events/${eventsStore.event?.documentId}`, {
      data: {
        name: event.value.name,
        description: event.value.description,
      },
    })
  } catch (error) {
    console.error('Error updating event:', error)
  }
}

// --- Categories Tab ---
const totalWeight = computed(() =>
  (event.value.categories || []).reduce((sum, c) => sum + (Number(c.weight * 100) || 0), 0)
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

// TODO: 400 on save
const saveCategory = async () => {
  try {
    // const data = { ...editedCategory.value }
    const updateCategoryPayload = {
      data: {
        name: editedCategory.value.name,
        weight: editedCategory.value.weight,
      },
    }
    console.log('Update Category Data:', updateCategoryPayload)
    if (editedCategory.value.documentId) {
      await api.put(`/categories/${editedCategory.value.documentId}`, updateCategoryPayload)
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
    await api.put(`/judges/${selectedJudgeUserData.documentId}`, {
      data: {
        events: {
          connect: [event.value.documentId],
        },
        name: selectedJudgeUserData.username,
      },
    })

    snackbar.showSnackbar('Judge assigned successfully', 'success')
    await eventsStore.fetchEvent(eventId)
    selectedJudge.value = null
  } catch (e) {
    snackbar.showSnackbar('Failed to assign judge', 'error')
    console.error('Could not assign judge', e)
  }
}

const removeJudge = async (judge: JudgeData) => {
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`/judges/${judge.id}`)
    await eventsStore.fetchEvent(eventId)
  } catch (e) {
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
    await api.put(`/events/${event.value.documentId}`, { data: { event_status: 'active' } })
    if (event.value) {
      event.value.event_status = 'active'
    }

    snackbar.showSnackbar(`${event.value.name} is now active`, 'success')
  } catch (error) {
    snackbar.showSnackbar(`Failed to activate ${event.value.name}`, 'error')
    console.error('Error activating event:', error)
  }
}
</script>
