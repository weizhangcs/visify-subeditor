<template>
  <div class="relative flex flex-col">
    <SubtitleTop />
    <SubtitleData />
    <SubtitleSplit />
  </div>
</template>

<script setup>
import cloneDeep from 'lodash/cloneDeep';
const taskStore = useTaskStore();

const subtitle = computed({
  get: () => taskStore.task.subtitle,
  set: (val) => {
    taskStore.task.subtitle = val;
  },
});

const { undo, redo, canRedo, canUndo, clear } = useRefHistory(subtitle, {
  deep: cloneDeep,
  capacity: 200,
});

taskStore.undo = undo;
taskStore.redo = redo;
taskStore.clear = clear;
taskStore.canRedo = canRedo;
taskStore.canUndo = canUndo;
</script>
