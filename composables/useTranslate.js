export function useTranslate() {
  const { t } = useI18n();
  const appStore = useAppStore();
  const taskStore = useTaskStore();

  const loading = ref(false);
  const percentage = ref(0);
  const shouldStop = ref(false);

  const option = computed(() => taskStore.task.option);
  const subtitle = computed(() => taskStore.task.subtitle);

  async function translate(text, target_lang) {
    const { data, error } = await useFetch('/api/translate', {
      method: 'POST',
      body: {
        text,
        target_lang,
      },
      query: {
        deepLApiKey: appStore.option.deepLApiKey || undefined,
        deepLApiUrl: appStore.option.deepLApiUrl || undefined,
      },
    });

    if (error.value) {
      throw new Error(error.value.data?.message || error.value.message);
    }

    return data.value;
  }

  async function startTranslation() {
    loading.value = true;
    percentage.value = 0;
    shouldStop.value = false;

    for (let i = 0; i < subtitle.value.length; i++) {
      if (shouldStop.value) break;
      const item = subtitle.value[i];
      if (!item.text.trim()) continue;
      try {
        item.text2 = await translate(item.text, option.value.translateTo);
      } catch (error) {
        shouldStop.value = true;
        loading.value = false;
        percentage.value = 0;
        throw error;
      }
      percentage.value = ((i + 1) / subtitle.value.length) * 100;
    }

    loading.value = false;
    percentage.value = 0;
    shouldStop.value = false;
  }

  async function handleTranslate() {
    if (loading.value) {
      shouldStop.value = true;
      loading.value = false;
      percentage.value = 0;
      return;
    }

    if (subtitle.value.length === 0) {
      throw new Error(t('translate.subtitleEmpty'));
    }

    await startTranslation();
  }

  return { loading, percentage, handleTranslate };
}
