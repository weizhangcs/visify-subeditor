export function useExtractAudio() {
  const { t } = useI18n();
  const appStore = useAppStore();
  const config = useAppConfig();

  const id = ref(null);
  const progress = ref(0);
  const timer = ref(null);
  const channel = ref(null);
  const running = ref(false);

  function reset() {
    id.value = null;
    channel.value?.close?.();
    channel.value = null;
    clearTimeout(timer.value);
    timer.value = null;
    running.value = false;
    progress.value = 0;
  }

  async function extractAudio(videoFile, fileName) {
    return new Promise((resolve, reject) => {
      reset();
      id.value = Date.now();
      channel.value = new BroadcastChannel(id.value);

      channel.value.onmessage = async (event) => {
        const { type, data, message } = event.data;

        switch (type) {
          case 'close': {
            reset();
            closeFFmpegPage();
            errorNotify('Extract Cancelled');
            reject(new Error('Extract Cancelled'));
            break;
          }
          case 'done': {
            reset();
            closeFFmpegPage();
            const newFile = createFileFromBase64(data);
            if (newFile.size > 25 * 1024 * 1024) {
              reject(new Error(t('create.audioSizeLimit')));
            } else {
              resolve(newFile);
            }
            break;
          }
          case 'error': {
            reset();
            closeFFmpegPage();
            errorNotify(message);
            reject(new Error(message));
            break;
          }
          case 'progress': {
            running.value = true;
            progress.value = data;
            clearTimeout(timer.value);
            appStore.ffmpeg.progress = data;
            timer.value = setTimeout(() => {
              reset();
              closeFFmpegPage();
              errorNotify('Extract Timeout');
              reject(new Error('Extract Timeout'));
            }, config.OPTION.FFMPEG_TIMEOUT);
            break;
          }
          case 'ready': {
            channel.value.postMessage({
              type: 'extract',
              data: {
                video: await createBase64FromFile(videoFile),
                name: fileName,
              },
            });
            break;
          }
          default:
            break;
        }
      };

      openFFmpegPage({ id: id.value });
    });
  }

  onBeforeUnmount(reset);

  return { extractAudio, progress, running };
}
