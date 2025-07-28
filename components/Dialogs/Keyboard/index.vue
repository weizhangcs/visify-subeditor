<template>
  <el-dialog
    v-model="appStore.popup.keyboard"
    :destroy-on-close="true"
    :show-close="false"
    width="32rem"
  >
    <template #header>
      <DialogsHeader @close="appStore.popup.keyboard = false">
        <Icon name="fa-keyboard" class="text-sm" />
        {{ $t('header.keyboard') }}
      </DialogsHeader>
    </template>
    <div class="flex flex-col gap-3 p-4">
      <el-table :data="data" border class="w-full">
        <el-table-column prop="name" :label="$t('hotkey.name')" />
        <el-table-column prop="key" :label="$t('hotkey.key')" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
const { t } = useI18n();
const appStore = useAppStore();
const { isMacOS } = useDevice();

const data = ref([
  {
    name: t('hotkey.play_pause'),
    key: 'Space',
  },
  {
    name: t('hotkey.undo'),
    key: isMacOS ? 'Cmd + Z' : 'Ctrl + Z',
  },
  {
    name: t('hotkey.redo'),
    key: isMacOS ? 'Cmd + Shift + Z' : 'Ctrl + Shift + Z',
  },
  {
    name: t('hotkey.save'),
    key: isMacOS ? 'Cmd + S' : 'Ctrl + S',
  },
  {
    name: t('hotkey.delete'),
    key: 'Delete / Backspace',
  },
  {
    name: t('hotkey.create'),
    key: 'M',
  },
  {
    name: t('hotkey.prev'),
    key: '↑',
  },
  {
    name: t('hotkey.next'),
    key: '↓',
  },
  {
    name: t('hotkey.offsetForward'),
    key: '←',
  },
  {
    name: t('hotkey.offsetBackward'),
    key: '→',
  },
]);
</script>
