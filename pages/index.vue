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
    <LazyDialogsCreate v-if="appStore.popup.create" />
    <LazyDialogsExport v-if="appStore.popup.export" />
    <LazyDialogsHelp v-if="appStore.popup.help" />
    <LazyDialogsKeyboard v-if="appStore.popup.keyboard" />
    <LazyDialogsFFmpeg v-if="appStore.ffmpeg.enable" />
  </div>
  <VitePwaManifest />
</template>

<script setup>
const appStore = useAppStore();
const taskStore = useTaskStore();
const { isMobile } = useDevice();
const { loadFonts } = useLoadFonts();
const splitX = computed(() => appStore.option.splitX);
const baseUrl = getBaseUrl();

if (isMobile) {
  navigateTo('/mobile');
}

useKeyboard();

onMounted(() => {
  loadFonts();
  taskStore.init();
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
