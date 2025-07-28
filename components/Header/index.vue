<template>
  <div
    class="relative flex h-12 items-center justify-between border-b border-[#1d1e23] px-4 text-[13px]"
  >
    <div class="flex items-center gap-4">
      <HeaderLogo />
      <div class="h-4 w-[1px] bg-white/20" />
      <div class="flex items-center gap-4">
        <HeaderExport />
      </div>
      <div class="h-4 w-[1px] bg-white/20" />
      <div class="flex items-center gap-4">
        <HeaderUndo />
        <HeaderRedo />
        <HeaderKeyboard />
      </div>
    </div>
    <div class="flex items-center justify-end gap-4">
      <div class="h-4 w-[1px] bg-white/20" />
      <HeaderI18n />
    </div>
  </div>
</template>
