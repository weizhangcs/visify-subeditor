<template>
  <div class="relative p-4">
    <div
      id="player"
      :data-cruuent="taskStore.currentIndex"
      class="flex h-full w-full items-center justify-center"
    />
    <Teleport v-if="isReady" to=".art-subtitle">
      <div
        class="relative inline-flex flex-col items-center justify-end px-1 text-center"
        :style="{
          ...style,
          backgroundColor: simulateBackground
            ? 'transparent'
            : style.backgroundColor,
        }"
      >
        <div
          v-if="simulateBackground"
          class="absolute top-0 z-0"
          :style="simulateStyle"
        />

        <div
          v-if="isAnnotationMode"
          ref="text1"
          class="relative z-10 inline-flex flex-col items-center"
        >
          <div
            v-for="(line, index) in speakerArr"
            :key="index"
            class="subtitle-line relative whitespace-nowrap"
            :data-line="line"
            :style="{
              '--outline-color': OutlineColour,
            }"
          >
            {{ line }}
          </div>
        </div>

        <div
          v-if="!isAnnotationMode"
          ref="text1"
          class="relative z-10 inline-flex flex-col items-center"
        >
          <div
            v-for="(line, index) in textArr"
            :key="index"
            class="subtitle-line relative whitespace-nowrap"
            :data-line="line"
            :style="{
              '--outline-color': OutlineColour,
            }"
          >
            {{ line }}
          </div>
        </div>

        <div
          v-if="isAnnotationMode"
          ref="text2"
          class="relative z-10 inline-flex origin-top flex-col items-center"
        >
          <div
            v-for="(line, index) in textArr"
            :key="index"
            class="subtitle-line relative whitespace-nowrap"
            :data-line="line"
            :style="{
              '--outline-color': SecondaryOutlineColour,
            }"
          >
            {{ line }}
          </div>
        </div>

        <div
          v-if="!isAnnotationMode"
          ref="text2"
          class="relative z-10 inline-flex origin-top flex-col items-center"
          :style="{
            color: style.secondaryColor,
            textShadow: style.secondaryTextShadow,
          }"
        >
          <div
            v-for="(line, index) in translationArr"
            :key="index"
            class="subtitle-line relative whitespace-nowrap"
            :data-line="line"
            :style="{
              '--outline-color': SecondaryOutlineColour,
            }"
          >
            {{ line }}
          </div>
        </div>

      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Artplayer from 'artplayer';
Artplayer.LOG_VERSION = false;

const { t } = useI18n();
const isReady = ref(false);
const appStore = useAppStore();
const taskStore = useTaskStore();
const text = ref(null);
const text2 = ref(null);
const textBounding = useElementBounding(text);
const text2Bounding = useElementBounding(text2);
const option = computed(() => taskStore.task.option);
const isAnnotationMode = computed(() => option.value.subtitleMode === 1);

const url = computed(() => {
  return taskStore.task.offline.videoBlobUrl;
});

const current = computed(() => {
  return taskStore.task.subtitle[taskStore.currentIndex];
});

const speakerArr = computed(() => {
  if (!current.value || typeof current.value.speaker !== 'string') return [];
  return current.value.speaker.trim().split(/\r?\n/).filter(Boolean);
});

const textArr = computed(() => {
  if (!current.value || typeof current.value.text !== 'string') return [];
  return current.value.text.trim().split(/\r?\n/).filter(Boolean);
});

const translationArr = computed(() => {
  if (!current.value || typeof current.value.translation !== 'string') return [];
  return current.value.translation.trim().split(/\r?\n/).filter(Boolean);
});

const style = computed(() => {
  const css = assToCss(taskStore.task.style);
  const fontSize = parseFloat(css.fontSize);
  const translateY = 0; // Resetting translateY logic as it's complex and might not be needed
  css.transform = `translateY(${translateY}px)`;
  return css;
});

const OutlineColour = computed(() =>
  colorToHtml(readColor(taskStore.task.style.OutlineColour)),
);

const SecondaryOutlineColour = computed(() =>
  colorToHtml(readColor(taskStore.task.style.SecondaryOutlineColour)),
);

const simulateBackground = computed(() => {
  return option.value.subtitleMode === 1 && style.value.backgroundColor;
});

const simulateStyle = computed(() => {
  if (!simulateBackground.value) return {};
  const width = Math.max(textBounding.width.value, text2Bounding.width.value);
  const height = textBounding.height.value + text2Bounding.height.value;
  return {
    backgroundColor: style.value.backgroundColor,
    width: width + 10 + 'px',
    height: height + 'px',
  };
});

const { pause } = useRafFn(() => {
  taskStore.currentTime = taskStore.art?.currentTime ?? 0;
  taskStore.duration = taskStore.art?.duration ?? 0;
  taskStore.artSize.height = taskStore.art?.height ?? 0;
  taskStore.artSize.width = taskStore.art?.width ?? 0;
});

function autoSize() {
  if (taskStore.art?.fullscreen) return;
  if (taskStore.art?.fullscreenWeb) return;
  taskStore.art?.autoSize();
}

function init() {
  if (taskStore.art) return;
  const art = new Artplayer({
    container: '#player',
    url: url.value,
    autoSize: true,
    loop: true,
    flip: true,
    hotkey: false,
    playbackRate: true,
    aspectRatio: true,
    setting: true,
    fullscreen: true,
    fullscreenWeb: true,
    miniProgressBar: true,
    controls: [
      {
        html: `<img alt="camera" style="height:24px;" src="/static/images/camera.svg" />`,
        position: 'right',
        tooltip: t('task.screenshot'),
        async click() {
          const { $player } = taskStore.art.template;
          const { default: html2canvas } = await import('html2canvas');
          const canvas = await html2canvas($player, {
            ignoreElements(element) {
              return [
                'art-bottom',
                'art-notice',
                'art-mask',
                'art-loading',
                'art-info',
                'art-contextmenus',
              ].includes(element.className);
            },
          });

          canvas.toBlob((blob) => {
            const downloadUrl = URL.createObjectURL(blob);
            download(downloadUrl, `${Date.now()}.png`);
            URL.revokeObjectURL(downloadUrl);
          });
        },
      },
    ],
  });

  function checkPortrait() {
    const portrait = art.video.videoWidth < art.video.videoHeight;
    if (portrait && appStore.option.toolbar) {
      appStore.option.toolbar = false;
    }
  }

  art.on('ready', () => {
    isReady.value = true;
    checkPortrait();
  });

  art.on('restart', () => {
    checkPortrait();
  });

  art.on('blur', () => {
    art.controls.show = false;
  });

  art.on('video:canplay', () => {
    autoSize();
  });

  taskStore.art = art;
}

//onMounted(init);
onMounted(() => {
  //console.log('3. [Player.vue] Component is mounting. Current videoBlobUrl is:', taskStore.task.offline.videoBlobUrl);
  init();
});

onBeforeUnmount(() => {
  pause();
  taskStore.art?.destroy();
  taskStore.art = null;
});

watch(
  () => url.value,
  () => {
    taskStore.art.url = url.value;
  },
);

watch(
  () => appStore.option.splitX,
  () => autoSize(),
);

watch(
  () => appStore.option.toolbar,
  async () => {
    await sleep(300);
    autoSize();
  },
);
</script>

<style lang="scss">
.art-video-player {
  transition-property: width, height;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.art-subtitle {
  display: flex !important;
  overflow: hidden !important;
  bottom: 0 !important;
  padding: 0 !important;
  text-shadow: none !important;
}

.subtitle-line:after {
  content: attr(data-line);
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  text-shadow: none;
  color: var(--outline-color);
  -webkit-text-stroke: var(--outline-size) var(--outline-color);
  font-size: 1em;
}
</style>
