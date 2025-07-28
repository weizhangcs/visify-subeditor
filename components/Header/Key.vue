<template>
  <el-tooltip
    :disabled="disabled || !content || !appStore.option.tooltip"
    :content="content"
    effect="light"
    :offset="12"
  >
    <div
      class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded bg-[#15161a] transition duration-300"
      :class="
        disabled
          ? 'text-white/30'
          : 'text-white/80 hover:bg-[#4b2ea5] hover:text-white'
      "
      @click="$emit('click')"
    >
      <slot />
    </div>
  </el-tooltip>
</template>

<script setup>
const appStore = useAppStore();

defineProps({
  content: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
  },
});

defineEmits(['click']);
</script>
