<template>
  <div
    v-if="isSupported && memory"
    class="pointer-events-none absolute bottom-0.5 right-[2.5%] flex origin-right scale-90 items-center gap-1 text-xs text-white/20"
  >
    <div>Used: {{ getSize(memory.usedJSHeapSize) }}</div>
    <div>Allocated: {{ getSize(memory.totalJSHeapSize) }}</div>
    <div>Limit: {{ getSize(memory.jsHeapSizeLimit) }}</div>
  </div>
</template>

<script setup>
const { isSupported, memory } = useMemory();
</script>
