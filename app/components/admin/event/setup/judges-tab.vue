<template>
  <div>
    <h3 class="font-bold text-lg mb-4">Judges</h3>
    <div class="hidden md:block mb-4">
      <UTable
        :data="event.judges || []"
        :columns="judgeHeaders"
      >
        <template #actions-cell="{ row }">
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click="removeJudge(row.original)"
          />
        </template>
      </UTable>
    </div>
    <div class="md:hidden mb-4 space-y-1">
      <div
        v-for="judge in event.judges"
        :key="judge.id"
        class="flex items-center justify-between p-2"
      >
        <span>{{ judge.name }}</span>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="xs"
          @click="removeJudge(judge)"
        />
      </div>
      <div v-if="event.judges?.length === 0" class="text-center text-muted py-4">
        No Judges Assigned
      </div>
    </div>

    <UTabs v-model="judgeTab" :items="tabItems" class="mb-4" />

    <div v-if="judgeTab === 'assign'">
      <div class="space-y-4">
        <UFormField label="Search for a judge">
          <USelectMenu
            v-model="selectedJudge as any"
            :items="availableJudges.map(j => ({ label: j.name, value: j }))"
            class="w-full"
            multiple
            searchable
          />
        </UFormField>
        <UButton
          label="Assign"
          :disabled="!selectedJudge"
          @click="assignJudge"
        />
      </div>
    </div>

    <div v-else-if="judgeTab === 'create'">
      <UForm @submit.prevent="createJudge">
        <div class="space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="newJudge.name"
              class="w-full"
              placeholder="Enter judge name"
            />
          </UFormField>
          <UFormField label="Username">
            <UInput
              v-model="newJudge.username"
              class="w-full"
              placeholder="Enter username"
            />
          </UFormField>
          <UFormField label="Email">
            <UInput
              v-model="newJudge.email"
              class="w-full"
              type="email"
              placeholder="Enter email"
            />
          </UFormField>
          <UFormField label="Password">
            <UInput
              v-model="newJudge.password"
              class="w-full"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                  :padded="false"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>
          <UFormField label="Confirm Password">
            <UInput
              v-model="newJudge.confirmPassword"
              class="w-full"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm password"
              :ui="{ trailing: 'pe-1' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  :icon="showConfirmPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                  :padded="false"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </UInput>
          </UFormField>
        </div>
        <div class="flex justify-end mt-4">
          <UButton
            label="Create and Assign"
            type="submit"
          />
        </div>
      </UForm>
    </div>
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
const { showSnackbar } = useSnackbar()

const judgeTab = ref('assign')
const tabItems = [
  { label: 'Assign Existing', value: 'assign' },
  { label: 'Create New', value: 'create' },
]
const selectedJudge = ref<JudgeData[]>([])
const newJudge = ref({ name: '', username: '', email: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const route = useRoute()

const eventId = route.params.id

const judgeHeaders = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'actions', header: '' },
]

const assignJudge = async () => {
  if (!selectedJudge.value || selectedJudge.value.length === 0) {
    showSnackbar('Please select at least one judge to assign.', 'warning')
    return
  }

  const assignmentPromises = selectedJudge.value.map(async (judge) => {
    const judgeToAssign = judge.id ? judge : props.availableJudges.find((j) => j.documentId === judge.documentId)
    if (!judgeToAssign) {
      console.warn(`Could not find judge with ID ${judge.documentId} in available judges.`)
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
      showSnackbar(`${successfulAssignments} judge(s) assigned successfully`, 'success')
    } else {
      showSnackbar('No judges were assigned. Please try again.', 'error')
    }

    await eventsStore.fetchEvent(props.event.id?.toString() || '')
    emit('judges-updated')
    selectedJudge.value = []
  } catch (e) {
    showSnackbar('Failed to assign one or more judges.', 'error')
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
    showSnackbar('Judge removed successfully', 'success')
  } catch (e) {
    showSnackbar('Failed to delete judge', 'error')
    console.error('Could not remove judge', e)
  }
}

const createJudge = async () => {
  if (!newJudge.value.name || !newJudge.value.password) {
    showSnackbar('Please fill in all required fields.', 'error')
    return
  }
  if (newJudge.value.password !== newJudge.value.confirmPassword) {
    showSnackbar('Passwords do not match.', 'error')
    return
  }
  if (newJudge.value.password.length < 6) {
    showSnackbar('Password must be at least 6 characters.', 'error')
    return
  }
  try {
    await authStore.register(
      newJudge.value.name,
      newJudge.value.username,
      newJudge.value.password,
      newJudge.value.email,
      eventsStore.event?.documentId,
      false
    )

    showSnackbar('Judge created successfully!', 'success')

    await eventsStore.fetchEvent(String(eventId))
    emit('judges-updated')
  } catch (e) {
    showSnackbar('Failed to create judge', 'error')
    console.error('Could not create or assign judge', e)
  }
}
</script>
