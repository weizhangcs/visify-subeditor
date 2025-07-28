<template>
  <div
    ref="grab"
    class="absolute left-0 right-0 top-0 h-[25%] w-full select-none border-t border-t-[#281753] bg-[#331473]/30"
    :class="grabbing ? 'cursor-grabbing' : 'cursor-grab'"
    @mousedown="onMouseDown"
  />
</template>

<script setup>
import clamp from 'lodash/clamp';

const taskStore = useTaskStore();
const grab = ref(null);
const grabbing = ref(false);
const playing = ref(false);
const startX = ref(0);
const startTime = ref(0);

const { width } = useElementBounding(grab);

function onMouseDown(event) {
  if (event.button !== 0) return;
  grabbing.value = true;
  startX.value = event.pageX;
  startTime.value = taskStore.currentTime;
  playing.value = taskStore.art.playing;
  taskStore.art.pause();
}

function onMouseMove(event) {
  if (!grabbing.value) return;
  const diffTime =
    ((event.pageX - startX.value) / width.value) *
    taskStore.wf.options.duration;
  const currentTime = clamp(startTime.value - diffTime, 0, taskStore.duration);
  taskStore.art.seek = currentTime;
  taskStore.wf.seek(currentTime);
}

function onMouseUp() {
  grabbing.value = false;
  startX.value = 0;
  startTime.value = 0;
  if (playing.value) {
    taskStore.art.play();
  }
  playing.value = false;
}

useEventListener(document, 'mouseup', onMouseUp);
useEventListener(document, 'mousemove', onMouseMove);

watchEffect(() => {
  if (grabbing.value) {
    document.body.classList.add('select-none');
  } else {
    document.body.classList.remove('select-none');
  }
});
</script>
