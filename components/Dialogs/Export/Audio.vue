<template>
  <DialogsCreateTitle icon="fa-volume" name="export.audio" />
  <div class="flex items-center px-5">
    <el-button plain :dark="true" @click="onDownloadSource">
      <Icon name="fa-cloud-arrow-down" class="mr-2 text-sm" />
      <span>{{ $t('export.sourceAudio') }}</span>
    </el-button>
  </div>
</template>

<script setup>
const { extractAudio } = useExtractAudio();
const taskStore = useTaskStore();

async function separateAudio() {
  const task = taskStore.task;
  const audio =
    task.offline.audioFile ||
    (await extractAudio(task.offline.videoFile, task.option.name));
  task.offline.audioFile = audio;
  task.offline.audioBlobUrl = URL.createObjectURL(audio);
  return audio;
}

async function onDownloadSource() {
  const name = taskStore.task.name || Date.now();
  const audio = await separateAudio();
  const url = URL.createObjectURL(audio);
  download(url, `${name}.mp3`);
}
</script>
