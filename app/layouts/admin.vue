<template>
  <UDashboardGroup class="flex h-screen bg-default text-default">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed z-50 flex h-full w-64 flex-col border-r border-default bg-default transition-transform lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex items-center gap-3 border-b border-default px-5 py-4">
        <img
          src="/logo.png"
          alt="Logo"
          class="h-9 w-9 object-contain"
        />
        <span class="text-lg font-bold">SNC Tabulation</span>
      </div>

      <nav class="flex-1 space-y-1 p-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary"
          active-class="!bg-primary/15 !text-primary"
          @click="mobileOpen = false"
        >
          <UIcon
            :name="item.icon"
            class="h-5 w-5 shrink-0"
          />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="border-t border-default p-3">
        <div class="mb-2 px-3 text-sm">
          Welcome,
          <span class="font-semibold text-primary">{{ authStore.user?.username }}</span>
        </div>
        <UButton
          color="error"
          variant="ghost"
          block
          icon="i-lucide-log-out"
          label="Logout"
          @click="authStore.logout()"
        />
      </div>
    </aside>

    <!-- Main -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-14 shrink-0 items-center gap-3 border-b border-default bg-default px-4">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          @click="mobileOpen = !mobileOpen"
        />

        <div class="flex items-center gap-2 text-sm">
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="router.back()"
          />
          <template
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
          >
            <span
              v-if="i > 0"
              class="text-muted"
            >
              /
            </span>
            <NuxtLink
              v-if="!crumb.disabled"
              :to="crumb.to"
              class="text-muted transition-colors hover:text-default"
            >
              {{ crumb.title }}
            </NuxtLink>
            <span
              v-else
              class="font-medium text-default"
            >
              {{ crumb.title }}
            </span>
          </template>
        </div>

        <div class="ml-auto">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            @click="toggleTheme"
          />
        </div>
      </header>

      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

const mobileOpen = ref(false)

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const navItems = [
  { to: '/', label: 'Home', icon: 'i-lucide-home' },
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
  { to: '/admin/events', label: 'Events', icon: 'i-lucide-calendar' },
]

const breadcrumbs = computed(() => {
  const crumbs = [{ title: 'Dashboard', to: '/admin/dashboard', disabled: false }]
  const pathArray = route.path.split('/').filter((i) => i)

  let path = '/admin'
  for (let i = 1; i < pathArray.length; i++) {
    const segment = pathArray[i]
    if (!segment) return []
    path += `/${segment}`
    crumbs.push({
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      to: path,
      disabled: i === pathArray.length - 1,
    })
  }

  if (crumbs.length === 1 && route.path.includes('dashboard')) {
    if (crumbs[0]) crumbs[0].disabled = true
  }

  return crumbs
})
</script>
