<template>
  <el-dialog
    v-model="createStore.screen.dialog"
    :destroy-on-close="true"
    :show-close="false"
    width="40rem"
  >
    <template #header>
      <DialogsHeader @close="createStore.screen.dialog = false">
        <Icon name="fa-record-vinyl" class="text-sm" />
        {{ $t(`type.video.4`) }}
      </DialogsHeader>
    </template>
    <DialogsCreateScreenMain />
    <template #footer>
      <DialogsFooter>
        <div class="flex items-center gap-1">
          <el-button
            plain
            :dark="true"
            size="large"
            @click="createStore.screen.dialog = false"
          >
            <Icon name="fa-xmark" class="mr-2 text-xs" />
            {{ $t('create.cancel') }}
          </el-button>
        </div>
        <div class="flex items-center justify-end gap-4">
          <div class="text-sm text-white/50">
            {{ d2t(createStore.screen.duration, true) }}
          </div>
          <el-button
            v-if="
              createStore.screen.recorder.status === '' ||
              createStore.screen.recorder.status === 'idle' ||
              createStore.screen.recorder.status === 'acquiring_media'
            "
            :loading="
              createStore.screen.recorder.status === 'acquiring_media' ||
              createStore.screen.loading
            "
            color="#4ca154"
            :dark="true"
            size="large"
            @click="createStore.screen.recorder.startRecording"
          >
            <Icon name="fa-play" class="mr-2 text-base" />
            {{ $t('create.recordStart') }}
          </el-button>
          <el-button
            v-if="createStore.screen.recorder.status === 'recording'"
            :loading="createStore.screen.loading"
            color="#7b0000"
            :dark="true"
            size="large"
            @click="createStore.screen.recorder.stopRecording"
          >
            <Icon name="fa-stop" class="mr-2 text-base" />
            {{ $t('create.recordStop') }}
          </el-button>
          <el-button
            v-if="createStore.screen.recorder.status === 'stopped'"
            :loading="createStore.screen.loading"
            color="#3662e3"
            :dark="true"
            size="large"
            @click="createStore.onScreenConfirm"
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
    createStore.screen.duration += 1;
    startCountdown();
  }, 1000);
}

onBeforeUnmount(() => {
  createStore.screen.duration = 0;
  clearTimeout(timer.value);
});

watch(
  () => createStore.screen.recorder.status,
  (status) => {
    if (status === 'recording') {
      createStore.screen.duration = 0;
      clearTimeout(timer.value);
      startCountdown();
    }

    if (status === 'stopped') {
      clearTimeout(timer.value);
    }
  },
);
</script>
