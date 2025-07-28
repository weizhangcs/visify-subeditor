<template>
  <div
    ref="data"
    class="relative h-0 flex-1"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <RecycleScroller
      v-if="subtitle.length"
      ref="scroller"
      v-slot="{ item, index }"
      class="h-full overflow-y-auto scroll-smooth"
      :items="subtitle"
      :item-size="height"
      key-field="_id"
      @scroll="onScroll"
    >
      <SubtitleItem
        :item="item"
        :index="index"
        :height="height"
        :is-scroll="isScroll"
      />
    </RecycleScroller>
    <div v-else class="flex w-full flex-col items-center pt-6">
      <el-empty :image-size="200" :description="$t(`task.noData`)" />
      <div class="flex justify-center">
        <el-button
          :icon="Plus"
          color="#626aef"
          dark
          plain
          @click="onCreateClick"
        >
          {{ $t(`task.create`) }}
        </el-button>
        <el-popover
          placement="top"
          :width="200"
          trigger="hover"
          :content="$t(`task.decodeTip`)"
        >
          <template #reference>
            <el-button
              :icon="Promotion"
              :loading="decoding"
              color="#626aef"
              dark
              plain
              @click="onDecodeClick"
            >
              {{ $t(`task.decode`) }}
            </el-button>
          </template>
        </el-popover>
        <el-popover
          placement="top"
          :width="200"
          trigger="hover"
          :content="$t(`task.keyTip`)"
        >
          <template #reference>
            <el-button
              :icon="Headset"
              color="#626aef"
              dark
              plain
              @click="onKeyClick"
            >
              {{ $t(`task.key`) }}
            </el-button>
          </template>
        </el-popover>
      </div>
    </div>
    <SubtitleTool :is-scroll="isScroll" />
  </div>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller';
import { Plus, Promotion, Headset } from '@element-plus/icons-vue';

const { t } = useI18n();
const taskStore = useTaskStore();
const scroller = ref(null);
const data = ref(null);
const height = ref(104);
const isScroll = ref(false);
const decoding = ref(false);
const isHover = ref(false);

const subtitle = computed(() => {
  return [...taskStore.task.subtitle];
});

const onScrollDebounce = useDebounceFn(() => {
  isScroll.value = false;
}, 200);

function onScroll() {
  isScroll.value = true;
  onScrollDebounce();
}

function onCreateClick() {
  taskStore.task.subtitle.push(
    new Sub({
      startTime: 0,
      endTime: 1,
      text: t('task.tmp'),
    }),
  );
}

async function onDecodeClick() {
  decoding.value = true;
  const { channelData } = taskStore.wf.decoder;
  const resule = await usePcmToSub(channelData);
  if (resule.length) {
    taskStore.task.subtitle = resule;
  } else {
    warningNotify(t('task.audioDecodeError'));
  }
  decoding.value = false;
}

async function onKeyClick() {
  taskStore.art.play();
  warningNotify(t('task.keyTip2'));
}

watch(
  () => taskStore.currentIndex,
  (currentIndex) => {
    if (
      !isHover.value &&
      currentIndex > -1 &&
      document.activeElement.tagName !== 'TEXTAREA'
    ) {
      scroller.value?.scrollToItem?.(currentIndex);
    }
  },
);
</script>

<style lang="scss">
.text1,
.text2 {
  --el-border-color: rgba(255, 255, 255, 0.1);
  --el-border-color-hover: rgba(255, 255, 255, 0.1);
  --el-input-focus-border-color: rgba(255, 255, 255, 0.1);
  .el-textarea__inner {
    padding: 5px;
    border-radius: 0px;
    box-shadow: none;
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.subtitle-mode-2,
.subtitle-mode-3 {
  .el-textarea__inner {
    height: 100%;
  }
}
</style>
