<template>
  <nuxt-link
    to="/"
    class="flex shrink-0 cursor-pointer select-none items-center gap-2"
    @click="onClick"
  >
    <img src="/logo.png" alt="logo" class="h-5" />
    <div>{{ $t('name') }}</div>
    <div class="flex rounded-xl bg-white/5 px-1 py-0.5 text-xs text-[#d1b7fa]">
      v{{ config.VERSION }}
    </div>
  </nuxt-link>
</template>

<script setup>
const config = useAppConfig();

function onClick() {
  window.location.href = '/';
}
</script>
