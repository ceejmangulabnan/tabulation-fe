<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="closeDialog"
    max-width="500px"
  >
    <v-card>
      <v-img :src="imageUrl" />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  imageUrl: string | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const closeDialog = () => {
  emit('update:modelValue', false);
};
</script>