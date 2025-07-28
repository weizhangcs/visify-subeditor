<template>
  <div class="flex flex-col gap-3">
    <DialogsCreateTitle
      icon="fa-subtitles"
      name="create.subtitle"
      tip="create.supportSubtitle"
    />
    <div class="px-4">
      <div
        class="flex justify-between rounded border border-white/20 bg-white/5 text-[13px]"
      >
        <div
          class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-l-sm py-2 transition duration-200"
          :class="
            subtitleType === 1
              ? 'bg-[#3662e3] font-semibold text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          "
          @click="onTypeClick(1)"
        >
          <Icon name="fa-robot" class="text-sm" />
          {{ $t(`type.subtitle.1`) }}
        </div>
        <div
          class="relative flex flex-1 cursor-pointer items-center justify-center gap-2 border-l border-r border-white/20 py-2 transition duration-200"
          :class="
            subtitleType === 2
              ? 'active bg-[#3662e3] font-semibold text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          "
          @click="onTypeClick(2)"
        >
          <Icon name="fa-cloud-arrow-up" class="text-sm" />
          {{ $t(`type.subtitle.2`) }}
          <div
            class="triangle absolute bottom-0 -mb-1.5 transition duration-200"
            :class="subtitleType === 2 ? 'opacity-100' : 'opacity-0'"
          />
        </div>
        <div
          class="roundedm-r-sm flex flex-1 cursor-pointer items-center justify-center gap-2 py-2 transition duration-200"
          :class="
            subtitleType === 3
              ? 'bg-[#3662e3] font-semibold text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          "
          @click="onTypeClick(3)"
        >
          <Icon name="fa-file" class="text-sm" />
          {{ $t(`type.subtitle.3`) }}
        </div>
      </div>
      <div
        v-if="subtitleType === 2"
        class="relative mt-4 flex h-11 cursor-pointer justify-center rounded border border-dashed border-white/20 bg-white/5 text-[13px] leading-[2.75rem] transition duration-300 hover:border-white/50 hover:bg-white/10"
        @click="open"
      >
        <div
          v-if="name"
          class="flex w-full truncate text-white/70 hover:text-white"
        >
          <div class="w-0 flex-1 truncate px-2">
            {{ $t(`create.file`) }} {{ name }}
          </div>
          <div
            class="w-[25%] truncate border-l border-dashed border-white/20 px-2"
          >
            {{ $t(`create.duration`) }} {{ duration }}
          </div>
          <div
            class="w-[20%] truncate border-l border-dashed border-white/20 px-2"
          >
            {{ $t(`create.size`) }} {{ getSize(size) }}
          </div>
          <div
            class="w-[20%] truncate border-l border-dashed border-white/20 px-2"
          >
            {{ $t(`create.length`) }} {{ length }}
          </div>
        </div>
        <div v-else class="text-white/70 hover:text-white">
          {{ $t(`create.selectSubtitle`) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const createStore = useCreateStore();

const { open, reset, onChange } = useFileDialog({
  multiple: false,
  extensions: ['srt', 'vtt', 'ass', 'json'],
});

const subtitleType = computed(() => createStore.task.option.subtitleType);
const name = computed(() => createStore.task.offline.subtitleFile?.name);
const size = computed(() => createStore.task.offline.subtitleFile?.size);
const length = computed(() => createStore.task.subtitle.length);
const duration = computed(() => {
  try {
    const last = createStore.task.subtitle.at(-1);
    return d2t(last?.endTime || 0, true);
  } catch {
    return '00:00:00';
  }
});

onChange(async (files) => {
  if (!files?.length) return;
  const file = files[0];

  if (file) {
    const state = checkSubFormat(file);
    if (state) {
      const subData = await file2sub(file);
      createStore.task.offline.subtitleFile = file;
      createStore.task.subtitle = subData;
    } else {
      errorNotify(t('create.formatErr'));
    }
  }
  reset();
});

function onTypeClick(type) {
  createStore.task.option.subtitleType = type;
}
</script>

<style lang="scss" scoped>
.active {
  &:after {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    bottom: -6px;
    left: calc(50% - 6px);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #3662e3;
  }
}
</style>
