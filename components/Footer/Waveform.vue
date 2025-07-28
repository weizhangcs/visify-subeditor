<template>
  <div
    v-loading="loading"
    class="h-full w-full"
    element-loading-background="rgba(0, 0, 0, 0.2)"
  >
    <div
      ref="waveform"
      class="h-full w-full transition duration-300"
      :class="loading ? 'opacity-0' : 'opacity-100'"
    />
  </div>
</template>

<script setup>
import WFPlayer from 'wfplayer';

const { t } = useI18n();
const config = useAppConfig();
const taskStore = useTaskStore();
const waveform = ref(null);
const loading = ref(false);

async function createWaveform() {
  taskStore.beginTime = 0;
  taskStore.wf?.destroy();

  const wf = new WFPlayer({
    container: waveform.value,
    mediaElement: taskStore.art.video,
    scrollable: true,
    useWorker: true,
    duration: 20,
    padding: 5,
    waveScale: 0.8,
    waveSize: 2,
    scrollbar: false,
    pixelRatio: 2,
    backgroundColor: '#0e0e0e',
    waveColor: 'rgba(255, 255, 255, 0.2)',
    progressColor: 'rgba(255, 255, 255, 0.6)',
    gridColor: 'rgba(255, 255, 255, 0.02)',
    rulerColor: 'rgba(255, 255, 255, 0.5)',
  });

  taskStore.wf = wf;

  wf.on('decode:success', () => {
    loading.value = false;
  });

  wf.on('decode:error', () => {
    loading.value = false;
    wf.reset();
    errorNotify(t('task.audioDecodeError'));
  });

  wf.on('update', (config) => {
    taskStore.beginTime = config.beginTime;
  });

  taskStore.art.on('restart', () => {
    wf.update();
  });
}

async function loadAudioUrl(url) {
  loading.value = true;
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  taskStore.wf.load(uint8);
}

async function decodeVideoFile(file) {
  if (typeof file === 'string') {
    return loadAudioUrl(file);
  }
  if (file.size <= config.OPTION.MAX_AUDIO_DECODE) {
    loading.value = true;
    const reader = new FileReader();
    reader.onload = async (event) => {
      taskStore.wf.reset();
      const arrayBuffer = event.target.result;
      taskStore.wf.load(new Uint8Array(arrayBuffer));
    };
    reader.readAsArrayBuffer(file);
  } else {
    taskStore.wf.reset();
    errorNotify(t('task.audioDecodeError'));
  }
}

async function checkAudio() {
  const { audioFile, audioBlobUrl, videoFile, videoBlobUrl } =
    taskStore.task.offline;
  await decodeVideoFile(audioFile || audioBlobUrl || videoFile || videoBlobUrl);
}

async function init() {
  createWaveform();
  checkAudio();
  await sleep(1000);
  taskStore.wf.update();
}

onMounted(() => init());
onBeforeUnmount(() => taskStore.wf.destroy());

watch(
  () => taskStore.task.offline.videoBlobUrl,
  () => checkAudio(),
);
</script>
