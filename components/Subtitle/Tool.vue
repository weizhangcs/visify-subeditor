<template>
  <div
    ref="split"
    class="fixed z-20 flex h-7 rounded border border-white/20 bg-black/80 text-sm text-white/50 transition-all duration-200"
    :class="activeElement ? '' : 'pointer-events-none opacity-0'"
    :style="{ left: left + 'px', top: top + 'px' }"
  >
    <el-tooltip
      popper-class="pointer-events-none"
      :disabled="isScroll || !appStore.option.tooltip"
      :content="$t(`task.splitLeft`)"
      :show-after="200"
      placement="top"
      effect="light"
      :offset="6"
    >
      <div
        class="flex w-6 cursor-pointer items-center justify-center text-xs hover:text-white"
        @click="onSplitLeftClick"
      >
        <Icon name="fa-arrow-left-long-to-line" />
      </div>
    </el-tooltip>
    <el-tooltip
      popper-class="pointer-events-none"
      :disabled="isScroll || !appStore.option.tooltip"
      :content="$t(`task.splitCurrent`)"
      :show-after="200"
      placement="top"
      effect="light"
      :offset="6"
    >
      <div
        class="flex w-7 cursor-pointer items-center justify-center border-l border-r border-white/20 hover:text-white"
        @click="onSplitCurrentClick"
      >
        <Icon name="fa-arrows-left-right" />
      </div>
    </el-tooltip>
    <el-tooltip
      popper-class="pointer-events-none"
      :disabled="isScroll || !appStore.option.tooltip"
      :content="$t(`task.splitRight`)"
      :show-after="200"
      placement="top"
      effect="light"
      :offset="6"
    >
      <div
        class="flex w-6 cursor-pointer items-center justify-center text-xs hover:text-white"
        @click="onSplitRightClick"
      >
        <Icon name="fa-arrow-right-long-to-line" />
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
const { t } = useI18n();
const appStore = useAppStore();
const taskStore = useTaskStore();

const props = defineProps({
  isScroll: Boolean,
});

const activeElement = ref(null);
const split = ref(null);
const type = ref('');
const index = ref(0);
const left = ref(0);
const top = ref(0);
const selectionStart = ref(0);

const sub = computed(() => {
  return taskStore.task.subtitle[index.value];
});

watch(
  () => props.isScroll,
  () => {
    activeElement.value = null;
  },
);

const { pause } = useIntervalFn(() => {
  selectionStart.value = activeElement.value?.selectionStart;
}, 1000);

onBeforeUnmount(pause);

useEventListener(document, 'click', ({ target, clientX }) => {
  if (target.dataset.subtitle) {
    activeElement.value = target;
    type.value = target.dataset.subtitle;
    index.value = Number(target.dataset.index);
    left.value = clientX - split.value?.offsetWidth / 2;
    top.value = target.getBoundingClientRect().top - 30;
  } else {
    activeElement.value = null;
  }
});

function onSplitLeftClick() {
  const textLeft = sub.value[type.value].slice(0, selectionStart.value).trim();
  const textRight = sub.value[type.value].slice(selectionStart.value).trim();
  const prev = taskStore.task.subtitle[index.value - 1];
  if (prev) {
    prev[type.value] += textLeft;
    sub.value[type.value] = textRight;
    successNotify(t('task.splitSuccess'));
  }
}

function onSplitCurrentClick() {
  const textLeft = sub.value[type.value].slice(0, selectionStart.value).trim();
  const textRight = sub.value[type.value].slice(selectionStart.value).trim();
  const startTime = t2d(sub.value.start);
  const endTime = t2d(sub.value.end);
  const duration = endTime - startTime;
  const leftPercent = textLeft.length / sub.value[type.value].length;
  const leftDuration = leftPercent * duration;
  sub.value[type.value] = textLeft;
  sub.value.end = d2t(startTime + leftDuration);
  const subtitle = new Sub({
    startTime: startTime + leftDuration,
    endTime: endTime,
    [type.value]: textRight,
  });
  taskStore.task.subtitle.splice(index.value + 1, 0, subtitle);
  successNotify(t('task.splitSuccess'));
}

function onSplitRightClick() {
  const textLeft = sub.value[type.value].slice(0, selectionStart.value).trim();
  const textRight = sub.value[type.value].slice(selectionStart.value).trim();
  const next = taskStore.task.subtitle[index.value + 1];
  if (next) {
    next[type.value] = textRight + next[type.value];
    sub.value[type.value] = textLeft;
    successNotify(t('task.splitSuccess'));
  }
}
</script>
