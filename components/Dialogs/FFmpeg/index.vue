<template>
  <el-dialog
    v-model="appStore.ffmpeg.enable"
    :destroy-on-close="true"
    :show-close="false"
    width="50rem"
    :z-index="10000"
    :modal-class="appStore.ffmpeg.silence ? '!hidden' : ''"
  >
    <template #header>
      <DialogsHeader @close="appStore.ffmpeg.enable = false">
        <Icon name="fa-gear-code" class="text-sm" />
        FFmpeg
      </DialogsHeader>
    </template>
    <div class="flex h-[32rem] flex-col">
      <span class="!hidden" />
      <iframe :src="url" frameborder="0" class="h-0 w-full flex-1" />
      <div v-if="percentage > 0" class="p-2">
        <el-progress
          :percentage="percentage"
          :text-inside="true"
          :stroke-width="16"
          :color="colors"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
const { t } = useI18n();
const appStore = useAppStore();
const url = computed(() => `${getBaseUrl()}/ffmpeg?id=${appStore.ffmpeg.id}`);
const percentage = computed(() => Math.round(appStore.ffmpeg.progress * 100));

const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
];

onBeforeUnmount(() => {
  closeFFmpegPage();
  document.title = t('title');
});

watch(percentage, (value) => {
  if (value > 0 && value < 100) {
    document.title = `${value}% - ${t('title')}`;
  }
});
</script>
