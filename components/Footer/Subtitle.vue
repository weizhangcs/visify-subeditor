<template>
  <div
    class="pointer-events-none absolute left-0 right-0 top-12 z-30 h-20 w-full transition duration-300"
    :class="taskStore.beginTime ? 'opacity-100' : 'opacity-0'"
  >
    <el-popover
      v-for="item in taskStore.currentSubtitles"
      :key="item._id"
      popper-style="padding:5px;min-width:0;width:auto;"
      trigger="contextmenu"
      :disabled="disabled"
      :hide-after="0"
    >
      <template #reference>
        <FooterItem :item="item" />
      </template>
      <template #default>
        <div class="flex flex-col gap-1 text-[13px]">
          <div
            class="flex cursor-pointer items-center gap-1 rounded py-1 pl-2 pr-3 hover:bg-white/5"
            @click="onRemoveClick(item)"
          >
            <div class="flex w-4 justify-center text-xs">
              <Icon name="fa-trash-can" />
            </div>
            {{ $t(`task.remove`) }}
          </div>
          <div
            class="flex cursor-pointer items-center gap-1 rounded py-1 pl-2 pr-3 hover:bg-white/5"
            @click="onMergeClick(item)"
          >
            <div class="flex w-4 justify-center text-xs">
              <Icon name="fa-merge" />
            </div>
            {{ $t(`task.merge`) }}
          </div>
          <div
            class="flex cursor-pointer items-center gap-1 rounded py-1 pl-2 pr-3 hover:bg-white/5"
            @click="onAddClick(item)"
          >
            <div class="flex w-4 justify-center text-xs">
              <Icon name="fa-plus" />
            </div>
            {{ $t(`task.insert`) }}
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
const { t } = useI18n();
const taskStore = useTaskStore();
const disabled = ref(false);

async function onRemoveClick(item) {
  const index = taskStore.task.subtitle.findIndex((i) => i._id === item._id);
  taskStore.task.subtitle.splice(index, 1);
  disabled.value = true;
  await sleep(1000);
  disabled.value = false;
}

async function onMergeClick(item) {
  const index = taskStore.task.subtitle.findIndex((i) => i._id === item._id);
  const current = taskStore.task.subtitle[index];
  const next = taskStore.task.subtitle[index + 1];
  if (next) {
    current.end = next.end;
    current.text += next.text;
    current.text2 += next.text2;
    taskStore.task.subtitle.splice(index + 1, 1);
  }
  disabled.value = true;
  await sleep(1000);
  disabled.value = false;
}

async function onAddClick(item) {
  const subtitle = new Sub({
    startTime: item.endTime,
    endTime: item.endTime + 1,
    text: t('task.tmp'),
  });
  const index = taskStore.task.subtitle.findIndex((i) => i._id === item._id);
  taskStore.task.subtitle.splice(index + 1, 0, subtitle);
  disabled.value = true;
  await sleep(1000);
  disabled.value = false;
}
</script>
