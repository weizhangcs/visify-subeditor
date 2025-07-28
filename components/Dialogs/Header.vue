<template>
  <div
    class="relative flex items-center justify-center gap-2 rounded-t border-b border-black/50 bg-black/30 px-4 py-3 text-base"
  >
    <slot />
    <Icon
      v-if="showClose"
      name="fa-xmark"
      class="absolute right-4 cursor-pointer text-xl text-white/50 transition duration-200 hover:text-white"
      @click="$emit('close')"
    />
  </div>
</template>

<script setup>
defineProps({
  showClose: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['close']);
</script>
