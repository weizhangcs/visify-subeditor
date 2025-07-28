<template>
  <div
    ref="itemRef"
    :data-index="index"
    class="pointer-events-auto absolute bottom-0 left-0 top-0 flex cursor-move select-none items-center justify-center overflow-hidden border border-white/20 text-[13px] text-white"
    :class="{
      'bg-[#502cab]/50': current && !message,
      'bg-white/20': !current && !message,
      'bg-red-700/50': message,
      'z-50 -mt-2 h-24': taskStore.currentItem === item,
    }"
    :style="{
      left: left + 'px',
      width: width + 'px',
    }"
    @click="onClick"
    @dblclick="onDoubleClick"
    @mousedown="onMouseDown($event)"
  >
    <div
      class="absolute bottom-0 left-0 top-0 z-10 w-2 cursor-col-resize select-none hover:bg-white/20"
      @mousedown.stop="onMouseDown($event, 'left')"
    />
    <div
      class="relative z-0 flex h-full w-full flex-col items-center justify-center whitespace-nowrap"
    >
      <div
        v-show="option.subtitleMode === 1 || option.subtitleMode === 2"
        class="text-[13px]"
      >
        {{ item.text }}
      </div>
      <div
        v-show="option.subtitleMode === 1 || option.subtitleMode === 3"
        class="text-[13px]"
      >
        {{ item.text2 }}
      </div>
    </div>
    <div
      class="absolute bottom-0 right-0 top-0 z-10 w-2 cursor-col-resize select-none hover:bg-white/20"
      @mousedown.stop="onMouseDown($event, 'right')"
    />
    <div class="absolute left-0.5 top-0.5 text-xs leading-none text-white/70">
      {{ index }}
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const itemRef = ref(null);
const isDroging = ref(false);
const lastType = ref('');
const lastX = ref(0);
const lastTime = ref(0);
const lastWidth = ref(0);
const lastDiffX = ref(0);
const appStore = useAppStore();
const taskStore = useTaskStore();
const option = computed(() => taskStore.task.option);
const config = useAppConfig();
const { MIN_SUB_TIME } = config.OPTION;

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
});

const left = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.wf.getLeftFromTime(props.item.startTime);
});

const width = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.wf.getWidthFromDuration(props.item.duration);
});

const index = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.task.subtitle.findIndex(
    (item) => item._id === props.item._id,
  );
});

const current = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.currentIndex === index.value;
});

const message = computed(() => {
  taskStore.beginTime;
  taskStore.currentTime;
  return isErrorSub(props.item);
});

async function onClick() {
  taskStore.currentItem = props.item;
  if (taskStore.duration >= props.item.startTime) {
    await taskStore.wf.smoothSeek(props.item.startTime, 0.1);
    taskStore.art.seek = props.item.startTime + 0.001;
  }
}

async function onMouseDown(event, type) {
  lastTime.value = Date.now();
  await sleep(200);
  if (lastTime.value === 0) return;

  isDroging.value = event.button === 0;
  lastType.value = type;
  lastX.value = event.pageX;
  lastWidth.value = parseFloat(itemRef.value.style.width);
}

function onMouseMove(event) {
  if (isDroging.value && itemRef.value) {
    lastDiffX.value = event.pageX - lastX.value;
    if (lastType.value === 'left') {
      itemRef.value.style.width = `${lastWidth.value - lastDiffX.value}px`;
      itemRef.value.style.transform = `translate(${lastDiffX.value}px)`;
    } else if (lastType.value === 'right') {
      itemRef.value.style.width = `${lastWidth.value + lastDiffX.value}px`;
    } else {
      itemRef.value.style.transform = `translate(${lastDiffX.value}px)`;
    }
  }
}

function magnetically(time, closeTime) {
  if (!closeTime) return time;
  if (time > closeTime - 0.1 && closeTime + 0.1 > time) {
    return closeTime;
  }
  return time;
}

async function onMouseUp() {
  lastTime.value = 0;
  if (isDroging.value) {
    isDroging.value = false;
    const timeDiff = taskStore.wf.getDurationFromWidth(lastDiffX.value);
    const previou = taskStore.task.subtitle[index.value - 1];
    const next = taskStore.task.subtitle[index.value + 1];

    const startTime = magnetically(
      props.item.startTime + timeDiff,
      previou && appStore.option.autoAlign ? previou.endTime : null,
    );

    const endTime = magnetically(
      props.item.endTime + timeDiff,
      next && appStore.option.autoAlign ? next.startTime : null,
    );

    if (
      (previou && endTime < previou.startTime) ||
      (next && startTime > next.endTime)
    ) {
      warningNotify(t('task.timeError'));
    } else {
      const subtitle = taskStore.task.subtitle[index.value];
      if (lastType.value === 'left') {
        if (startTime >= 0 && props.item.endTime - startTime >= MIN_SUB_TIME) {
          subtitle.start = d2t(startTime);
        } else {
          itemRef.value.style.width = `${lastWidth.value}px`;
          warningNotify(t('task.timeError'));
        }
      } else if (lastType.value === 'right') {
        if (endTime >= 0 && endTime - props.item.startTime >= MIN_SUB_TIME) {
          subtitle.end = d2t(endTime);
        } else {
          itemRef.value.style.width = `${lastWidth.value}px`;
          warningNotify(t('task.timeError'));
        }
      } else {
        if (
          startTime > 0 &&
          endTime > 0 &&
          endTime - startTime >= MIN_SUB_TIME
        ) {
          subtitle.start = d2t(startTime);
          subtitle.end = d2t(endTime);
        } else {
          itemRef.value.style.width = `${lastWidth.value}px`;
          warningNotify(t('task.timeError'));
        }
      }
    }

    itemRef.value.style.transform = `translate(0)`;
  }
}

async function onDoubleClick() {
  const subtitle = taskStore.task.subtitle[index.value];
  const previou = taskStore.task.subtitle[index.value - 1];
  const next = taskStore.task.subtitle[index.value + 1];
  if (previou && next) {
    const startTime = previou.endTime;
    const endTime = next.startTime;
    subtitle.start = d2t(startTime);
    subtitle.end = d2t(endTime);
    taskStore.art.seek = previou.endTime;
  }
}

useEventListener(document, 'mousemove', onMouseMove);
useEventListener(document, 'mouseup', onMouseUp);
</script>
