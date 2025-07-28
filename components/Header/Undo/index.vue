<template>
  <HeaderKey
    :disabled="!taskStore.canUndo"
    :content="content"
    @click="taskStore.undo"
  >
    <Icon name="fa-reply" class="text-xs" />
  </HeaderKey>
</template>

<script setup>
const { t } = useI18n();
const taskStore = useTaskStore();
const { isMacOS } = useDevice();

const content = computed(() => {
  const name = t('header.undo');
  return name + (isMacOS ? '(⌘ + z)' : '(Ctrl + z)');
});
</script>
