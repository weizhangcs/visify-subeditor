<template>
  <div class="flex h-full shrink-0 items-center gap-2 px-3 text-[13px]">
    <div class="flex items-center gap-1 text-white/60">
      {{ $t(`translate.name`) }}:
    </div>
    <el-select
      v-model="option.translateTo"
      clearable
      filterable
      class="!w-36"
      :disabled="loading"
      :placeholder="$t(`translate.placeholder`)"
    >
      <el-option
        v-for="item in LANGUAGES"
        :key="item.language"
        :value="item.language"
        :label="item.name"
      />
    </el-select>
    <el-tooltip
      popper-class="pointer-events-none"
      :disabled="!option.tooltip"
      :content="$t(`header.translateTip`)"
      placement="bottom"
      effect="light"
    >
      <el-button
        :disabled="!option.translateTo"
        color="#752522"
        dark
        @click="onClick"
      >
        {{
          loading
            ? `${Math.floor(percentage)}% ${$t(`translate.stop`)}`
            : $t(`translate.start`)
        }}
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup>
const { t } = useI18n();
const taskStore = useTaskStore();
const { LANGUAGES } = useAppConfig();
const option = computed(() => taskStore.task.option);
const { loading, percentage, handleTranslate } = useTranslate();

async function onClick() {
  try {
    await handleTranslate();
  } catch (error) {
    if (error.message === t('translate.subtitleEmpty')) {
      warningNotify(error.message);
    } else {
      errorNotify(error.message);
    }
  }
}
</script>
