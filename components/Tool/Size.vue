<template>
  <div class="flex items-center gap-2">
    {{ $t(`option.size`) }}:
    <el-select
      v-model="taskStore.task.option.burnSize"
      class="!w-36"
      :size="size"
    >
      <el-option
        v-for="item in RESOLUTIONS"
        :key="item"
        :value="parseInt(item)"
        :disabled="item > videoHeight"
        :label="$t(`option.${item}`)"
      />
    </el-select>
  </div>
</template>

<script setup>
const taskStore = useTaskStore();
const config = useAppConfig();
const { RESOLUTIONS } = config.OPTION;
const videoHeight = computed(() => taskStore.art?.video?.videoHeight || 0);

defineProps({
  size: {
    type: String,
    default: 'small',
  },
});
</script>
