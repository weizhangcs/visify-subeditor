<template>
  <div
    class="relative transition"
    :style="{ height: `${height}px` }"
    :class="{
      '!bg-[#562ab2]': current && !message,
      'bg-white/5': !(index % 2) && !message,
      'bg-red-700/50': message,
    }"
  >
    <div class="flex h-full items-center" @click="onItemClick">
      <div
        class="flex h-full w-7 flex-col items-center justify-between border-r border-[#1d1e23] py-3 text-base text-white/40"
      >
        <el-tooltip
          popper-class="pointer-events-none"
          :disabled="isScroll || !appStore.option.tooltip"
          :content="$t(`task.remove`)"
          placement="left"
          effect="light"
          :offset="6"
        >
          <div
            class="flex w-full cursor-pointer justify-center transition hover:text-white active:scale-90"
            @click.stop="onRemoveClick"
          >
            <Icon name="fa-trash-can" class="text-xs" />
          </div>
        </el-tooltip>
        <el-tooltip
          popper-class="pointer-events-none"
          :disabled="isScroll || !appStore.option.tooltip"
          :content="$t(`task.merge`)"
          placement="left"
          effect="light"
          :offset="6"
        >
          <div
            class="flex w-full cursor-pointer justify-center transition hover:text-white active:scale-90"
            @click.stop="onMergeClick"
          >
            <Icon name="fa-merge" class="text-xs" />
          </div>
        </el-tooltip>
        <el-tooltip
          popper-class="pointer-events-none"
          :disabled="isScroll || !appStore.option.tooltip"
          :content="$t(`task.insert`)"
          placement="left"
          effect="light"
          :offset="6"
        >
          <div
            class="flex w-full cursor-pointer justify-center transition hover:text-white active:scale-90"
            @click.stop="onAddClick"
          >
            <Icon name="fa-plus" class="text-xs" />
          </div>
        </el-tooltip>
      </div>
      <div
        class="flex h-full w-[7.7rem] flex-col items-start justify-between border-r border-[#1d1e23] p-2 text-[13px] text-white/70"
      >
        <div class="flex w-full items-center gap-1">
          <div class="flex w-3 justify-center text-xs">
            <Icon name="fa-arrow-up-to-line" class="scale-90 text-xs" />
          </div>
          <div class="flex-1 truncate">
            {{ item.start }}
          </div>
        </div>
        <div class="flex w-full items-center gap-1">
          <div class="flex w-3 justify-center text-xs">
            <Icon name="fa-arrow-down-to-line" class="scale-90 text-xs" />
          </div>
          <div class="flex-1 truncate">
            {{ item.end }}
          </div>
        </div>
        <div class="flex w-full items-center gap-1">
          <div class="flex w-3 justify-center text-xs">
            <Icon name="fa-timer" class="scale-[0.8] text-xs" />
          </div>
          <div class="flex-1 truncate">
            {{ sub?.duration || 0 }}
          </div>
        </div>
        <div class="flex w-full items-center gap-1">
          <div class="flex w-3 justify-center text-xs">
            <Icon name="fa-hashtag" class="scale-90 text-xs" />
          </div>
          <div class="flex-1 truncate">
            {{ index }}
          </div>
        </div>
      </div>
      <div ref="text" class="relative flex h-full flex-1 flex-col">
        <el-input
          ref="text1"
          :model-value="firstInputText"
          :rows="2"
          type="textarea"
          class="text1 flex-1"
          resize="none"
          :maxlength="MAX_SUB_WORD"
          :placeholder="firstInputPlaceholder"
          :data-index="index"
          @focus="isText1Focus = true"
          @blur="isText1Focus = false"
          @update:model-value="onFirstInput"
        />
        <el-input
          ref="text2"
          :model-value="secondInputText"
          :rows="2"
          type="textarea"
          class="text2 flex-1"
          resize="none"
          :maxlength="MAX_SUB_WORD"
          :placeholder="secondInputPlaceholder"
          :data-index="index"
          @focus="isText2Focus = true"
          @blur="isText2Focus = false"
          @update:model-value="onSecondInput"
        />
        <div
          class="absolute top-1/2 z-10 h-[1px] w-full"
          :class="current ? 'bg-[#562ab2]' : 'bg-[#1d1e23]'"
        />
      </div>
    </div>
    <div
      v-if="index !== 0"
      class="absolute top-0 h-[1px] w-full bg-[#1d1e23]"
    />
  </div>
</template>

<script setup>
const { t } = useI18n();
const appStore = useAppStore();
const taskStore = useTaskStore();
const config = useAppConfig();
const { MAX_SUB_WORD } = config.OPTION;

const text1 = ref(null);
const text2 = ref(null);
const isText1Focus = ref(false);
const isText2Focus = ref(false);

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: Number,
    default: 0,
  },
  index: {
    type: Number,
    default: 0,
  },
  isScroll: {
    type: Boolean,
    default: false,
  },
});

const option = computed(() => taskStore.task.option);
const current = computed(() => taskStore.currentIndex === props.index);
const sub = computed(() => taskStore.task.subtitle[props.index]);
const message = computed(() => isErrorSub(sub.value));

// 新增: 动态计算属性，用于决定v-model绑定和placeholder内容
const isAnnotationMode = computed(() => option.value.subtitleMode === 1);

const firstInputText = computed(() => {
  return isAnnotationMode.value ? props.item.speaker : props.item.text;
});

const secondInputText = computed(() => {
  return isAnnotationMode.value ? props.item.text : props.item.translation;
});

const firstInputPlaceholder = computed(() => {
  return isAnnotationMode.value
    ? t('task.speakerPlaceholder')
    : t('task.textPlaceholder');
});

const secondInputPlaceholder = computed(() => {
  return isAnnotationMode.value
    ? t('task.textPlaceholder')
    : t('task.translationPlaceholder');
});

// 新增: 动态更新函数，用于手动实现v-model的更新逻辑
function onFirstInput(value) {
  if (isAnnotationMode.value) {
    props.item.speaker = value;
  } else {
    props.item.text = value;
  }
}

function onSecondInput(value) {
  if (isAnnotationMode.value) {
    props.item.text = value;
  } else {
    props.item.translation = value;
  }
}

function onItemClick() {
  taskStore.art.seek = sub.value.startTime + 0.01;
}

function onRemoveClick() {
  taskStore.task.subtitle.splice(props.index, 1);
}

function onMergeClick() {
  const currentSub = props.item;
  const nextSub = taskStore.task.subtitle[props.index + 1];
  if (nextSub) {
    // 使用 Sub 类中定义的 merge 方法，确保逻辑一致性
    currentSub.merge(nextSub);
    // 从数组中移除已被合并的下一条字幕
    taskStore.task.subtitle.splice(props.index + 1, 1);
  }
}

function onAddClick() {
  const subtitle = new Sub({
    startTime: sub.value.endTime,
    endTime: sub.value.endTime + 1,
    text: t('task.tmp'),
  });
  taskStore.task.subtitle.splice(props.index + 1, 0, subtitle);
}

watchEffect(() => {
  if (isText1Focus.value || isText2Focus.value) {
    taskStore.art.pause();
  }
});
</script>
