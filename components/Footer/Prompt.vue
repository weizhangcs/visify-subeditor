<template>
  <div
    class="pointer-events-none absolute -top-7 left-0 right-0 w-full select-none text-xs"
  >
    <div
      v-for="item in subtitles"
      :key="item._id"
      class="prompt absolute top-0 flex items-center justify-center whitespace-nowrap text-center"
      :style="{
        left: getLeft(item) + 'px',
        width: getWidth(item) + 'px',
      }"
    >
      <div class="flex h-5 items-center rounded bg-[#a10000] px-1 shadow-md">
        <Icon name="fa-bug" class="text-sm" />
        <div class="scale-95">{{ isErrorSub(item) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const taskStore = useTaskStore();

const subtitles = computed(() =>
  taskStore.currentSubtitles.filter((item) => isErrorSub(item)),
);

function getLeft(item) {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.wf.getLeftFromTime(item.startTime);
}

function getWidth(item) {
  taskStore.beginTime;
  taskStore.currentTime;
  return taskStore.wf.getWidthFromDuration(item.duration);
}
</script>

<style lang="scss" scoped>
.prompt {
  &:after {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    bottom: -6px;
    left: calc(50% - 5px);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #a10000;
  }
}
</style>
