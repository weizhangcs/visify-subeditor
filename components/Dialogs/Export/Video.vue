<template>
  <DialogsCreateTitle icon="fa-video" name="export.video" />
  <div class="flex items-center gap-6 px-5">
    <ToolSize size="default" />
    <ToolPreset size="default" />
  </div>
  <div v-if="taskStore.result">
    <DialogsCreateTitle
      icon="fa-floppy-disk"
      name="export.lastExport"
      class="mb-4"
    />
    <div class="px-4">
      <div
        class="flex cursor-pointer items-center gap-2 rounded border border-dashed border-[#67c23a] bg-[#1e2519] px-2 py-1.5 text-[#67c23a] hover:bg-[#2b3523]"
        @click="onDownloadResult"
      >
        <Icon name="fa-cloud-arrow-down" class="text-sm" />
        <div>
          [{{ getSize(taskStore.result.size) }}] -
          {{ taskStore.result.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const taskStore = useTaskStore();

function onDownloadResult() {
  const name = taskStore.task.name || Date.now();
  const url = URL.createObjectURL(taskStore.result);
  download(url, `${name}.mp4`);
}
</script>
