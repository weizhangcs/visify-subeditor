<template>
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
  <div class="flex h-screen flex-col overflow-hidden bg-[#0e0e0e]">
    <Header />
    <div
      id="main"
      class="flex h-0 flex-1 justify-between border-b border-[#1d1e23]"
    >
      <div
        class="flex flex-col border-r border-[#1d1e23]"
        :style="{ width: `${splitX * 100}%` }"
      >
        <Player class="flex-1 border-b border-[#1d1e23] bg-[#1d1e23]" />
        <Tool />
      </div>
      <Subtitle class="flex-1" />
    </div>
    <Footer class="h-40" />
    <LazyDialogsExport v-if="appStore.popup.export" />
    <LazyDialogsKeyboard v-if="appStore.popup.keyboard" />
    <LazyDialogsFFmpeg v-if="appStore.ffmpeg.enable" />
  </div>
  <VitePwaManifest />
</template>

<script setup>
const appStore = useAppStore();
const taskStore = useTaskStore();
const createStore = useCreateStore();
const { isMobile } = useDevice();
const { loadFonts } = useLoadFonts();
const splitX = computed(() => appStore.option.splitX);
const baseUrl = getBaseUrl();

if (isMobile) {
  navigateTo('/mobile');
}

useKeyboard();

onMounted(async () => {
  await loadFonts();

  const params = new URLSearchParams(window.location.search);
  const videoUrl = params.get('videoUrl');
  const srtUrl = params.get('srtUrl');
  // const assetId = params.get('assetId'); // - 暂存 assetId，备用

  if (videoUrl) {
    // URL驱动模式
    taskStore.task.offline.thumbnail = null;
    taskStore.task.offline.videoBlobUrl = videoUrl;
    taskStore.task.option.name = videoUrl.split('/').pop();
    taskStore.task.demo = false; // - 修复导出BUG：将任务标记为非DEMO模式

    if (srtUrl) {
      try {
        const response = await fetch(srtUrl);
        if (!response.ok) throw new Error('Network response was not ok.');
        const srtText = await response.text();
        const srtFile = new File([srtText], 'subtitle.srt', { type: 'text/plain' });
        const subtitles = await file2sub(srtFile);
        taskStore.task.subtitle = subtitles;
      } catch (error) {
        console.error('Failed to load or parse SRT file:', error);
        errorNotify('Failed to load subtitle file.');
        taskStore.task.subtitle = [];
      }
    } else {
      taskStore.task.subtitle = [];
    }

    // 触发视频信息分析
    const videoFile = new File([], taskStore.task.option.name);
    await createStore.handleVideo(videoFile);

    await nextTick();
    if (taskStore.wf) {
      taskStore.wf.seek(0);
    }

  } else {
    // 降级为原始的 DEMO 模式
    taskStore.init();
  }
});

watch(
  () => appStore.option,
  () => {
    const optionCookie = useCookie('option');
    optionCookie.value = appStore.option;
  },
  { deep: true },
);
</script>