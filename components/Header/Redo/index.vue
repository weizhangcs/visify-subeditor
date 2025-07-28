<template>
  <HeaderKey
    :disabled="!taskStore.canRedo"
    :content="content"
    @click="taskStore.redo"
  >
    <Icon name="fa-reply" class="-scale-x-100 text-xs" />
  </HeaderKey>
</template>

<script setup>
const { t } = useI18n();
const taskStore = useTaskStore();
const { isMacOS } = useDevice();

const content = computed(() => {
  const name = t('header.redo');
  return name + (isMacOS ? '(⇧ + ⌘ + z)' : '(ctrl + shift + z)');
});
</script>
