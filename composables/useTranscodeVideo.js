export function useTranscodeVideo() {
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

  async function transcodeVideo(file, duration = 0) {
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
            errorNotify('Transcode Cancelled');
            reject(new Error('Transcode Cancelled'));
            break;
          }
          case 'done': {
            reset();
            closeFFmpegPage();
            const newFile = createFileFromBase64(data);
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
              errorNotify('Transcode Timeout');
              reject(new Error('Transcode Timeout'));
            }, config.OPTION.FFMPEG_TIMEOUT);
            break;
          }
          case 'ready': {
            channel.value.postMessage({
              type: 'transcode',
              data: {
                video: await createBase64FromFile(file),
                duration: duration,
                name: file.name,
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

  return { transcodeVideo, progress, running };
}
