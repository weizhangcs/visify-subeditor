<template>
  <div
    ref="progress"
    class="relative h-3 cursor-col-resize bg-[#0e0e0e]"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mousedown="onMouseDown"
  >
    <div
      class="absolute bottom-0 left-0 top-0 z-0 inline-block overflow-hidden bg-[#730000]"
      :style="{
        width: `${(taskStore.currentTime / taskStore.duration) * 100}%`,
      }"
    >
      <div
        class="absolute bottom-0 right-0 top-0 bg-[#ca693a]"
        :style="{ width: `${height}px` }"
      />
    </div>
    <canvas
      ref="canvas"
      :width="width * 2"
      :height="height * 2"
      class="pointer-events-none absolute inset-0 z-10 h-full w-full"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    />
    <div
      v-show="showThumbnail && taskStore.duration"
      :style="thumbnailStyle"
      class="pointer-events-none absolute bottom-4 left-0 z-20 rounded-sm bg-black bg-no-repeat shadow-md"
    />
    <div
      v-show="showTime && taskStore.duration"
      class="time pointer-events-none absolute bottom-5 left-0 z-30 flex h-5 w-16 items-center justify-center rounded bg-[#502cab] text-center text-[13px] shadow-md"
      :style="{ left: `${timeLeft}px` }"
    >
      {{ d2t(hoverTime, true) }}
    </div>
  </div>
</template>

<script setup>
const progress = ref(null);
const canvas = ref(null);
const ctx = ref(null);
const timer = ref(null);
const visible = ref(true);
const grabbing = ref(false);
const taskStore = useTaskStore();
const showTime = ref(false);
const timeLeft = ref(0);
const hoverTime = ref(0);
const showThumbnail = ref(false);
const thumbnailStyle = ref({});
const { width, height, left } = useElementBounding(progress);

function subToProgress({ subtitle, duration, clientWidth }) {
  return new Promise((resolve) => {
    const result = [];
    for (let index = 0; index < subtitle.length; index++) {
      const item = subtitle[index];
      const left = (item.startTime / duration) * clientWidth * 2;
      const width = (item.duration / duration) * clientWidth * 2;
      const right = left + width;
      const last = result[result.length - 1];
      if (last) {
        const gap = 2;
        const lastRight = last.left + last.width;
        if (left > lastRight + gap) {
          result.push({ left, width });
        }
        if (left < lastRight + gap && left > last.left - gap) {
          last.width = Math.max(right, lastRight) - last.left;
        }
        if (left < last.left - gap) {
          last.left = left;
          last.width = Math.max(right, lastRight) - last.left;
        }
      } else {
        result.push({ left, width });
      }
    }
    resolve(result);
  });
}

async function update() {
  visible.value = true;
  ctx.value = ctx.value || canvas.value.getContext('2d');
  ctx.value.fillStyle = 'rgb(255 255 255 / 10%)';
  ctx.value.clearRect(0, 0, width.value * 2, height.value * 2);
  if (taskStore.duration) {
    const data = await subToProgress({
      subtitle: taskStore.task.subtitle,
      duration: taskStore.duration,
      clientWidth: width.value,
    });
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      ctx.value.fillRect(item.left, 0, item.width, height.value * 2);
    }
  }
}

function getTime(event) {
  return ((event.pageX - left.value) / width.value) * taskStore.duration;
}

function onMouseDown(event) {
  taskStore.art.seek = getTime(event);
  if (event.button !== 0) return;
  grabbing.value = true;
}

function onDocMouseMove(event) {
  if (!grabbing.value) return;
  taskStore.art.seek = getTime(event);
}

function onDocMouseUp() {
  grabbing.value = false;
}

function checkThumbnail(event) {
  let url = '';
  let thumbnail = null;

  if (taskStore.task.offline.thumbnail?.url) {
    thumbnail = taskStore.task.offline.thumbnail;
    url = thumbnail.url;
  }

  if (!thumbnail || !url) return;
  showThumbnail.value = true;
  const posWidth = event.pageX - left.value;
  const perWidth = width.value / thumbnail.number;
  const perIndex = Math.floor(posWidth / perWidth);
  const yIndex = Math.ceil(perIndex / thumbnail.column) - 1;
  const xIndex = perIndex % thumbnail.column || thumbnail.column - 1;
  thumbnailStyle.value.backgroundImage = `url(${url})`;
  thumbnailStyle.value.height = `${thumbnail.height}px`;
  thumbnailStyle.value.width = `${thumbnail.width}px`;
  const x = `-${xIndex * thumbnail.width}px`;
  const y = `-${yIndex * thumbnail.height}px`;
  thumbnailStyle.value.backgroundPosition = `${x} ${y}`;
  if (posWidth <= thumbnail.width / 2) {
    thumbnailStyle.value.left = 0;
  } else if (posWidth > width.value - thumbnail.width / 2) {
    thumbnailStyle.value.left = `${width.value - thumbnail.width}px`;
  } else {
    thumbnailStyle.value.left = `${posWidth - thumbnail.width / 2}px`;
  }
}

function checkTime(event) {
  showTime.value = true;
  const timeWidth = 64;
  const posWidth = event.pageX - left.value;
  if (posWidth <= timeWidth / 2) {
    timeLeft.value = 0;
  } else if (posWidth > width.value - timeWidth / 2) {
    timeLeft.value = width.value - timeWidth;
  } else {
    timeLeft.value = posWidth - timeWidth / 2;
  }
  hoverTime.value = (posWidth / width.value) * taskStore.duration;
}

function onMouseMove(event) {
  checkTime(event);
  checkThumbnail(event);
}

function onMouseLeave() {
  showTime.value = false;
  showThumbnail.value = false;
}

function loop() {
  update();
  timer.value = setTimeout(loop, 1000);
}

onMounted(() => loop());
onBeforeUnmount(() => clearTimeout(timer.value));
useEventListener(document, 'mouseup', onDocMouseUp);
useEventListener(document, 'mousemove', onDocMouseMove);

watchEffect(() => {
  if (typeof document === 'undefined') return;
  if (grabbing.value) {
    document.body.classList.add('select-none');
  } else {
    document.body.classList.remove('select-none');
  }
});
</script>

<style lang="scss" scoped>
.time {
  &:after {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    bottom: -6px;
    left: calc(50% - 5px);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #502cab;
  }
}
</style>
