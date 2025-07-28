import localForage from 'localforage';

export async function useCacheStatic() {
  const { DEMO } = useAppConfig();
  const taskStore = useTaskStore();

  const staticStorage = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'aimu.app',
    storeName: 'static',
  });

  const path = DEMO.offline.videoBlobUrl;
  const blob = await staticStorage.getItem(path);

  if (blob) {
    const url = URL.createObjectURL(blob);
    taskStore.task.offline.videoBlobUrl = url;
  } else {
    const video = await fetch(path);
    const videoBlob = await video.blob();
    await staticStorage.setItem(path, videoBlob);
    const url = URL.createObjectURL(videoBlob);
    taskStore.task.offline.videoBlobUrl = url;
  }
}
