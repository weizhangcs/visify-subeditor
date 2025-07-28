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
        {{ $t(`mode.1`) }}
      </div>
      <div
        class="relative z-10 cursor-pointer px-2 py-1 hover:text-white"
        :class="option.subtitleMode === 2 ? 'text-white' : ''"
        @click="option.subtitleMode = 2"
      >
        {{ $t(`mode.2`) }}
      </div>
      <div
        class="relative z-10 cursor-pointer px-2 py-1 hover:text-white"
        :class="option.subtitleMode === 3 ? 'text-white' : ''"
        @click="option.subtitleMode = 3"
      >
        {{ $t(`mode.3`) }}
      </div>
      <div ref="tab" class="absolute left-0 h-full bg-red-900 transition-all" />
    </div>
    <el-tooltip
      popper-class="pointer-events-none"
      :disabled="!appStore.option.tooltip"
      :content="$t(`utils.swap`)"
      placement="bottom"
      effect="light"
    >
      <div
        class="flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-white/10 text-white/70 hover:text-white"
        @click="onSwapClick"
      >
        <Icon name="fa-right-left" class="text-xs" />
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
const tab = ref(null);
const modes = ref(null);
const appStore = useAppStore();
const taskStore = useTaskStore();
const option = computed(() => taskStore.task.option);

function onSwapClick() {
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    const text = item.text;
    item.text = item.text2;
    item.text2 = text;
  }
}

function update() {
  const mode = modes.value.children[option.value.subtitleMode - 1];
  tab.value.style.width = `${mode.offsetWidth}px`;
  tab.value.style.transform = `translateX(${mode.offsetLeft}px)`;
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
