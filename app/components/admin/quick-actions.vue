<template>
  <div>
    <div class="flex items-center justify-between w-full mb-4">
      <h2>Quick Actions</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UModal>
        <UCard
          class="cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-lg border border-dashed rounded-xl"
        >
          <div class="flex flex-col gap-4">
            <UIcon name="i-lucide-plus" class="size-6" />
            <span class="text-wrap">Create new event</span>
          </div>
          <p class="text-lg mt-4">Create a new pageant event</p>
        </UCard>

        <template #content>
          <AdminEventCreate />
        </template>
      </UModal>

      <UCard
        class="cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-lg border border-dashed rounded-xl"
        @click="router.push('/admin/users')"
      >
        <div class="flex flex-col gap-4">
          <UIcon name="i-lucide-users" class="size-6" />
          <span class="text-wrap">Manage Users</span>
        </div>
        <p class="text-lg mt-4">View and manage judges and admins</p>
      </UCard>

      <UCard
        class="cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-lg border border-dashed rounded-xl"
        @click="router.push('/admin/scores')"
      >
        <div class="flex flex-col gap-4">
          <UIcon name="i-lucide-bar-chart-3" class="size-6" />
          <span class="text-wrap">Manage Scores</span>
        </div>
        <p class="text-lg mt-4">View and manage event scores</p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>
