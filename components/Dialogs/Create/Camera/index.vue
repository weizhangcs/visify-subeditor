<template>
  <el-dialog
    v-model="createStore.camera.dialog"
    :destroy-on-close="true"
    :show-close="false"
    width="40rem"
  >
    <template #header>
      <DialogsHeader @close="createStore.camera.dialog = false">
        <Icon name="fa-video" class="text-sm" />
        {{ $t(`type.video.3`) }}
      </DialogsHeader>
    </template>
    <DialogsCreateCameraMain />
    <template #footer>
      <DialogsFooter>
        <div class="flex items-center gap-1">
          <el-button
            plain
            :dark="true"
            size="large"
            @click="createStore.camera.dialog = false"
          >
            <Icon name="fa-xmark" class="mr-2 text-xs" />
            {{ $t('create.cancel') }}
          </el-button>
        </div>
        <div class="flex items-center justify-end gap-4">
          <div class="text-sm text-white/50">
            {{ d2t(createStore.camera.duration, true) }}
          </div>
          <el-button
            v-if="
              createStore.camera.recorder.status === '' ||
              createStore.camera.recorder.status === 'idle' ||
              createStore.camera.recorder.status === 'acquiring_media'
            "
            :loading="
              createStore.camera.recorder.status === 'acquiring_media' ||
              createStore.camera.loading
            "
            color="#4ca154"
            :dark="true"
            size="large"
            @click="createStore.camera.recorder.startRecording"
          >
            <Icon name="fa-play" class="mr-2 text-base" />
            {{ $t('create.recordStart') }}
          </el-button>
          <el-button
            v-if="createStore.camera.recorder.status === 'recording'"
            :loading="createStore.camera.loading"
            color="#7b0000"
            :dark="true"
            size="large"
            @click="createStore.camera.recorder.stopRecording"
          >
            <Icon name="fa-stop" class="mr-2 text-base" />
            {{ $t('create.recordStop') }}
          </el-button>
          <el-button
            v-if="createStore.camera.recorder.status === 'stopped'"
            :loading="createStore.camera.loading"
            color="#3662e3"
            :dark="true"
            size="large"
            @click="createStore.onCameraConfirm"
          >
            <Icon name="fa-check" class="mr-2 text-base" />
            {{ $t('create.useVideo') }}
          </el-button>
        </div>
      </DialogsFooter>
    </template>
  </el-dialog>
</template>

<script setup>
const createStore = useCreateStore();
const timer = ref(null);

function startCountdown() {
  timer.value = setTimeout(() => {
    createStore.camera.duration += 1;
    startCountdown();
  }, 1000);
}

onBeforeUnmount(() => {
  createStore.camera.duration = 0;
  clearTimeout(timer.value);
});

watch(
  () => createStore.camera.recorder.status,
  (status) => {
    if (status === 'recording') {
      createStore.camera.duration = 0;
      clearTimeout(timer.value);
      startCountdown();
    }

    if (status === 'stopped') {
      clearTimeout(timer.value);
    }
  },
);
</script>
