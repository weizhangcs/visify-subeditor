import cloneDeep from 'lodash/cloneDeep';

export const useCreateStore = defineStore('create', {
  state: () => {
    const config = useAppConfig();
    return {
      uploaded: false,
      analyzing: false,
      analysisProgress: 0,
      task: cloneDeep(config.EXTEND),
    };
  },
  actions: {
    async getInfo(file) {
      const blobUrl = fileToBlobUrl(file);
      const offlineInfo = await getVideoInfo(blobUrl, (progress) => {
        this.analysisProgress = progress;
      });
      offlineInfo.size = file.size;
      offlineInfo.name = file.name;
      offlineInfo.file = file;
      offlineInfo.blobUrl = blobUrl;

      if (offlineInfo.canPlay) {
        this.task.offline.canPlay = true;
        this.task.offline.videoHasAudio = offlineInfo.hasAudio;
        this.task.offline.videoHasVideo = offlineInfo.hasVideo;
        this.task.offline.videoDuration = offlineInfo.duration;
        this.task.offline.videoPoster = offlineInfo.poster;
        this.task.offline.thumbnail = offlineInfo.thumbnail;
      } else {
        this.task.offline.canPlay = false;
      }

      this.task.offline.videoFile = file;
      this.task.offline.videoBlobUrl = blobUrl;

      return offlineInfo;
    },
    async handleVideo(file) {
      const { t } = useNuxtApp().$i18n;

      this.analyzing = true;
      const offlineInfo = await this.getInfo(file);
      this.analyzing = false;

      if (!offlineInfo.canPlay) {
        errorNotify(t('create.videoNotPlay'));
        return false;
      }

      if (offlineInfo.duration === Infinity || !offlineInfo.duration) {
        errorNotify('Invalid video duration');
        return false;
      }

      if (!this.task.option.name.trim()) {
        this.task.option.name = file.name.slice(0, 100);
      }

      return true;
    },
  },
});