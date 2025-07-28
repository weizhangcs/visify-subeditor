export function useBurnVideo() {
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

  async function burnVideo(task) {
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
            errorNotify('Burn Cancelled');
            reject(new Error('Burn Cancelled'));
            break;
          }
          case 'done': {
            reset();
            closeFFmpegPage();
            const newFile = createFileFromBase64(data);
            successNotify(t('export.success'));
            useNotify({ title: 'BURN', task });
            resolve(newFile);
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
              errorNotify('Burn Timeout');
              reject(new Error('Burn Timeout'));
            }, config.OPTION.FFMPEG_TIMEOUT);
            break;
          }
          case 'ready': {
            const { offline, option, style } = task;
            channel.value.postMessage({
              type: 'burn',
              data: {
                ass: sub2ass(task),
                video: await createBase64FromFile(offline.videoFile),
                option: { ...option },
                fontnames: [style.Fontname],
                name: option.name,
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

  return { burnVideo, progress, running };
}
