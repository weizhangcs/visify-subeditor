<template>
  <div class="flex flex-col">
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <a
        href="https://www.deepl.com/en/login"
        target="_blank"
        class="flex h-6 w-32 shrink-0 cursor-pointer items-center gap-2 text-white hover:text-blue-500 hover:underline"
      >
        <Icon name="fa-up-right-from-square" />
        DeepL API KEY
      </a>
      <div class="flex w-0 flex-1 shrink-0 items-center">
        <el-input
          v-model.trim="appStore.option.deepLApiKey"
          clearable
          size="small"
          maxlength="200"
          class="rounded bg-black/20"
          :placeholder="`${'*'.repeat(36)}:fx`"
        />
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <a
        href="https://www.deepl.com/en/login"
        target="_blank"
        class="flex h-6 w-32 shrink-0 cursor-pointer items-center gap-2 text-white hover:text-blue-500 hover:underline"
      >
        <Icon name="fa-up-right-from-square" />
        DeepL API URL
      </a>
      <div class="flex w-0 flex-1 shrink-0 items-center">
        <el-input
          v-model.trim="appStore.option.deepLApiUrl"
          clearable
          size="small"
          maxlength="200"
          class="rounded bg-black/20"
          placeholder="https://api-free.deepl.com/v2/translate"
        />
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <a
        href="https://platform.openai.com/usage"
        target="_blank"
        class="flex h-6 w-32 shrink-0 cursor-pointer items-center gap-2 text-white hover:text-blue-500 hover:underline"
      >
        <Icon name="fa-up-right-from-square" />
        OpenAI API KEY
      </a>
      <div class="flex w-0 flex-1 shrink-0 items-center">
        <el-input
          v-model.trim="appStore.option.openaiApiKey"
          clearable
          size="small"
          maxlength="200"
          class="rounded bg-black/20"
          :placeholder="`sk-${'*'.repeat(48)}`"
        />
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <a
        href="https://platform.openai.com/usage"
        target="_blank"
        class="flex h-6 w-32 shrink-0 cursor-pointer items-center gap-2 text-white hover:text-blue-500 hover:underline"
      >
        <Icon name="fa-up-right-from-square" />
        OpenAI API URL
      </a>
      <div class="flex w-0 flex-1 shrink-0 items-center">
        <el-input
          v-model.trim="appStore.option.openaiApiUrl"
          clearable
          size="small"
          maxlength="200"
          class="rounded bg-black/20"
          placeholder="https://api.openai.com/v1/audio/transcriptions"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const appStore = useAppStore();
</script>
