<template>
  <el-dialog
    v-model="appStore.popup.create"
    :destroy-on-close="true"
    :show-close="false"
    width="36rem"
  >
    <template #header>
      <DialogsHeader @close="appStore.popup.create = false">
        <Icon name="fa-rocket-launch" class="text-sm" />
        {{ $t('create.header') }}
      </DialogsHeader>
    </template>
    <div class="flex flex-col gap-4 py-4">
      <span class="!z-[9999] hidden" />
      <DialogsCreateName />
      <DialogsCreateSource />
      <DialogsCreateSubtitle />
      <LazyDialogsCreateCamera v-if="createStore.camera.dialog" />
      <LazyDialogsCreateScreen v-if="createStore.screen.dialog" />
      <LazyDialogsCreateOnline v-if="createStore.online.dialog" />
    </div>
    <template #footer>
      <DialogsFooter>
        <DialogsCreateBottom />
      </DialogsFooter>
    </template>
  </el-dialog>
</template>

<script setup>
const appStore = useAppStore();
const createStore = useCreateStore();
</script>
