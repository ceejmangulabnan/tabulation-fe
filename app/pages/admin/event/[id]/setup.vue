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
                    item-title="username"
                    item-value="id"
                    label="Search for a judge"
                  />
                  <v-btn
                    color="nrimary"
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
                    type="password"
                  />
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStrapiApi } from '~/composables/useStrapiApi'
import { useEventsStore } from '~/stores/events'

// --- State ---
const tab = ref('one')
const judgeTab = ref('assign')
const route = useRoute()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const dataLoaded = ref(false)
const event = ref<Partial<EventData>>({
  id: 0,
  name: '',
  description: '',
  event_status: 'draft',
  categories: [],
  judges: [],
})
const categoryDialog = ref(false)
const editedCategory = ref<Partial<CategoryData>>({
  id: 0,
  name: '',
  weight: 0,
})
const availableJudges = ref<StrapiUser[]>([])
const selectedJudge = ref<number | null>(null)
const newJudge = ref({ username: '', email: '', password: '' })
const judgeRoleId = ref<number | null>(null)

// --- Headers ---
const categoryHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Weight', key: 'weight' },
  { title: 'Actions', key: 'actions', sortable: false },
]
const judgeHeaders = [
  { title: 'Username', key: 'users_permissions_user.username' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const eventId = route.params.id as string
console.log('Event ID from params:', eventId)
console.log('New Event data:', eventsStore.newEvent)

// // --- Data Fetching ---
// const fetchEvent = async () => {
//   try {
//     const response = await api.get(`events?populate=*&filters[id][$eq]=${eventId}`)
//     const eventData = response.data.data
//     event.value = {
//       id: eventData.id,
//       ...eventData.attributes,
//     }
//     dataLoaded.value = true
//   } catch (error) {
//     console.error('Error fetching event:', error)
//   }
// }

const fetchAvailableJudges = async () => {
  try {
    // Assumes the role is 'Authenticated' for judges for now,
    // as per default Strapi public registration.
    // This can be changed to a specific 'Judge' role if it exists.
    const res = await api.get('/users?filters[userRole][name]=judge')
    availableJudges.value = res.data
  } catch (e) {
    console.error('Could not fetch judges', e)
  }
}

const fetchJudgeRole = async () => {
  try {
    const res = await api.get('/users-permissions/roles')
    const judgeRole = res.data.roles.find((r: any) => r.type === 'judge' || r.name === 'Judge')
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
  if (eventsStore.newEvent && eventsStore.newEvent.id === eventIdNum) {
    const newEventData = eventsStore.newEvent
    event.value = {
      id: newEventData.id,
      name: newEventData.name,
      description: newEventData.description,
      event_status: newEventData.event_status || 'draft',
      categories: [],
      judges: [],
    }
    eventsStore.clearNewEvent()
  } else {
    await eventsStore.fetchEvent(eventId)
    if (eventsStore.event) {
      event.value = {
        id: eventsStore.event.id,
        name: eventsStore.event.name,
        description: eventsStore.event.description,
        event_status: eventsStore.event.event_status || 'draft',
        categories: [],
        judges: [],
      }
    }
  }
  await fetchAvailableJudges()
  await fetchJudgeRole()
})

// --- Event Info Tab ---
const handleSave = async () => {
  try {
    await api.put(`/events/${eventId}`, {
      data: { name: event.value.name, description: event.value.description },
    })
  } catch (error) {
    console.error('Error updating event:', error)
  }
}

// --- Categories Tab ---
const totalWeight = computed(() =>
  (event.value.categories || []).reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
)
const showCategoryDialog = (item: CategoryData | null = null) => {
  editedCategory.value = item ? { ...item } : { id: 0, name: '', weight: 0 }
  categoryDialog.value = true
}
const saveCategory = async () => {
  try {
    const data = { ...editedCategory.value, event: eventId }
    if (editedCategory.value.id) {
      await api.put(`/categories/${editedCategory.value.id}`, { data })
    } else {
      await api.post('/categories', { data })
    }
    await eventsStore.fetchEvent(eventId)
  } catch (error) {
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
  if (!selectedJudge.value) return
  try {
    await api.post('/judges', {
      data: {
        event: eventId,
        users_permissions_user: selectedJudge.value,
      },
    })
    await eventsStore.fetchEvent(eventId)
    selectedJudge.value = null
  } catch (e) {
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

const createJudge = async () => {
  if (!judgeRoleId.value) {
    console.error('Judge role ID not found')
    return
  }
  try {
    // Create user
    const userRes = await api.post('/users', {
      ...newJudge.value,
      role: judgeRoleId.value,
      confirmed: true,
      provider: 'local',
    })

    // Assign user as judge to event
    await api.post('/judges', {
      data: {
        event: eventId,
        users_permissions_user: userRes.data.id,
      },
    })

    await eventsStore.fetchEvent(eventId)
    await fetchAvailableJudges()
    newJudge.value = { username: '', email: '', password: '' }
  } catch (e) {
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
    await api.put(`/events/${eventId}`, { data: { event_status: 'active' } })
    if (event.value) {
      event.value.event_status = 'active'
    }
  } catch (error) {
    console.error('Error activating event:', error)
  }
}
</script>
