<template>
  <v-app
    id="inspire"
    :theme="theme.current"
  >
    <v-app-bar :class="theme.current === 'light' ? 'glassmorphism-light' : 'glassmorphism-dark'">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title class="font-weight-bold">
        <NuxtLink
          to="/"
          class=""
        >
          <div class="d-flex align-center ga-2">
            <v-img
              src="/logo.png"
              max-width="80px"
            ></v-img>

            <p class="font-weight-bold text-2xl">SNC Tabulation</p>
          </div>
        </NuxtLink>
      </v-app-bar-title>

      <template #append>
        <div class="px-4">
          <v-icon
            :icon="theme.current == 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
            @click="theme.toggle()"
          />
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :temporary="!display.mdAndUp.value"
    >
      <v-list>
        <v-list-item class="d-inline-flex">
          Welcome,
          <span class="text-body-1 font-weight-bold text-green">
            {{ authStore.user?.username }}
          </span>
          <span>!</span>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-list-item
          to="/"
          active-class="selected-tab"
        >
          <v-list-item-title>
            <v-icon
              icon="mdi-home"
              class="mr-2"
            ></v-icon>
            Home
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          to="/admin/dashboard"
          active-class="selected-tab"
        >
          <v-list-item-title>
            <v-icon
              icon="mdi-view-dashboard"
              class="mr-2"
            ></v-icon>
            Dashboard
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          to="/admin/events"
          active-class="selected-tab"
        >
          <v-list-item-title>
            <v-icon
              icon="mdi-calendar"
              class="mr-2"
            ></v-icon>
            Events
          </v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list>
          <v-list-subheader class="text-body-1 font-weight-bold">Event Segments</v-list-subheader>
          <template v-for="segment in segmentedCategories">
            <v-list-subheader>{{ segment.name }}</v-list-subheader>
            <v-list-item
              v-for="cat in segment.categories"
              :key="cat.id"
              :to="`/admin/events/${eventId}/category/${cat.id}`"
              active-class="selected-tab"
              :class="{ 'text-blue': !cat.active }"
            >
              <v-list-item-title>
                {{ cat.name }}
              </v-list-item-title>
            </v-list-item>
          </template>
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
const display = useDisplay()
const drawer = ref(display.mdAndUp.value)
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
  },
  { immediate: true }
)

const segmentedCategories = computed(() => {
  if (!event.value?.segments) return []

  return event.value.segments
    .sort((a, b) => a.order - b.order)
    .map((segment) => ({
      name: segment.name,
      categories: segment.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
        active: cat.active,
      })),
    }))
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

<style scoped>
.glassmorphism-light {
  background: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.glassmorphism-dark {
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

a:link,
a:visited,
a:hover,
a:active {
  text-decoration: none;
  color: inherit;
}

.selected-tab .v-list-item-title,
.selected-tab .v-icon {
  color: #4caf50 !important; /* Green color */
}
</style>
