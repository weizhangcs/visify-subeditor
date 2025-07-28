<template>
  <div class="flex h-full justify-between gap-2">
    <div
      class="h-24 w-24 rounded border border-dashed border-white/20 bg-white/10 p-0.5"
    >
      <img
        v-if="videoPoster"
        :src="videoPoster"
        crossorigin="anonymous"
        class="h-full w-full rounded object-cover"
      />
      <div
        v-else
        class="flex h-full w-full flex-col items-center justify-center gap-2 rounded bg-black/50 text-xs text-white/40"
      >
        <Icon name="fa-image" class="text-4xl" />
        {{ $t(`create.posterNo`) }}
      </div>
    </div>
    <div class="flex w-0 flex-1 flex-col justify-between">
      <div class="flex flex-col gap-1.5 rounded bg-black/20 p-2 text-sm">
        <div class="flex items-center gap-2">
          <div class="text-white/50">{{ $t(`create.file`) }}</div>
          <div class="w-0 flex-1 truncate text-white/80">
            {{ videoName }}
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="text-white/50">
              {{ $t(`create.duration`) }}
            </div>
            <div class="font-semibold text-red-700">
              {{ d2t(videoDuration, true) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-white/50">
              {{ $t(`create.size`) }}
            </div>
            <div class="text-white/80">
              {{ getSize(videoSize) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-white/50">
              {{ $t(`create.type`) }}
            </div>
            <div v-if="videoType" class="text-white/80">
              {{ $t(`type.video.${videoType}`) }}
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end">
        <el-button
          color="#d9622b"
          size="small"
          :dark="true"
          @click="createStore.$reset()"
        >
          <Icon name="fa-retweet" class="mr-1 text-sm" />
          {{ $t(`create.reselect`) }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const createStore = useCreateStore();
const task = createStore.task;
const videoPoster = computed(() => task.offline.videoPoster);
const videoName = computed(() => task.offline.videoFile?.name || '');
const videoSize = computed(() => task.offline.videoFile?.size || 0);
const videoType = computed(() => task.option.videoType);
const videoDuration = computed(() => {
  if (task.offline.videoDuration === Infinity) return 0;
  return task.offline.videoDuration || 0;
});
</script>
