import localForage from 'localforage';

export async function useCacheStatic() {
  //console.log('2. [useCacheStatic.js] Script execution started.');
  // 新增：如果URL中已有videoUrl参数，则立即退出，不执行任何操作
  if (
    import.meta.client &&
    new URLSearchParams(window.location.search).has('videoUrl')
  ) {
    //console.log('2a. [useCacheStatic.js] In URL-driven mode, exiting.');
    return;
  }

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
    //console.log('2b. [useCacheStatic.js] Overwriting state with blob from CACHE:', url);
    taskStore.task.offline.videoBlobUrl = url;
  } else {
    const video = await fetch(path);
    const videoBlob = await video.blob();
    await staticStorage.setItem(path, videoBlob);
    const url = URL.createObjectURL(videoBlob);
    //console.log('2c. [useCacheStatic.js] Overwriting state with NEWLY FETCHED blob:', url);
    taskStore.task.offline.videoBlobUrl = url;
  }
}
