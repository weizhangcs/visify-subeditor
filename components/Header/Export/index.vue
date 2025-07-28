<template>
  <HeaderMenu @click="onClick">
    <Icon name="fa-cloud-arrow-down" class="text-xs" />
    {{ $t('header.export') }}
  </HeaderMenu>
</template>

<script setup>
const { t } = useI18n();
const appStore = useAppStore();
const taskStore = useTaskStore();

function onClick() {
  if (taskStore.task.demo) {
    appStore.popup.create = true;
    warningNotify(t('create.pleaseCreateTask'));
  } else {
    appStore.popup.export = true;
  }
}
</script>
