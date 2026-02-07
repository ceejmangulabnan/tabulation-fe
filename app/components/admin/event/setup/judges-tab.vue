<template>
  <div>
    <v-card-title class="font-weight-bold">Judges</v-card-title>
    <v-data-table
      v-if="!smAndDown"
      :headers="judgeHeaders"
      :items="event.judges"
      class="mb-4"
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
      <template #item.actions="{ item }">
        <v-icon
          small
          color="error"
          @click="removeJudge(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    <v-list
      v-else
      class="mb-4"
      lines="one"
    >
      <v-list-item
        v-for="judge in event.judges"
        :key="judge.id"
        :title="judge.name"
      >
        <template #append>
          <v-icon
            color="error"
            @click="removeJudge(judge)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-list-item>
      <v-list-item v-if="event.judges?.length === 0">
        <v-list-item-title class="text-center text-grey-darken-2">
          No Judges Assigned
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <v-tabs
      v-model="judgeTab"
      bg-color="primary"
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
            :disabled="!selectedJudge"
            @click="assignJudge"
          >
            Assign
          </v-btn>
        </v-card-text>
      </v-window-item>
      <v-window-item value="create">
        <v-card-text>
          <v-text-field
            v-model="newJudge.name"
            label="Name"
          />
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
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
  availableJudges: {
    type: Array as PropType<JudgeData[]>,
    required: true,
  },
  judgeRoleId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['judges-updated'])

const api = useStrapiApi()
const eventsStore = useEventsStore()
const authStore = useAuthStore()
const snackbar = useSnackbar()
const { smAndDown } = useDisplay()

const judgeTab = ref('assign')
const selectedJudge = ref<number | null>(null)
const newJudge = ref({ name: '', username: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMsg = ref<string | null>(null)
const route = useRoute()

const eventId = route.params.id
console.log('EventID', eventId)

// --- Judges Tab ---
const judgeHeaders = [
  { title: 'Name', key: 'name', class: 'font-weight-bold' },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
]

const assignJudge = async () => {
  const selectedJudgeUserData = props.availableJudges.find((j) => j.id === selectedJudge.value)
  if (!selectedJudgeUserData) return

  try {
    const res = await api.put(`/judges/${selectedJudgeUserData.documentId}`, {
      data: {
        events: {
          connect: [props.event.documentId],
        },
        name: selectedJudgeUserData.username,
      },
    })

    if (res.status === 200) {
      snackbar.showSnackbar('Judge assigned successfully', 'success')
    }

    await eventsStore.fetchEvent(props.event.id?.toString() || '')
    emit('judges-updated')
    selectedJudge.value = null
  } catch (e) {
    snackbar.showSnackbar('Failed to assign judge.', 'error')
    console.error('Could not assign judge', e)
  }
}

const removeJudge = async (judge: JudgeData) => {
  if (!confirm('Are you sure?')) return
  try {
    await api.put(`/judges/${judge.documentId}`, {
      data: {
        events: {
          disconnect: [props.event.documentId],
        },
      },
    })
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
    emit('judges-updated')
    snackbar.showSnackbar('Judge removed successfully', 'success')
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
  // if (!props.judgeRoleId) {
  //   console.error('Judge role ID not found')
  //   return
  // }
  try {
    if (newJudge.value.password !== newJudge.value.confirmPassword) {
      errorMsg.value = 'Passwords do not match!'
      return
    }

    await authStore.register(
      newJudge.value.name,
      newJudge.value.username,
      newJudge.value.password,
      newJudge.value.email,
      eventsStore.event?.documentId
    )

    snackbar.showSnackbar('Judge created successfully!', 'success')
    emit('judges-updated')

    await eventsStore.fetchEvent(String(eventId))
  } catch (e) {
    snackbar.showSnackbar('Failed to create judge', 'error')
    console.error('Could not create or assign judge', e)
  }
}
</script>
