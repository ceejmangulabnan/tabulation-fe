<template>
  <div>
    <div class="d-flex justify-space-between align-center w-100 mb-4">
      <h2>Quick Actions</h2>
    </div>
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="4"
        class="d-flex"
      >
        <v-dialog max-width="500">
          <template #activator="{ props: activatorProps }">
            <v-card
              v-bind="activatorProps"
              elevation="0"
              class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
            >
              <v-card-item>
                <v-card-title class="d-flex flex-column ga-4">
                  <v-icon icon="mdi-plus"></v-icon>
                  <span class="text-wrap">Create new event</span>
                </v-card-title>
              </v-card-item>
              <v-spacer></v-spacer>
              <v-card-text class="text-lg">Create a new pagaent event</v-card-text>
            </v-card>
          </template>

          <template #default="{ isActive }">
            <AdminEventCreate @close-dialog="isActive.value = false" />
          </template>
        </v-dialog>
      </v-col>

      <v-col
        cols="12"
        sm="4"
        class="d-flex"
      >
        <v-card
          elevation="0"
          class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
          @click="router.push('/admin/users')"
        >
          <v-card-item>
            <v-card-title class="d-flex flex-column ga-4">
              <v-icon icon="mdi-account-group"></v-icon>
              <span class="text-wrap">Manage Users</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">View and manage judges and admins</v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="4"
        class="d-flex"
      >
        <v-card
          elevation="0"
          class="cursor-pointer custom-hover-card d-flex flex-column w-100 pa-3 ma-2 border-md border-dashed rounded-xl"
          @click="router.push('/admin/scores')"
        >
          <v-card-item>
            <v-card-title class="d-flex flex-column ga-4">
              <v-icon icon="mdi-poll"></v-icon>
              <span class="text-wrap">Manage Scores</span>
            </v-card-title>
          </v-card-item>
          <v-spacer></v-spacer>
          <v-card-text class="text-lg">View and manage event scores</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
</script>

<style scoped>
.custom-hover-card {
  transition: all 0.25s ease;
}

.custom-hover-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-3px);
}
</style>
