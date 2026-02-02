<template>
  <v-app
    id="inspire"
    :theme="theme.current"
  >
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title class="font-weight-bold">SNC Tabulation</v-app-bar-title>

      <template #append>
        <div class="px-4">
          <v-icon
            :icon="theme.current == 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
            @click="theme.toggle()"
          />
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-item
          :subtitle="authStore.user?.email"
          :title="authStore.user?.username"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-list-item to="/">
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item to="/admin/dashboard">
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/admin/events">
          <v-list-item-title>Events</v-list-item-title>
        </v-list-item>
        <v-list
          v-if="categories.length"
          density="compact"
        >
          <v-list-subheader>Categories</v-list-subheader>

          <v-list-item
            v-for="cat in categories"
            :key="cat.id"
            :to="`/admin/events/${eventId}/category/${cat.id}`"
          >
            <v-list-item-title>
              {{ cat.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-list>
      <template #append>
        <v-btn
          block
          :rounded="false"
          class="bg-red"
          @click="authStore.logout()"
        >
          Logout
        </v-btn>
      </template>
    </v-navigation-drawer>

    <v-main :class="`${theme.current === 'light' ? 'bg-grey-lighten-4' : ''}`">
      <Snackbar />
      <v-container fluid>
        <div class="d-flex align-center mb-4">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="router.back()"
          ></v-btn>
          <v-breadcrumbs
            :items="breadcrumbs"
            class="pa-0 d-flex flex-wrap"
          ></v-breadcrumbs>
        </div>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(false)
const authStore = useAuthStore()
const theme = useThemeStore()
const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()

const eventId = computed(() => route.params.id as string)
const event = computed(() => eventsStore.event)

watch(
  eventId,
  async (id) => {
    if (!id) return
    await eventsStore.fetchEvent(id)
    console.log('Event:', event.value)
  },
  { immediate: true }
)

const categories = computed(() => {
  if (!event.value?.segments) return []

  return event.value.segments.flatMap((segment) =>
    segment.categories.map((cat) => ({
      id: cat.documentId,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
    }))
  )
})

const breadcrumbs = computed(() => {
  const crumbs = [{ title: 'Dashboard', to: '/admin/dashboard', disabled: false }]
  const pathArray = route.path.split('/').filter((i) => i)

  // Start from index 1 to skip '/admin'
  let path = '/admin'
  for (let i = 1; i < pathArray.length; i++) {
    const segment = pathArray[i]
    if (!segment) return
    path += `/${segment}`
    crumbs.push({
      title: segment?.charAt(0).toUpperCase() + segment?.slice(1),
      to: path,
      disabled: i === pathArray.length - 1,
    })
  }

  // Handle base path /admin/dashboard
  if (crumbs.length === 1 && route.path.includes('dashboard')) {
    if (crumbs[0]) crumbs[0].disabled = true
  }

  return crumbs
})
</script>
