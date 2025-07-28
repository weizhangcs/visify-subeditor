<template>
  <div class="flex flex-col">
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`create.name`) }}:
      </div>
      <div class="flex w-0 flex-1 shrink-0 items-center">
        <el-input
          v-model.trim="taskStore.task.option.name"
          clearable
          size="small"
          maxlength="100"
          class="w-full rounded bg-black/20"
          :placeholder="$t('create.namePlaceholder')"
        />
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`option.wf`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <div class="flex items-center gap-1.5">
          {{ $t(`option.duration`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="duration"
              :min="10"
              :max="60"
              :step="1"
              size="small"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          {{ $t(`option.waveScale`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="waveScale"
              :min="0.1"
              :max="2"
              :step="0.1"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`option.burn`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <ToolSize />
        <ToolPreset />
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`option.other`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <div class="flex items-center gap-1">
          {{ $t(`option.autoAlign`) }}
          <el-switch
            v-model="appStore.option.autoAlign"
            active-text="Y"
            inactive-text="N"
            inline-prompt
          />
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`option.tooltip`) }}
          <el-switch
            v-model="appStore.option.tooltip"
            active-text="Y"
            inactive-text="N"
            inline-prompt
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const appStore = useAppStore();
const taskStore = useTaskStore();
const duration = ref(20);
const waveScale = ref(0.8);

watch(
  () => duration.value,
  (value) => {
    taskStore.wf?.setOptions({
      duration: value,
    });
  },
);

watch(
  () => waveScale.value,
  (value) => {
    taskStore.wf?.setOptions({
      waveScale: value,
    });
  },
);
</script>
