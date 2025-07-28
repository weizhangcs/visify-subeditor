<template>
  <el-dialog
    v-model="appStore.popup.help"
    :destroy-on-close="true"
    :show-close="false"
    width="50rem"
  >
    <template #header>
      <DialogsHeader @close="appStore.popup.help = false">
        <Icon name="fa-circle-question" class="text-sm" />
        {{ $t('header.help') }}
      </DialogsHeader>
    </template>
    <div class="flex flex-col gap-4 p-4 text-sm leading-6">
      <div class="text-white">
        {{ $t('guide.describe') }}
      </div>
      <div class="flex items-center gap-2">
        {{ $t('guide.license') }}
        <a href="/LICENSE-PERSONAL.txt" target="_blank">
          <HeaderMenu>
            <Icon name="fa-file-certificate" class="text-xs" />
            {{ $t('guide.personal') }}.txt
          </HeaderMenu>
        </a>
        <a href="/LICENSE-COMMERCIAL.txt" target="_blank">
          <HeaderMenu>
            <Icon name="fa-file-certificate" class="text-xs" />
            {{ $t('guide.commercial') }}.txt
          </HeaderMenu>
        </a>
      </div>
      <div
        class="flex items-center gap-2 rounded bg-[#282219] py-1.5 pl-4 pr-2 text-[#e6a23c]"
      >
        <Icon name="fa-badge-check" />
        {{ $t('guide.contact') }} admin@aimu.app
      </div>
      <div
        v-for="n in 7"
        :key="n"
        class="flex items-center gap-2 rounded bg-[#1e2519] py-1.5 pl-4 pr-2 text-[#67c23a]"
      >
        <Icon name="fa-badge-check" />
        {{ $t(`guide.feature${n}`) }}
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
const appStore = useAppStore();
</script>
