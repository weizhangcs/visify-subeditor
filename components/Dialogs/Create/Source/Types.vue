<template>
  <div
    v-loading="loadingInfo"
    class="relative flex h-full justify-between overflow-hidden rounded border border-dashed border-white/20 bg-white/5 text-sm"
  >
    <div
      class="relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-l transition duration-300 hover:bg-white/10 hover:text-white"
      :class="
        createStore.task.option.videoType === 2
          ? 'border border-[#e6a23c] bg-[#282219] text-[#e6a23c]'
          : 'text-white/70'
      "
      @click="open"
    >
      <Icon name="fa-cloud-arrow-up" class="text-3xl" />
      <div class="text-[13px]">{{ $t(`type.video.1`) }}</div>
    </div>
    <div
      class="relative hidden flex-1 cursor-pointer flex-col items-center justify-center gap-1 border-l border-dashed border-white/20 text-white/70 transition duration-300 hover:bg-white/10 hover:text-white lg:flex"
      @click="createStore.online.dialog = true"
    >
      <Icon name="fa-circle-play" class="text-3xl" />
      <div class="text-[13px]">{{ $t(`type.video.2`) }}</div>
    </div>
    <div class="flex flex-1 flex-col border-l border-dashed border-white/20">
      <div
        class="flex flex-1 cursor-pointer items-center justify-center gap-2 border-b border-dashed border-white/20 text-white/70 transition duration-300 hover:bg-white/10 hover:text-white"
        @click="createStore.camera.dialog = true"
      >
        <Icon name="fa-video" class="text-lg" />
        <div class="text-[13px]">{{ $t(`type.video.3`) }}</div>
      </div>
      <div
        class="flex flex-1 cursor-pointer items-center justify-center gap-2 text-white/70 transition duration-300 hover:bg-white/10 hover:text-white"
        @click="createStore.screen.dialog = true"
      >
        <Icon name="fa-record-vinyl" class="text-lg" />
        <div class="text-[13px]">{{ $t(`type.video.4`) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElLoading } from 'element-plus';

const { t } = useI18n();
const createStore = useCreateStore();
const { open, reset, onChange } = useFileDialog({ multiple: false });
const { transcodeVideo } = useTranscodeVideo();

const loadingInfo = computed(() => {
  if (createStore.analyzing) {
    const progress = (createStore.analysisProgress * 100).toFixed(2);
    return {
      visible: createStore.analyzing,
      text: `${t(`create.analyzing`)} ${progress}%`,
    };
  } else {
    return false;
  }
});

onChange(async (files) => {
  if (!files?.length) return;
  const file = files[0];
  reset();

  const state = checkVideoFormat(file);

  if (!state) {
    return errorNotify(t('create.formatErr'));
  }

  try {
    await createStore.onFileChange(file);
  } catch (error) {
    console.error(error);
    const loading = ElLoading.service({
      lock: true,
      customClass: '!z-[9999]',
      text: t('create.videoTranscoding'),
      background: 'rgba(0, 0, 0, 0.7)',
    });
    try {
      const newFile = await transcodeVideo(file);
      loading.close();
      await createStore.onFileChange(newFile);
    } catch (error) {
      loading.close();
      throw error;
    }
  }
});
</script>
