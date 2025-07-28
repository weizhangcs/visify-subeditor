<template>
  <div
    v-loading="createStore.camera.loading"
    class="px-4 py-4"
    :element-loading-text="$t(`create.analyzing`)"
    element-loading-background="rgba(0, 0, 0, 0.85)"
  >
    <video
      v-if="stream"
      ref="preview"
      autoPlay
      class="pointer-events-none aspect-video w-full bg-black"
    />
    <video
      v-else
      ref="result"
      loop
      autoPlay
      controls
      class="aspect-video w-full bg-black"
    />
  </div>
</template>

<script setup>
import fixWebmDuration from 'webm-duration-fix';

const createStore = useCreateStore();
const preview = ref();
const result = ref();
const stream = ref();

createStore.camera.recorder = useMediaRecorder({
  audio: true,
  video: true,
  async onStart(previewStream) {
    stream.value = previewStream;
    await sleep(100);
    if (preview.value) {
      preview.value.srcObject = previewStream;
    }
  },
  async onStop(_, blob) {
    createStore.camera.loading = true;
    stream.value = null;
    await sleep(100);
    const fixBlob = await fixWebmDuration(blob);
    const fixBlobUrl = URL.createObjectURL(fixBlob);
    createStore.camera.blob = fixBlob;
    if (result.value) {
      result.value.src = fixBlobUrl;
    }
    createStore.camera.loading = false;
  },
  onError(message) {
    if (message) {
      errorNotify(message);
    }
  },
});

onBeforeUnmount(() => {
  createStore.resetCamera();
});
</script>
