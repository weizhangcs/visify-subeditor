<template>
  <el-dialog
    v-model="appStore.popup.export"
    :destroy-on-close="true"
    :show-close="false"
    append-to-body
    :z-index="1000"
    width="36rem"
  >
    <template #header>
      <DialogsHeader @close="appStore.popup.export = false">
        <Icon name="fa-cloud-arrow-down" class="text-sm" />
        {{ $t('header.export') }}
      </DialogsHeader>
    </template>
    <div class="flex flex-col gap-4 py-4">
      <DialogsExportSubtitle />
      <DialogsExportAudio />
      <DialogsExportVideo />
    </div>
    <template #footer>
      <DialogsFooter>
        <div class="flex items-center gap-1 text-sm text-white/50">
          <span>{{ $t('export.videoSize') }}:</span>
          <span class="text-[#FFC107]">{{ getSize(videoSize) }}</span>
        </div>
        <div class="flex items-center gap-1">
          <el-button :dark="true" size="large" @click="onDownloadSource">
            <Icon name="fa-cloud-arrow-down" class="mr-2 text-sm" />
            <span>{{ $t(`export.source`) }}</span>
          </el-button>
          <el-button
            color="#3662e3"
            :dark="true"
            size="large"
            @click="onExport"
          >
            <Icon name="fa-gear-code" class="mr-2 text-sm" />
            <span>{{ $t(`export.start`) }}</span>
          </el-button>
        </div>
      </DialogsFooter>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElLoading } from 'element-plus';

const { t } = useI18n();
const appStore = useAppStore();
const taskStore = useTaskStore();
const { burnVideo } = useBurnVideo();
const videoSize = computed(() => taskStore.task.offline.videoFile?.size || 0);

async function onExport() {
  const loading = ElLoading.service({
    lock: true,
    customClass: '!z-[9999]',
    text: t('export.exporting'),
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    const file = await burnVideo(taskStore.task);
    taskStore.result = file;
    const url = URL.createObjectURL(file);
    download(url, file.name);
    loading.close();
  } catch (error) {
    loading.close();
    throw error;
  }
}

function onDownloadSource() {
  const name = taskStore.task.name || Date.now();
  const file = taskStore.task.offline.videoFile;
  const url = URL.createObjectURL(file);
  download(url, `${name}.mp4`);
}
</script>
