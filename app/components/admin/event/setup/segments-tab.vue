<template>
  <div>
    <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
      <span class="font-weight-bold">Event Scoring Segments</span>
      <v-btn
        v-if="smAndDown"
        icon="mdi-plus"
        color="green"
        density="compact"
        @click="showSegmentDialog()"
      />

      <v-btn
        v-else
        prepend-icon="mdi-plus"
        color="green"
        @click="showSegmentDialog()"
      >
        Add segment
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table
        v-if="!smAndDown"
        :headers="segmentHeaders"
        :items="event.segments"
        show-expand
        :class="`${theme.current === 'light' ? 'bg-white' : 'bg-gray-darken-1'} mb-4`"
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
        <template #item="{ item, internalItem, isExpanded, toggleExpand }">
          <tr
            style="cursor: pointer"
            @click="toggleExpand(internalItem)"
          >
            <td>{{ item.name }}</td>
            <td>{{ item.weight }}</td>
            <td>{{ item.order }}</td>
            <td>{{ item.advancement_type }}</td>
            <td>{{ item.advancement_value }}</td>
            <td>
              <v-icon
                small
                class="mr-2"
                @click.stop="showSegmentDialog(item as SegmentData)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                color="error"
                @click.stop="deleteSegment(item as SegmentData)"
              >
                mdi-delete
              </v-icon>
            </td>
            <td class="text-end">
              <v-btn
                :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                :text="isExpanded(internalItem) ? 'Collapse' : 'Show Categories'"
                class="text-none"
                color="medium-emphasis"
                size="small"
                variant="text"
                border
                slim
              ></v-btn>
            </td>
          </tr>
        </template>

        <template #expanded-row="{ columns, item }">
          <td :colspan="columns.length">
            <v-card
              :class="`${theme.current === 'light' ? 'bg-grey-lighten-3' : 'bg-gray-darken-1'} mb-4 rounded-0 border-md border-dashed border-opacity mt-n1px`"
              elevation="0"
            >
              <v-card-title class="ma-2 d-flex flex-wrap align-center justify-space-between ga-2">
                <span>Categories for {{ item.name }}</span>
                <v-btn
                  v-if="smAndDown"
                  density="compact"
                  color="green"
                  icon="mdi-plus"
                  @click="showCategoryDialog(null, item.documentid)"
                />

                <v-btn
                  v-else
                  prepend-icon="mdi-plus"
                  color="green"
                  @click="showCategoryDialog(null, item.documentId)"
                >
                  Add category
                </v-btn>
              </v-card-title>
              <v-data-table
                :headers="categoryHeaders"
                :items="item.categories"
                density="compact"
                hide-default-footer
                :class="`${theme.current === 'light' ? 'bg-grey-lighten-3' : 'bg-gray-darken-1'} mb-4`"
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
                <template #item.active="{ item: categoryItem }">
                  <v-chip
                    :color="categoryItem.active ? 'green' : 'red'"
                    density="compact"
                    class="ml-2"
                    label
                  >
                    {{ categoryItem.active ? 'Active' : 'Inactive' }}
                  </v-chip>

                  <v-chip
                    v-if="categoryItem.locked"
                    color="red"
                    density="compact"
                    class="ml-2"
                    label
                  >
                    <v-icon
                      icon="mdi-lock"
                      class="mr-1"
                    />
                    {{ categoryItem.locked ? 'Locked' : 'Unlocked' }}
                  </v-chip>
                </template>
                <template #item.actions="{ item: categoryItem }">
                  <v-icon
                    small
                    class="mr-2"
                    @click="showCategoryDialog(categoryItem as CategoryData, item.documentId)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    color="error"
                    @click="deleteCategory(categoryItem as CategoryData)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
              <v-card-text class="text-right font-weight-bold">
                Total Category Weight:
                {{ calculateTotalCategoryWeight(item as SegmentData) }} / 100
              </v-card-text>
            </v-card>
          </td>
        </template>
      </v-data-table>

      <v-list
        v-else
        lines="one"
        class="mb-4"
      >
        <v-list-group
          v-for="segment in event.segments"
          :key="segment.id"
          :value="segment.name"
        >
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="segment.name"
              :subtitle="`Weight: ${segment.weight * 100}%, Order: ${segment.order}, Advancement: ${segment.advancement_type} ${segment.advancement_value !== null ? `(${segment.advancement_value})` : ''}`"
            >
              <template #append>
                <v-icon
                  class="mr-2"
                  @click.stop="showSegmentDialog(segment as SegmentData)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  color="error"
                  class="mr-2"
                  @click.stop="deleteSegment(segment as SegmentData)"
                >
                  mdi-delete
                </v-icon>
              </template>
            </v-list-item>
          </template>

          <v-card
            variant="tonal"
            class="mx-2 my-4"
          >
            <v-card-title class="d-flex flex-wrap align-center justify-space-between ga-2">
              <span>Categories for {{ segment.name }}</span>
              <v-btn
                density="compact"
                color="green"
                icon="mdi-plus"
                @click="showCategoryDialog(null, segment.documentId)"
              />
            </v-card-title>
            <v-list lines="two">
              <v-list-item
                v-for="categoryItem in segment.categories"
                :key="categoryItem.id"
                :title="categoryItem.name"
              >
                <template #subtitle>
                  <span>Weight: {{ categoryItem.weight * 100 }}%</span>
                  <v-chip
                    :color="categoryItem.active ? 'green' : 'red'"
                    density="compact"
                    class="ml-2"
                    label
                  >
                    {{ categoryItem.active ? 'Active' : 'Inactive' }}
                  </v-chip>
                  <v-chip
                    :color="categoryItem.locked ? 'green' : 'gray'"
                    density="compact"
                    class="ml-2"
                    label
                  >
                    {{ categoryItem.locked ? 'Locked' : 'Unlocked' }}
                  </v-chip>
                </template>
                <template #append>
                  <v-icon
                    class="mr-2"
                    @click="showCategoryDialog(categoryItem as CategoryData, segment.documentId)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    color="error"
                    @click="deleteCategory(categoryItem as CategoryData)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
              </v-list-item>
              <v-list-item v-if="segment.categories.length === 0">
                <v-list-item-title class="text-center text-grey-darken-2">
                  No Categories for this Segment
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-card-text class="text-right">
              Total Category Weight:
              {{ calculateTotalCategoryWeight(segment as SegmentData) }} / 100
            </v-card-text>
          </v-card>
        </v-list-group>
        <v-list-item v-if="event.segments?.length === 0">
          <v-list-item-title class="text-center text-grey-darken-2">No Segments</v-list-item-title>
        </v-list-item>
      </v-list>

      <p class="mt-4 text-right font-weight-bold">
        Total Segment Weight: {{ totalSegmentWeight }} / 100
      </p>
    </v-card-text>

    <v-dialog
      v-model="segmentDialog"
      max-width="500px"
    >
      <v-form
        @submit="saveSegment"
        @submit.prevent
      >
        <v-card>
          <v-card-title>
            <span class="headline">{{ editedSegment.id ? 'Edit' : 'Add' }} Segment</span>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedSegment.name"
              label="Name"
              :autofocus="true"
            />
            <v-text-field
              v-model.number="editedSegment.order"
              label="Order in Event"
              type="number"
              step="1"
            />
            <v-text-field
              v-model.number="editedSegment.weight"
              label="Weight (0.0 to 1.0)"
              type="number"
              step="0.01"
            />
            <v-select
              v-model="editedSegment.advancement_type"
              :items="['all', 'top_n', 'threshold', 'manual']"
              label="Advancement Type"
            />
            <v-text-field
              v-if="['top_n', 'threshold'].includes(editedSegment.advancement_type!)"
              v-model.number="editedSegment.advancement_value"
              label="Advancement Value"
              type="number"
            />

            <v-select
              v-model="editedSegment.scoring_mode"
              :items="['normalized', 'raw_category']"
              label="Scoring Mode"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="green darken-1"
              @click="segmentDialog = false"
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

    <v-dialog
      v-model="categoryDialog"
      max-width="500px"
    >
      <v-form
        @submit.prevent
        @submit="saveCategory"
      >
        <v-card>
          <v-card-title>
            <span class="headline">{{ editedCategory.id ? 'Edit' : 'Add' }} Category</span>
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedCategory.name"
              label="Name"
              :autofocus="true"
            />
            <v-text-field
              v-model="editedCategory.weight"
              label="Weight (0.0 to 1.0)"
              type="number"
              step="0.01"
            />
            <v-select
              v-model="selectedJudges"
              :items="judgeSelectionOptions"
              label="Active Judges"
              multiple
              chips
              closable-chips
              clearable
              variant="outlined"
            />
            <v-switch
              v-model="editedCategory.active"
              label="Active"
              color="green"
              hide-details
            />
            <v-switch
              v-model="editedCategory.locked"
              label="Locked"
              color="green"
              hide-details
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="green"
              @click="categoryDialog = false"
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
const props = defineProps({
  event: {
    type: Object as PropType<Partial<EventData>>,
    required: true,
  },
})

const theme = useThemeStore()
const api = useStrapiApi()
const eventsStore = useEventsStore()
const snackbar = useSnackbar()
const { smAndDown } = useDisplay()

const availableJudges = computed(() => {
  if (!props.event.judges) return []
  return props.event.judges.map((judge) => ({
    title: judge.name,
    value: judge.documentId,
  }))
})

const allJudgeIds = computed(() => {
  if (!props.event.judges) return []
  return props.event.judges.map((judge) => judge.documentId)
})

const selectedJudges = computed<string[]>({
  get() {
    return editedCategory.value.active_judges || []
  },
  set(val) {
    // user clicked Select All
    if (val.includes('__all__')) {
      editedCategory.value.active_judges = [...allJudgeIds.value]
      return
    }

    // normal selection
    editedCategory.value.active_judges = val
  },
})

const judgeSelectionOptions = computed(() => {
  if (!availableJudges.value.length) return []

  return [
    { title: 'Select All', value: '__all__' },
    ...availableJudges.value.sort((a, b) => a.title.localeCompare(b.title)),
  ]
})

// --- Scoring Segments State & Headers ---
const segmentHeaders = [
  { title: 'Name', key: 'name', sortable: true, class: 'font-weight-bold' },
  { title: 'Weight', value: 'weight', sortable: true, class: 'font-weight-bold' },
  { title: 'Order', value: 'order', sortable: true, class: 'font-weight-bold' },
  { title: 'Advancement Type', key: 'advancement_type', sortable: true, class: 'font-weight-bold' },
  {
    title: 'Advancement Value',
    key: 'advancement_value',
    sortable: true,
    class: 'font-weight-bold',
  },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
  { key: 'data-table-expand', title: '', class: 'font-weight-bold', sortable: false },
]
const categoryHeaders = [
  { title: 'Name', key: 'name', sortable: true, class: 'font-weight-bold' },
  { title: 'Weight', value: 'weight', sortable: true, class: 'font-weight-bold' },
  { title: 'Active', key: 'active', sortable: true, class: 'font-weight-bold' },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
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
  active: true, // Default to active for new categories
  locked: false, // Default false
  active_judges: [],
})
const currentSegmentIdForCategory = ref<string | null>(null)

// --- Segments & Categories Tab ---
const totalSegmentWeight = computed(() =>
  (props.event.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

const calculateTotalCategoryWeight = (segment: SegmentData) => {
  return (segment.categories || []).reduce((sum, c) => sum + c.weight * 100, 0)
}

const validateSegmentCategories = (segment: SegmentData): boolean => {
  if (!segment.categories || segment.categories.length === 0) {
    // If a segment has no categories, it cannot be valid for scoring purposes based on these rules.
    return false
  }

  const totalCategoryWeight = segment.categories.reduce((sum, c) => sum + (c.weight || 0) * 100, 0)

  if (segment.scoring_mode === 'normalized') {
    return totalCategoryWeight === 100
  } else if (segment.scoring_mode === 'raw_category') {
    // Assuming segment.weight is stored as 0.0-1.0 and categories are also 0.0-1.0
    return totalCategoryWeight === (segment.weight || 0) * 100
  }
  // If scoring_mode is neither normalized nor raw_category, it's considered valid for this specific validation.
  return true
}

// Segment Dialog
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
      snackbar.showSnackbar('Segment updated successfully', 'success')
    } else {
      await api.post('/segments/create', createPayload)
      snackbar.showSnackbar('Segment created successfully!', 'success')
    }
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    snackbar.showSnackbar('Failed to save segment', 'error')
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
    snackbar.showSnackbar('Segment deleted successfully', 'success')

    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    console.error('Error deleting segment:', error)
    snackbar.showSnackbar('Failed to delete segment', 'error')
  }
}

// Category Dialog
// const showCategoryDialog = (item: CategoryData | null = null, segmentId: string) => {
//   editedCategory.value = item
//     ? { ...item, active_judges: item.active_judges || [] }
//     : { name: '', weight: 0, active: true, locked: false, active_judges: [] }
//   currentSegmentIdForCategory.value = segmentId
//   categoryDialog.value = true
//   console.log('Edited Category Item on dialog open', editedCategory.value)
// }

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
      snackbar.showSnackbar('Category updated successfully', 'success')
    } else {
      await api.post('/categories', payload)
      snackbar.showSnackbar('Category created successfully!', 'success')
    }
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    snackbar.showSnackbar('Failed to save category', 'error')
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
    snackbar.showSnackbar('Category deleted successfully', 'success')
    await eventsStore.fetchEvent(props.event.id?.toString() || '')
  } catch (error) {
    console.error('Error deleting category:', error)
    snackbar.showSnackbar('Failed to delete category', 'error')
  }
}
</script>

<style lang="css" scoped>
.mt-n1px {
  margin-top: -1px;
}
</style>
