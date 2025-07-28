<template>
  <div
    class="flex items-center justify-between border-l-2 border-[#2f75ff] bg-black/10 px-4 py-2 tracking-wider text-white/80"
  >
    <div class="flex items-center gap-2">
      <Icon :name="icon" class="text-base" />
      {{ $t(name) }}
    </div>
    <div v-if="tip" class="flex items-center gap-2 text-xs text-white/30">
      <Icon name="fa-circle-info" />
      {{ $t(tip) }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  tip: {
    type: String,
    default: '',
  },
});
</script>
