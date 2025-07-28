<template>
  <div v-loading="loadingInfo" class="relative flex flex-col gap-4 px-4 py-4">
    <div class="flex items-center gap-4">
      <el-input
        ref="input"
        v-model.trim="createStore.online.url"
        clearable
        size="large"
        maxlength="1000"
        class="rounded bg-black/20"
        placeholder="URL from Youtube, Twitter, Facebook, Instagram, Twitch..."
        :disabled="createStore.online.loading"
        @paste="onAnalyze"
        @clear="createStore.resetOnlineInfo"
      />
      <el-button color="#4ca154" :dark="true" size="large" @click="onAnalyze">
        <Icon name="fa-magnifying-glass" class="mr-2 text-base" />
        {{ $t(`create.confirm`) }}
      </el-button>
    </div>
    <div class="flex items-stretch justify-between gap-3">
      <div class="size-32 rounded border border-white/10 bg-white/5 p-0.5">
        <img
          v-show="createStore.online.info.thumbnail && !thumbnailError"
          :src="createStore.online.info.thumbnail"
          class="h-full w-full rounded object-cover"
          @error="thumbnailError = true"
          @load="thumbnailError = false"
        />
        <div
          v-show="thumbnailError || !createStore.online.info.thumbnail"
          class="flex h-full w-full flex-col items-center justify-center gap-2 rounded bg-black/50 text-xs text-white/40"
        >
          <Icon name="fa-image" class="text-4xl" />
          {{ $t(`create.posterNo`) }}
        </div>
      </div>
      <div class="flex w-0 flex-1 flex-col justify-between">
        <div
          class="flex h-9 items-center rounded border border-dashed border-white/10 bg-black/20 px-1"
        >
          <div
            v-if="createStore.online.info.title"
            class="flex items-center gap-2 leading-none"
          >
            <el-tag type="success">
              {{ d2t(createStore.online.info.duration, true) }}
            </el-tag>
            <div class="max-w-72 truncate">
              {{ createStore.online.info.title }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-14 shrink-0">{{ $t(`create.videoTitle`) }}:</div>
          <el-select
            v-model="createStore.online.video"
            clearable
            filterable
            :placeholder="$t(`create.pleaseSelectVideo`)"
          >
            <el-option
              v-for="(item, index) in createStore.online.info.videos"
              :key="index"
              :label="item.label"
              :value="item.value"
            >
              <div class="flex items-center gap-1">
                <span
                  v-if="item.is4k"
                  class="flex items-center justify-center rounded-sm bg-red-600 px-1 text-xs text-white"
                >
                  4K
                </span>
                <span>{{ item.label }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-14 shrink-0">{{ $t(`create.subtitleTitle`) }}:</div>
          <el-select-v2
            v-model="createStore.online.subtitle"
            clearable
            filterable
            :options="createStore.online.info.subtitles"
            :placeholder="$t(`create.pleaseSelectSubtitle`)"
          >
            <template #default="{ item }">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon
                    name="fa-down-to-line"
                    class="text-sm text-white opacity-60 hover:opacity-100"
                    @click.stop="onDownload(item)"
                  />
                  {{ item.label }}
                </div>
                <div class="text-sm text-white/50">
                  {{ item.autoTrans ? $t(`create.autoTrans`) : '' }}
                </div>
              </div>
            </template>
          </el-select-v2>
        </div>
      </div>
    </div>
    <div
      v-if="createStore.online.loading"
      ref="messages"
      class="absolute inset-0 z-10 flex flex-col overflow-hidden bg-black/80 p-2 text-green-500"
    >
      <div v-for="(item, index) in createStore.online.messages" :key="index">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
const input = ref(null);
const messages = ref(null);
const thumbnailError = ref(false);
const createStore = useCreateStore();

const loadingInfo = computed(() => {
  if (createStore.online.loading) {
    return {
      visible: createStore.online.loading,
      text: createStore.online.text || '',
      background: 'rgba(0, 0, 0, 0)',
    };
  } else {
    return false;
  }
});

async function onAnalyze() {
  await sleep(100);
  createStore.onOnlineAnalyze();
}

async function onDownload(item) {
  window.open(item.value, '_blank');
}

onMounted(async () => {
  await sleep(100);
  input.value?.input?.focus?.();
});

watch(
  () => createStore.online.messages.length,
  async () => {
    await sleep(100);
    messages.value?.scrollTo?.(0, messages.value.scrollHeight);
  },
);
</script>
