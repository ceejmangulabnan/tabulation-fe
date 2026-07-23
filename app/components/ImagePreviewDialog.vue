<template>
  <UModal :open="modelValue" @update:open="$emit('update:modelValue', $event)">
    <template #default>
      <div class="p-1">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="Preview"
          class="w-full rounded-lg object-contain"
        >
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton
          color="neutral"
          label="Close"
          @click="$emit('update:modelValue', false)"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  imageUrl: string | undefined
}

defineProps<Props>()
defineEmits(['update:modelValue'])
</script>
