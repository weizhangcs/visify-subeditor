<template>
  <HeaderMenu @click="onClick">
    <Icon name="fa-circle-question" class="text-xs" />
    {{ $t('header.help') }}
  </HeaderMenu>
</template>

<script setup>
const appStore = useAppStore();

function onClick() {
  appStore.popup.help = true;
}
</script>
