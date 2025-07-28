<template>
  <DialogsCreateTitle icon="fa-subtitles" name="export.subtitle" />
  <div class="flex items-center px-5">
    <el-button plain :dark="true" @click="downloadSub('ass')">.ass</el-button>
    <el-button plain :dark="true" @click="downloadSub('srt')">.srt</el-button>
    <el-button plain :dark="true" @click="downloadSub('vtt')">.vtt</el-button>
    <el-button plain :dark="true" @click="downloadSub('txt')">.txt</el-button>
    <el-button plain :dark="true" @click="downloadSub('json')">.json</el-button>
  </div>
</template>

<script setup>
const taskStore = useTaskStore();

const downloadSub = (type) => {
  let text = '';
  const { subtitle } = taskStore.task;
  const { subtitleMode } = taskStore.task.option;
  const name = `${taskStore.task.name || Date.now()}.${type}`;
  switch (type) {
    case 'vtt':
      text = sub2vtt(subtitle, subtitleMode);
      break;
    case 'srt':
      text = sub2srt(subtitle, subtitleMode);
      break;
    case 'ass':
      text = sub2ass(taskStore.task);
      break;
    case 'txt':
      text = sub2txt(subtitle, subtitleMode);
      break;
    case 'json':
      text = JSON.stringify(subtitle);
      break;
    default:
      break;
  }
  const url = URL.createObjectURL(new Blob([text]));
  download(url, name);
};
</script>
