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
            :clearable="true"
            :multiple="true"
            autocomplete="off"
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
        <v-form
          ref="formRef"
          @submit.prevent="createJudge"
        >
          <v-card-text>
            <v-text-field
              v-model="newJudge.name"
              label="Name"
              :rules="requiredRule"
            />
            <v-text-field
              v-model="newJudge.username"
              label="Username"
              :rules="requiredRule"
            />
            <v-text-field
              v-model="newJudge.email"
              label="Email"
              :rules="[...emailRule, ...requiredRule]"
            />
            <v-text-field
              v-model="newJudge.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              :rules="[...requiredRule, ...passwordLengthRule]"
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
              :rules="[...requiredRule, ...passwordLengthRule, ...passwordMatchRule]"
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
              class="mt-4"
              color="green"
              type="submit"
            >
              Create and Assign
            </v-btn>
          </v-card-text>
        </v-form>
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
const selectedJudge = ref<number[] | null>(null)
const newJudge = ref({ name: '', username: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const route = useRoute()

// Form Validation Rules
const formRef = ref<HTMLFormElement | null>(null)

const requiredRule = [(v: string) => !!v || 'Field is required']
const emailRule = [(v: string) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid']
const passwordLengthRule = [
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
]
const passwordMatchRule = [(v: string) => v === newJudge.value.password || 'Passwords do not match']

const eventId = route.params.id

// --- Judges Tab ---
const judgeHeaders = [
  { title: 'Name', key: 'name', class: 'font-weight-bold' },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
]

const assignJudge = async () => {
  if (!selectedJudge.value || selectedJudge.value.length === 0) {
    snackbar.showSnackbar('Please select at least one judge to assign.', 'warning')
    return
  }

  const assignmentPromises = selectedJudge.value.map(async (judgeId) => {
    const judgeToAssign = props.availableJudges.find((j) => j.id === judgeId)
    if (!judgeToAssign) {
      console.warn(`Could not find judge with ID ${judgeId} in available judges.`)
      return Promise.resolve(null)
    }

    return api.put(`/judges/${judgeToAssign.documentId}`, {
      data: {
        events: {
          connect: [props.event.documentId],
        },
        name: judgeToAssign.name,
      },
    })
  })

  try {
    const results = await Promise.all(assignmentPromises)
    const successfulAssignments = results.filter((res) => res && res.status === 200).length

    if (successfulAssignments > 0) {
      snackbar.showSnackbar(`${successfulAssignments} judge(s) assigned successfully`, 'success')
    } else {
      snackbar.showSnackbar('No judges were assigned. Please try again.', 'error')
    }

    await eventsStore.fetchEvent(props.event.id?.toString() || '')
    emit('judges-updated')
    selectedJudge.value = null // Clear selection after successful judge assignment
  } catch (e) {
    snackbar.showSnackbar('Failed to assign one or more judges.', 'error')
    console.error('Could not assign judges', e)
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
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    await authStore.register(
      newJudge.value.name,
      newJudge.value.username,
      newJudge.value.password,
      newJudge.value.email,
      eventsStore.event?.documentId,
      false // Prevent login of created judge in event setup
    )

    snackbar.showSnackbar('Judge created successfully!', 'success')

    await eventsStore.fetchEvent(String(eventId))
    emit('judges-updated')
  } catch (e) {
    snackbar.showSnackbar('Failed to create judge', 'error')
    console.error('Could not create or assign judge', e)
  }
}
</script>
