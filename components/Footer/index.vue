<template>
  <div ref="footer" class="relative flex flex-col">
    <FooterPrompt />
    <FooterProgress />
    <div class="relative h-0 flex-1">
      <client-only>
        <FooterWaveform />
        <FooterGrab />
        <FooterCreate />
        <FooterSubtitle v-if="taskStore.duration" />
      </client-only>
    </div>
    <FooterTip />
    <FooterMemory />
  </div>
</template>

<script setup>
import clamp from 'lodash/clamp';

const taskStore = useTaskStore();
const footer = ref(null);

onMounted(() => {
  useEventListener(window, 'wheel', (event) => {
    if (taskStore.art && footer.value.contains(event.target)) {
      const deltaY =
        (Math.sign(event.deltaY) * taskStore.wf.options.duration) / 50;
      const currentTime = clamp(
        taskStore.currentTime + deltaY,
        0,
        taskStore.duration,
      );
      taskStore.art.seek = currentTime;
      taskStore.wf.seek(currentTime);
    }
  });
});
</script>
