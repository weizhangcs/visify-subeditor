export function useTranscribeAudio() {
  const appStore = useAppStore();

  async function transcribeAudio(file) {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await useFetch('/api/transcriptions', {
      method: 'POST',
      body: formData,
      query: {
        openaiApiKey: appStore.option.openaiApiKey || undefined,
        openaiApiUrl: appStore.option.openaiApiUrl || undefined,
      },
    });

    if (error.value) {
      throw new Error(error.value.data?.message || error.value.message);
    }

    return data.value;
  }

  return { transcribeAudio };
}
