export function usePcmToSub(pcm) {
  return new Promise(async (resolve) => {
    const { t } = useNuxtApp().$i18n;
    const url = `/static/js/pcmToTimestamp.worker.js`;
    const text = await (await fetch(url)).text();
    const blob = new Blob([text], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);
    worker.onmessage = (event) => {
      const { data } = event;
      const result = data.map(
        (item) =>
          new Sub({
            startTime: item[0],
            endTime: item[1],
            text: t('task.tmp'),
          }),
      );
      resolve(result);
      worker.onmessage = null;
      worker.terminate();
    };
    worker.postMessage(pcm);
  });
}
