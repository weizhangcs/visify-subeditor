<template>
  <div class="flex flex-col gap-3">
    <DialogsCreateTitle icon="fa-text" name="create.name" />
    <div class="px-4">
      <el-input
        ref="input"
        v-model.trim="createStore.task.option.name"
        clearable
        size="large"
        maxlength="100"
        class="rounded bg-black/20"
        :placeholder="$t('create.namePlaceholder')"
      />
    </div>
  </div>
</template>

<script setup>
const input = ref();
const createStore = useCreateStore();

onMounted(() => {
  setTimeout(() => {
    input.value.focus();
  }, 100);
});
</script>
