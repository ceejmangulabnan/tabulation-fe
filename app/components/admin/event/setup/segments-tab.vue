<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <span class="font-bold text-lg">Event Scoring Segments</span>
      <UButton
        v-if="smAndDown"
        icon="i-lucide-plus"
        size="xs"
        @click="showSegmentDialog()"
      />
      <UButton
        v-else
        icon="i-lucide-plus"
        label="Add segment"
        @click="showSegmentDialog()"
      />
    </div>

    <div v-if="!smAndDown">
      <UTable
        :data="event.segments || []"
        :columns="segmentColumns"
        :get-row-id="(row) => row.documentId"
      >
        <template #name-cell="{ row }">
          <span>{{ row.original.name }}</span>
        </template>
        <template #weight-cell="{ row }">
          <span>{{ row.original.weight }}</span>
        </template>
        <template #order-cell="{ row }">
          <span>{{ row.original.order }}</span>
        </template>
        <template #advancement_type-cell="{ row }">
          <span>{{ row.original.advancement_type }}</span>
        </template>
        <template #advancement_value-cell="{ row }">
          <span>{{ row.original.advancement_value }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click.stop="showSegmentDialog(row.original as SegmentData)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click.stop="deleteSegment(row.original as SegmentData)" />
          </div>
        </template>
        <template #expanded-row="{ row }">
          <div class="p-4 border border-dashed rounded bg-muted/30 mt-2">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span class="font-medium">Categories for {{ row.original.name }}</span>
              <UButton
                v-if="smAndDown"
                icon="i-lucide-plus"
                size="xs"
                @click="showCategoryDialog(null, row.original.documentId)"
              />
              <UButton
                v-else
                icon="i-lucide-plus"
                label="Add category"
                @click="showCategoryDialog(null, row.original.documentId)"
              />
            </div>
            <UTable
              :data="row.original.categories || []"
              :columns="categoryColumns"
            >
              <template #active-cell="{ row: catRow }">
                <div class="flex gap-2">
                  <UBadge
                    :color="catRow.original.active ? 'success' : 'error'"
                    size="xs"
                  >
                    {{ catRow.original.active ? 'Active' : 'Inactive' }}
                  </UBadge>
                  <UBadge
                    v-if="catRow.original.locked"
                    color="error"
                    size="xs"
                  >
                    <UIcon name="i-lucide-lock" class="mr-1 size-3" />
                    Locked
                  </UBadge>
                </div>
              </template>
              <template #actions-cell="{ row: catRow }">
                <div class="flex gap-1">
                  <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="showCategoryDialog(catRow.original as CategoryData, row.original.documentId)" />
                  <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="deleteCategory(catRow.original as CategoryData)" />
                </div>
              </template>
            </UTable>
            <div class="text-right font-bold text-sm mt-2">
              Total Category Weight: {{ calculateTotalCategoryWeight(row.original as SegmentData) }} / 100
            </div>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile view -->
    <div v-else class="space-y-4">
      <div
        v-for="segment in event.segments"
        :key="segment.id"
        class="border rounded-lg"
      >
        <div class="flex items-center justify-between p-3">
          <div>
            <div class="font-medium">{{ segment.name }}</div>
            <div class="text-sm text-muted">
              Weight: {{ segment.weight * 100 }}%, Order: {{ segment.order }}, Advancement: {{ segment.advancement_type }} {{ segment.advancement_value !== null ? `(${segment.advancement_value})` : '' }}
            </div>
          </div>
          <div class="flex gap-1">
            <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="showSegmentDialog(segment as SegmentData)" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="deleteSegment(segment as SegmentData)" />
          </div>
        </div>
        <div class="border-t p-3 bg-muted/30">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm">Categories for {{ segment.name }}</span>
            <UButton icon="i-lucide-plus" size="xs" @click="showCategoryDialog(null, segment.documentId)" />
          </div>
          <div class="space-y-2">
            <div
              v-for="cat in segment.categories"
              :key="cat.id"
              class="flex items-center justify-between p-2 bg-background rounded"
            >
              <div>
                <div class="font-medium text-sm">{{ cat.name }}</div>
                <div class="text-xs text-muted">Weight: {{ cat.weight * 100 }}%</div>
                <div class="flex gap-1 mt-1">
                  <UBadge :color="cat.active ? 'success' : 'error'" size="xs">
                    {{ cat.active ? 'Active' : 'Inactive' }}
                  </UBadge>
                  <UBadge :color="cat.locked ? 'success' : 'neutral'" size="xs">
                    {{ cat.locked ? 'Locked' : 'Unlocked' }}
                  </UBadge>
                </div>
              </div>
              <div class="flex gap-1">
                <UButton icon="i-lucide-pencil" variant="ghost" size="xs" @click="showCategoryDialog(cat as CategoryData, segment.documentId)" />
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="deleteCategory(cat as CategoryData)" />
              </div>
            </div>
            <div v-if="segment.categories.length === 0" class="text-center text-sm text-muted py-2">
              No Categories for this Segment
            </div>
          </div>
          <div class="text-right text-sm font-bold mt-2">
            Total Category Weight: {{ calculateTotalCategoryWeight(segment as SegmentData) }} / 100
          </div>
        </div>
      </div>
      <div v-if="event.segments?.length === 0" class="text-center text-muted py-4">No Segments</div>
    </div>

    <p class="mt-4 text-right font-bold">
      Total Segment Weight: {{ totalSegmentWeight }} / 100
    </p>

    <!-- Segment Dialog -->
    <UModal v-model:open="segmentDialog">
      <form @submit.prevent="saveSegment">
        <UCard>
          <h3 class="text-xl font-bold mb-4">{{ editedSegment.id ? 'Edit' : 'Add' }} Segment</h3>
          <div class="space-y-4">
            <UInput v-model="editedSegment.name" label="Name" autofocus />
            <UInput v-model.number="editedSegment.order" label="Order in Event" type="number" step="1" />
            <UInput v-model.number="editedSegment.weight" label="Weight (0.0 to 1.0)" type="number" step="0.01" />
            <USelect
              v-model="editedSegment.advancement_type"
              :items="['all', 'top_n', 'threshold', 'manual']"
              label="Advancement Type"
            />
            <UInput
              v-if="['top_n', 'threshold'].includes(editedSegment.advancement_type!)"
              :model-value="editedSegment.advancement_value ?? undefined"
              label="Advancement Value"
              type="number"
              @update:model-value="(val: any) => editedSegment.advancement_value = Number(val)"
            />
            <USelect
              v-model="editedSegment.scoring_mode"
              :items="['normalized', 'raw_category', 'ranking']"
              label="Scoring Mode"
            />
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="segmentDialog = false" />
            <UButton label="Save" type="submit" />
          </div>
        </UCard>
      </form>
    </UModal>

    <!-- Category Dialog -->
    <UModal v-model:open="categoryDialog">
      <form @submit.prevent="saveCategory">
        <UCard>
          <h3 class="text-xl font-bold mb-4">{{ editedCategory.id ? 'Edit' : 'Add' }} Category</h3>
          <div class="space-y-4">
            <UInput v-model="editedCategory.name" label="Name" autofocus />
            <UInput v-model="editedCategory.weight" label="Weight (0.0 to 1.0)" type="number" step="0.01" />
            <USelectMenu
              v-model="selectedJudges"
              :items="judgeSelectionOptions"
              label="Active Judges"
              multiple
              searchable
            />
            <div class="flex items-center gap-2">
              <USwitch v-model="editedCategory.active" />
              <span>Active</span>
            </div>
            <div class="flex items-center gap-2">
              <USwitch v-model="editedCategory.locked" />
              <span>Locked</span>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="categoryDialog = false" />
            <UButton label="Save" type="submit" />
          </div>
        </UCard>
      </form>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
})

const theme = useThemeStore()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const { showSnackbar } = useSnackbar()
const { smAndDown } = useDisplay()

const availableJudges = computed(() => {
  if (!props.event.judges) return []
  return props.event.judges.map((judge) => ({
    label: judge.name,
    value: judge.documentId,
  }))
})

const allJudgeIds = computed(() => {
  if (!props.event.judges) return []
  return props.event.judges.map((judge) => judge.documentId)
})

const selectedJudges = computed({
  get() {
    const active = editedCategory.value.active_judges || []
    return active.map((id: any) => {
      const judge = availableJudges.value.find(j => j.value === id)
      return judge || { label: id, value: id }
    })
  },
  set(val: any[]) {
    if (val.includes('__all__')) {
      editedCategory.value.active_judges = [...allJudgeIds.value] as any
      return
    }
    editedCategory.value.active_judges = val.map((v: any) => v.value ?? v) as any
  },
})

const judgeSelectionOptions = computed(() => {
  if (!availableJudges.value.length) return []
  return [
    { label: 'Select All', value: '__all__' },
    ...availableJudges.value.sort((a, b) => a.label.localeCompare(b.label)),
  ]
})

const segmentColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'weight', header: 'Weight' },
  { accessorKey: 'order', header: 'Order' },
  { accessorKey: 'advancement_type', header: 'Advancement Type' },
  { accessorKey: 'advancement_value', header: 'Advancement Value' },
  { accessorKey: 'actions', header: '' },
]

const categoryColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'weight', header: 'Weight' },
  { accessorKey: 'active', header: 'Active' },
  { accessorKey: 'actions', header: '' },
]

const segmentDialog = ref(false)
const editedSegment = ref<Partial<SegmentData>>({
  id: 0,
  name: '',
  weight: 0,
  advancement_type: 'all',
  advancement_value: null,
})
const categoryDialog = ref(false)
const editedCategory = ref<Partial<CategoryData>>({
  id: 0,
  name: '',
  weight: 0,
  active: true,
  locked: false,
  active_judges: [],
})
const currentSegmentIdForCategory = ref<string | null>(null)

const totalSegmentWeight = computed(() =>
  (props.event.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

const calculateTotalCategoryWeight = (segment: SegmentData) => {
  return (segment.categories || []).reduce((sum, c) => sum + c.weight * 100, 0)
}

const showSegmentDialog = (item: SegmentData | null = null) => {
  editedSegment.value = item
    ? { ...item }
    : { name: '', weight: 0, advancement_type: 'all', advancement_value: null }
  segmentDialog.value = true
}

const saveSegment = async () => {
  try {
    const updatePayload = {
      data: {
        name: editedSegment.value.name,
        order: editedSegment.value.order,
        weight: editedSegment.value.weight,
        advancement_type: editedSegment.value.advancement_type,
        advancement_value: ['top_n', 'threshold'].includes(editedSegment.value.advancement_type!)
          ? editedSegment.value.advancement_value
          : null,
        scoring_mode: editedSegment.value.scoring_mode,
        event: {
          connect: [props.event.documentId],
        },
      },
    }

    const createPayload = {
      data: {
        name: editedSegment.value.name,
        order: editedSegment.value.order,
        weight: editedSegment.value.weight,
        advancement_type: editedSegment.value.advancement_type,
        advancement_value: ['top_n', 'threshold'].includes(editedSegment.value.advancement_type!)
          ? editedSegment.value.advancement_value
          : null,
        scoring_mode: editedSegment.value.scoring_mode,
        event: {
          documentId: props.event.documentId,
          connect: [props.event.documentId],
        },
      },
    }
    if (editedSegment.value.documentId) {
      await api.put(`/segments/${editedSegment.value.documentId}`, updatePayload)
      showSnackbar('Segment updated successfully', 'success')
    } else {
      await api.post('/segments/create', createPayload)
      showSnackbar('Segment created successfully!', 'success')
    }
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    showSnackbar('Failed to save segment', 'error')
    console.error('Error saving segment:', error)
  } finally {
    segmentDialog.value = false
  }
}

const deleteSegment = async (item: SegmentData) => {
  if (!confirm('Are you sure? This will delete all categories within it.')) return
  try {
    await api.delete(`/segments/${item.documentId}`)
    await eventsStore.fetchEvent(props.event.documentId || '')
    showSnackbar('Segment deleted successfully', 'success')
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    console.error('Error deleting segment:', error)
    showSnackbar('Failed to delete segment', 'error')
  }
}

const showCategoryDialog = (item: CategoryData | null, segmentId: string) => {
  editedCategory.value = item
    ? {
        ...item,
        active_judges: (item.active_judges || []).map((j: any) => j.documentId),
      }
    : {
        name: '',
        weight: 0,
        active: true,
        locked: false,
        active_judges: [],
      }
  currentSegmentIdForCategory.value = segmentId
  categoryDialog.value = true
}

const saveCategory = async () => {
  if (!currentSegmentIdForCategory.value) return
  try {
    const payload = {
      data: {
        name: editedCategory.value.name,
        weight: editedCategory.value.weight,
        active: editedCategory.value.active,
        locked: editedCategory.value.locked,
        segment: currentSegmentIdForCategory.value,
        active_judges: editedCategory.value.active_judges,
      },
    }
    if (editedCategory.value.documentId) {
      await api.put(`/categories/${editedCategory.value.documentId}`, payload)
      showSnackbar('Category updated successfully', 'success')
    } else {
      await api.post('/categories', payload)
      showSnackbar('Category created successfully!', 'success')
    }
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    showSnackbar('Failed to save category', 'error')
    console.error('Error saving category:', error)
  } finally {
    categoryDialog.value = false
  }
}

const deleteCategory = async (item: CategoryData) => {
  if (!confirm('Are you sure?')) return
  try {
    await api.delete(`/categories/${item.documentId}`)
    await eventsStore.fetchEvent(props.event.documentId || '')
    showSnackbar('Category deleted successfully', 'success')
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    console.error('Error deleting category:', error)
    showSnackbar('Failed to delete category', 'error')
  }
}
</script>
