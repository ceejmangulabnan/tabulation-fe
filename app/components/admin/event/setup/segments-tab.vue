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
                  color="primary"
                  icon="mdi-plus"
                  @click="showCategoryDialog(null, item.documentid)"
                />

                <v-btn
                  v-else
                  prepend-icon="mdi-plus"
                  color="primary"
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
              :subtitle="`Weight: ${segment.weight * 100}%, Order: ${segment.order}`"
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
                color="primary"
                icon="mdi-plus"
                @click="showCategoryDialog(null, segment.documentId)"
              />
            </v-card-title>
            <v-list lines="two">
              <v-list-item
                v-for="categoryItem in segment.categories"
                :key="categoryItem.id"
                :title="categoryItem.name"
                :subtitle="`Weight: ${categoryItem.weight * 100}%`"
              >
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
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              @click="segmentDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              type="submit"
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
            />
            <v-text-field
              v-model.number="editedCategory.weight"
              label="Weight (0.0 to 1.0)"
              type="number"
              step="0.01"
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
              type="submit"
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

// --- Scoring Segments State & Headers ---
const segmentHeaders = [
  { title: 'Name', key: 'name', sortable: true, class: 'font-weight-bold' },
  { title: 'Weight', value: 'weight', sortable: true, class: 'font-weight-bold' },
  { title: 'Order', value: 'order', sortable: true, class: 'font-weight-bold' },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
  { key: 'data-table-expand', title: '', class: 'font-weight-bold', sortable: false },
]
const categoryHeaders = [
  { title: 'Name', key: 'name', sortable: true, class: 'font-weight-bold' },
  { title: 'Weight', value: 'weight', sortable: true, class: 'font-weight-bold' },
  { title: 'Actions', key: 'actions', sortable: false, class: 'font-weight-bold' },
]
const segmentDialog = ref(false)
const editedSegment = ref<Partial<SegmentData>>({
  id: 0,
  name: '',
  weight: 0,
})
const categoryDialog = ref(false)
const editedCategory = ref<Partial<CategoryData>>({
  id: 0,
  name: '',
  weight: 0,
})
const currentSegmentIdForCategory = ref<string | null>(null)

// --- Segments & Categories Tab ---
const totalSegmentWeight = computed(() =>
  (props.event.segments || []).reduce((sum: number, s: SegmentData) => sum + s.weight * 100, 0)
)

const calculateTotalCategoryWeight = (segment: SegmentData) => {
  return (segment.categories || []).reduce((sum, c) => sum + c.weight * 100, 0)
}

// Segment Dialog
const showSegmentDialog = (item: SegmentData | null = null) => {
  editedSegment.value = item ? { ...item } : { name: '', weight: 0 }
  segmentDialog.value = true
}

const saveSegment = async () => {
  try {
    const payload = {
      data: {
        name: editedSegment.value.name,
        order: editedSegment.value.order,
        weight: editedSegment.value.weight,
        event: {
          documentId: props.event.documentId,
          connect: [props.event.documentId],
        },
      },
    }
    console.log('Save Segment Payload', payload)
    if (editedSegment.value.documentId) {
      await api.put(`/segments/${editedSegment.value.documentId}`, payload)
      snackbar.showSnackbar('Segment updated successfully', 'success')
    } else {
      await api.post('/segments/create', payload)
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
const showCategoryDialog = (item: CategoryData | null = null, segmentId: string) => {
  editedCategory.value = item ? { ...item } : { name: '', weight: 0 }
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
        segment: currentSegmentIdForCategory.value,
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
