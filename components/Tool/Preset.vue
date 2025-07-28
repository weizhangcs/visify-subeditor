<template>
  <div class="flex items-center gap-2">
    {{ $t(`option.preset`) }}:
    <el-select
      v-model="taskStore.task.option.burnPreset"
      class="!w-36"
      :size="size"
    >
      <el-option
        v-for="item in PRESETS"
        :key="item"
        :value="item"
        :label="$t(`option.${item}`)"
      />
    </el-select>
  </div>
</template>

<script setup>
const taskStore = useTaskStore();
const config = useAppConfig();
const { PRESETS } = config.OPTION;

defineProps({
  size: {
    type: String,
    default: 'small',
  },
});
</script>
