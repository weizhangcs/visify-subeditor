<template>
  <NuxtLayout>
    <Head>
      <Title>{{ $t('title') }}</Title>
      <Meta name="description" :content="$t('description')" />
      <Meta name="keywords" :content="$t('keywords')" />
      <Meta property="og:title" :content="$t('title')" />
      <Meta property="og:description" :content="$t('description')" />
      <Meta property="og:image" :content="`${baseUrl}/logo.png`" />
      <Meta property="og:url" :content="baseUrl" />
      <Meta property="og:type" content="subtitle" />
      <Meta property="og:site_name" :content="$t('title')" />
      <Meta property="og:locale" content="en" />
      <Link rel="canonical" :href="baseUrl" />
    </Head>
    <div
      ref="logsRef"
      class="flex h-[100vh] flex-col gap-1 overflow-y-auto bg-[#0e0e0e] p-2 text-sm font-light"
      @mousemove="hover = true"
      @mouseleave="hover = false"
    >
      <div
        v-for="(item, index) in logs"
        :key="index"
        class="flex items-center gap-2"
        :style="{ color: item.color }"
      >
        <Icon v-if="item.icon" :name="item.icon" />
        {{ item.text }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import localForage from 'localforage';

const baseUrl = getBaseUrl();
const route = useRoute();
const ffmpeg = ref(null);
const logs = ref([]);
const logsRef = ref(null);
const hover = ref(false);
const task = ref(null);
const progress = ref(0);
const timer = ref(null);
const channel = ref(null);

const { id, retry } = route.query;
if (!id) navigateTo('/');

async function log(info) {
  if (logs.value.length > 100) logs.value.shift();
  if (info.type === 'repeat') {
    const lastLog = logs.value[logs.value.length - 1];
    if (lastLog?.type === 'repeat') {
      Object.assign(lastLog, info);
    } else {
      logs.value.push(info);
    }
  } else {
    logs.value.push(info);
  }
  await nextTick();
  if (hover.value) return;
  logsRef.value.scrollTop = logsRef.value.scrollHeight;
}

function postMessage(data) {
  if (!channel.value) return;
  channel.value.postMessage(data);
}

async function getFFmpegWasmUrl() {
  const ffmpegStorage = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'aimu.app',
    storeName: 'ffmpeg',
  });

  const ffmpegWasm = await ffmpegStorage.getItem('wasm');
  if (ffmpegWasm) {
    log({
      icon: 'fa-check',
      text: 'Loaded ffmpeg-core.wasm',
      color: '#00ff0b',
    });
    return URL.createObjectURL(ffmpegWasm);
  } else {
    const config = useAppConfig();
    const url = `${config.PATH.FFMPEG}/ffmpeg-core.wasm`;
    const blob = await downloadWithProgress({
      url,
      size: 32609891,
      type: 'application/wasm',
      onProgress: ({ progress }) => {
        log({
          type: 'repeat',
          icon: 'fa-loader animate-spin text-xs',
          text: `Loading ffmpeg-core.wasm ${Math.floor(progress * 100)}%`,
          color: '#ffc107',
        });
      },
    });
    log({
      type: 'repeat',
      icon: 'fa-check',
      text: `Loading ffmpeg-core.wasm 100%`,
      color: '#ffc107',
    });
    await ffmpegStorage.setItem('wasm', blob);
    log({
      icon: 'fa-check',
      text: 'Loaded ffmpeg-core.wasm',
      color: '#00ff0b',
    });
    return URL.createObjectURL(blob);
  }
}

function loadFFmpeg() {
  return new Promise((resolve) => {
    const baseUrl = '/static/ffmpeg';
    useScriptTag(`${baseUrl}/ffmpeg.js`, () => {
      useScriptTag(`${baseUrl}/ffmpeg-util.js`, async () => {
        const { FFmpeg } = window['FFmpegWASM'];
        const { toBlobURL } = window['FFmpegUtil'];

        log({
          text: 'Installing ffmpeg...',
          color: '#ffc107',
        });

        const ff = new FFmpeg();

        ff.on('log', ({ message }) => {
          const lastLog = logs.value[logs.value.length - 1];
          const same = lastLog.text.slice(0, 5) === message.trim().slice(0, 5);
          log({
            type: same ? 'repeat' : '',
            text: message.trim().slice(0, 100),
            color: '#fff',
          });
        });

        ff.on('progress', ({ progress: p, time }) => {
          const { name } = task.value;

          let title = '';

          if (p > 0) {
            progress.value = p;
            title = `${Math.floor(progress.value * 100)}%`;
          } else {
            if (time && task.value.duration) {
              const second = time / 1000000;
              progress.value = second / task.value.duration;
              title = `${Math.floor(progress.value * 100)}%`;
            }
          }

          if (title) {
            document.title = `${title} - ${name}`;
          }
        });

        const wasmURL = await getFFmpegWasmUrl();

        const coreURL = await toBlobURL(
          `${baseUrl}/ffmpeg-core.js`,
          'text/javascript',
        );

        const workerURL = await toBlobURL(
          `${baseUrl}/ffmpeg-core.worker.js`,
          'text/javascript',
        );

        await ff.load({
          coreURL: coreURL,
          wasmURL: wasmURL,
          workerURL: workerURL,
        });

        log({
          icon: 'fa-check',
          text: 'Install ffmpeg success',
          color: '#00ff0b',
        });

        ffmpeg.value = ff;
        resolve();
      });
    });
  });
}

function sendProgress() {
  postMessage({
    type: 'progress',
    data: progress.value,
  });
  timer.value = setTimeout(sendProgress, 1000);
}

async function checkResult(blob, message) {
  if (!blob || blob.size <= 1024) {
    log({
      text: message,
      color: '#ff0000',
    });
    log({
      text: 'The page will automatically close after 10 seconds',
      color: '#ff0000',
    });
    postMessage({
      type: 'error',
      message: message,
    });
    await sleep(10000);
    window.close();
  }
}

async function sendDone(blob, output) {
  log({
    icon: 'fa-check',
    text: 'Processing is complete',
    color: '#00ff0b',
  });

  const file = blobToFile(blob, output);

  postMessage({
    type: 'done',
    data: await createBase64FromFile(file),
  });

  window.close();
}

async function loadVideo() {
  const { fetchFile } = window['FFmpegUtil'];

  log({
    text: 'Loading video...',
    color: '#ffc107',
  });

  const videoFile = createFileFromBase64(task.value.video);
  ffmpeg.value.writeFile(videoFile.name, await fetchFile(videoFile));

  log({
    icon: 'fa-check',
    text: 'Load video success',
    color: '#00ff0b',
  });

  return videoFile;
}

async function loadSubtitle() {
  const { fetchFile } = window['FFmpegUtil'];

  log({
    text: 'Loading subtitle...',
    color: '#ffc107',
  });

  const subtitleFile = new File(
    [new Blob([task.value.ass])],
    `${Date.now()}.ass`,
  );
  ffmpeg.value.writeFile(subtitleFile.name, await fetchFile(subtitleFile));

  log({
    icon: 'fa-check',
    text: 'Load subtitle success',
    color: '#00ff0b',
  });

  return subtitleFile;
}

async function loadFonts() {
  const { fetchFile } = window['FFmpegUtil'];

  log({
    text: 'Loading fonts...',
    color: '#ffc107',
  });

  const { loadFonts } = useLoadFonts();
  const fonts = await loadFonts(task.value.fontnames);
  for (let index = 0; index < fonts.length; index++) {
    const { buffer, path } = fonts[index];
    const blob = new Blob([buffer]);
    const file = await fetchFile(blob);
    await ffmpeg.value.writeFile(`/tmp/${path}`, file);
  }

  log({
    icon: 'fa-check',
    text: 'Load fonts success',
    color: '#00ff0b',
  });

  return fonts;
}

async function burn() {
  await loadFonts();
  const videoFile = await loadVideo();
  const subtitleFile = await loadSubtitle();
  const output = `${Date.now()}.mp4`;
  const { burnPreset, burnSize } = task.value.option;
  const scale = `${burnSize ? `scale=-1:${burnSize},` : ''}`;

  try {
    await ffmpeg.value.exec(
      [
        '-i',
        videoFile.name,
        '-vf',
        `${scale}ass=${subtitleFile.name}:fontsdir=/tmp`,
        '-max_muxing_queue_size',
        '1024',
        '-c:a',
        'copy',
        '-preset',
        retry ? 'ultrafast' : burnPreset,
        output,
      ].filter(Boolean),
    );
    const res = await ffmpeg.value.readFile(output);
    if (res.buffer.byteLength <= 1024) {
      throw new Error('Video burn Error...');
    }
  } catch (error) {
    console.error(error);
    if (!retry) {
      window.location.href = `${window.location.href}&retry=1`;
      return;
    }
  }

  const res = await ffmpeg.value.readFile(output);
  const blob = new Blob([res.buffer], { type: 'video/mp4' });
  await checkResult(blob, 'Burn Video Error...');
  await sendDone(blob, output);
}

async function extract() {
  const videoFile = await loadVideo();
  const output = `${Date.now()}.mp3`;

  await ffmpeg.value.exec(
    [
      '-i',
      videoFile.name,
      '-vn',
      '-ar',
      '16000',
      '-ac',
      '1',
      '-c:a',
      'libmp3lame',
      '-q:a',
      '4',
      output,
    ].filter(Boolean),
  );

  const res = await ffmpeg.value.readFile(output);
  const blob = new Blob([res.buffer], { type: 'video/mp3' });
  await checkResult(blob, 'Extract Audio Error...');
  await sendDone(blob, output);
}

async function transcode() {
  const videoFile = await loadVideo();
  const output = `${Date.now()}.mp4`;

  try {
    await ffmpeg.value.exec(
      [
        '-i',
        videoFile.name,
        retry ? '-preset' : '',
        retry ? 'ultrafast' : '',
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        output,
      ].filter(Boolean),
    );
    const res = await ffmpeg.value.readFile(output);
    if (res.buffer.byteLength <= 1024) {
      throw new Error('Video Transcode Error...');
    }
  } catch (error) {
    console.error(error);
    if (!retry) {
      window.location.href = `${window.location.href}&retry=1`;
      return;
    }
  }

  const res = await ffmpeg.value.readFile(output);
  const blob = new Blob([res.buffer], { type: 'video/mp4' });
  await checkResult(blob, 'Video Transcode Error...');
  await sendDone(blob, output);
}

function prepareTask(data) {
  task.value = data;
  const { name } = task.value;
  document.title = `0% - 00:00:00 - ${name}`;
  log({
    icon: 'fa-check',
    text: 'Load task success',
    color: '#00ff0b',
  });
}

async function checkSupport() {
  channel.value = new BroadcastChannel(id);

  log({
    text: `Cross-Origin-Isolated: ${window.crossOriginIsolated}`,
    color: '#ffc107',
  });

  log({
    text: `Is-Secure-Context: ${window.isSecureContext}`,
    color: '#ffc107',
  });

  await sleep(500);
  await loadFFmpeg();
  await sleep(500);
}

async function init() {
  await checkSupport();

  channel.value.onmessage = (event) => {
    const { type, data } = event.data;
    switch (type) {
      case 'transcode': {
        prepareTask(data);
        transcode();
        break;
      }
      case 'extract': {
        prepareTask(data);
        extract();
        break;
      }
      case 'burn': {
        prepareTask(data);
        burn();
        break;
      }
      case 'stop': {
        window.close();
        break;
      }
      default:
        break;
    }
  };

  log({
    text: 'Loading task...',
    color: '#ffc107',
  });

  sendProgress();
  postMessage({ type: 'ready' });
}

function onUnload(event) {
  postMessage({ type: 'close' });
  event.preventDefault();
  event.returnValue = '';
}

onMounted(async () => {
  try {
    await init();
    window.addEventListener('unload', onUnload);
  } catch (error) {
    postMessage({
      type: 'error',
      message: error.message,
    });
    window.close();
  }
});
</script>
