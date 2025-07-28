<template>
  <div class="flex h-full shrink-0 items-center gap-2 px-3 text-[13px]">
    <div class="flex items-center gap-1 text-white/60">
      {{ $t(`mode.name`) }}:
    </div>
    <div
      ref="modes"
      class="relative flex h-7 items-center overflow-hidden rounded bg-white/10 text-white/70"
    >
      <div
        class="relative z-10 cursor-pointer px-2 py-1 hover:text-white"
        :class="option.subtitleMode === 1 ? 'text-white' : ''"
        @click="option.subtitleMode = 1"
      >
        {{ $t(`mode.annotation`) }}
      </div>
      <div
        class="relative z-10 cursor-pointer px-2 py-1 hover:text-white"
        :class="option.subtitleMode === 2 ? 'text-white' : ''"
        @click="option.subtitleMode = 2"
      >
        {{ $t(`mode.bilingual`) }}
      </div>
      <div ref="tab" class="absolute left-0 h-full bg-red-900 transition-all" />
    </div>
  </div>
</template>

<script setup>
const tab = ref(null);
const modes = ref(null);
const appStore = useAppStore();
const taskStore = useTaskStore();
const option = computed(() => taskStore.task.option);

function update() {
  // 增加保护，防止索引越界
  const modeIndex = option.value.subtitleMode - 1;
  if (modes.value && modes.value.children[modeIndex]) {
    const mode = modes.value.children[modeIndex];
    tab.value.style.width = `${mode.offsetWidth}px`;
    tab.value.style.transform = `translateX(${mode.offsetLeft}px)`;
  }
}

watch(
  () => option.value.subtitleMode,
  async (value) => {
    await sleep(100);
    if (!tab.value || !modes.value || !value) return;
    update();
  },
  {
    immediate: true,
  },
);

watch(
  () => appStore.option.i18n,
  async () => {
    await sleep(100);
    update();
  },
);
</script>
