<template>
  <HeaderMenu @click="onClick">
    <Icon name="fa-rocket-launch" class="text-xs" />
    {{ $t('header.create') }}
  </HeaderMenu>
</template>

<script setup>
const appStore = useAppStore();

function onClick() {
  appStore.popup.create = true;
}
</script>
