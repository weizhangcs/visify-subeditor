<template>
  <HeaderKey :content="$t('header.keyboard')" @click="onClick">
    <Icon name="fa-keyboard" class="text-xs" />
  </HeaderKey>
</template>

<script setup>
const appStore = useAppStore();

function onClick() {
  appStore.popup.keyboard = true;
}
</script>
