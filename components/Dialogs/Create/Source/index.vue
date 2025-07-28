<template>
  <div class="flex flex-col gap-3">
    <DialogsCreateTitle
      icon="fa-video"
      name="create.video"
      tip="create.supportVideo"
    />
    <div class="h-24 px-4">
      <DialogsCreateSourceUploaded v-if="createStore.uploaded" />
      <DialogsCreateSourceTypes v-else />
    </div>
    <div
      v-if="createStore.task.option.videoType === 2 && !createStore.uploaded"
      class="px-4"
    >
      <el-alert
        :title="$t(`create.downloadTip`)"
        show-icon
        type="warning"
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup>
const createStore = useCreateStore();
</script>
