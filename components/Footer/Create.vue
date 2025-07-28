<template>
  <div
    class="absolute left-0 right-0 top-12 z-20 h-20 w-full"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
  >
    <div
      v-if="drogStartTime && drogEndTime && drogEndTime > drogStartTime"
      class="pointer-events-none absolute bottom-0 left-0 h-full select-none border border-white/20 bg-[#64d98a]/50"
      :style="{ left: left + 'px', width: width + 'px' }"
    />
  </div>
</template>

<script setup>
const { t } = useI18n();
const isMark = ref(false);
const isDroging = ref(false);
const drogStartTime = ref(0);
const drogEndTime = ref(0);
const taskStore = useTaskStore();
const config = useAppConfig();
const { MIN_SUB_TIME } = config.OPTION;

const left = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.wf.getLeftFromTime(drogStartTime.value);
});

const width = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.wf.getWidthFromDuration(
    drogEndTime.value - drogStartTime.value,
  );
});

function onMouseDown(event) {
  isDroging.value = event.button === 0;
  drogStartTime.value = taskStore.wf.getCurrentTimeFromEvent(event);
}

function onMouseMove(event) {
  if (isDroging.value) {
    drogEndTime.value = taskStore.wf.getCurrentTimeFromEvent(event);
  }
}

function onMouseUp() {
  if (
    isDroging.value &&
    drogStartTime.value > 0 &&
    drogEndTime.value > 0 &&
    drogEndTime.value - drogStartTime.value >= MIN_SUB_TIME
  ) {
    const index = findIndex(drogStartTime.value);
    const subtitle = new Sub({
      startTime: drogStartTime.value,
      endTime: drogEndTime.value,
      text: t('task.tmp'),
    });
    taskStore.task.subtitle.splice(index, 0, subtitle);
  }
  isDroging.value = false;
  drogStartTime.value = 0;
  drogEndTime.value = 0;
}

function onKeyDown(event) {
  const code = getKeyCode(event);
  if (code === 'KeyM') {
    if (drogStartTime.value) {
      if (
        isMark.value &&
        drogStartTime.value > 0 &&
        drogEndTime.value > 0 &&
        drogEndTime.value - drogStartTime.value >= MIN_SUB_TIME
      ) {
        const index = findIndex(drogStartTime.value);
        const subtitle = new Sub({
          startTime: drogStartTime.value,
          endTime: drogEndTime.value,
          text: t('task.tmp'),
        });
        taskStore.task.subtitle.splice(index, 0, subtitle);
        drogStartTime.value = 0;
        drogEndTime.value = 0;
        isMark.value = false;
      }
    } else {
      isMark.value = true;
      drogStartTime.value = taskStore.currentTime;
    }
  }
}

watchEffect(() => {
  if (isMark.value) {
    drogEndTime.value = taskStore.currentTime;
  }
});

useEventListener(document, 'mouseup', onMouseUp);
useEventListener(document, 'keydown', onKeyDown);
</script>
