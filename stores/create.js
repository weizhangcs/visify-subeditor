import cloneDeep from 'lodash/cloneDeep';

export const useCreateStore = defineStore('create', {
  state: () => {
    const config = useAppConfig();
    return {
      uploaded: false,
      analyzing: false,
      analysisProgress: 0,
      task: cloneDeep(config.EXTEND),

      online: {
        url: '',
        dialog: false,
        loading: false,
        text: '',
        video: null,
        subtitle: null,
        messages: [],
        info: {
          url: '',
          title: '',
          videos: [],
          duration: null,
          thumbnail: '',
          subtitles: [],
          directLink: false,
        },
      },

      camera: {
        dialog: false,
        loading: false,
        recording: false,
        duration: 0,
        blob: null,
        recorder: {
          status: '',
        },
      },

      screen: {
        dialog: false,
        loading: false,
        recording: false,
        duration: 0,
        blob: null,
        recorder: {
          status: '',
        },
      },
    };
  },
  getters: {
    isInstalled() {
      if (import.meta.client) {
        return document.documentElement.dataset.aimuExtension === 'installed';
      } else {
        return false;
      }
    },
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
    async onFileChange(file) {
      const { t } = useNuxtApp().$i18n;
      const state = await this.handleVideo(file);

      if (state) {
        this.task.option.videoType = 1;
        this.uploaded = true;
      } else {
        throw new Error(t('create.videoNotPlay'));
      }
    },
    resetCamera() {
      this.camera.recorder.stopRecording?.();
      this.camera.recorder.clearBlobUrl?.();
      this.camera.recorder = { status: '' };
      this.camera.loading = false;
      this.camera.duration = 0;
      this.camera.blob = null;
    },
    async onCameraConfirm() {
      if (!this.camera.blob) return;
      this.camera.dialog = false;
      const file = blobToFile(this.camera.blob, 'camera.webm');
      const state = await this.handleVideo(file);
      if (state) {
        this.task.option.videoType = 3;
        this.uploaded = true;
      }
    },
    resetScreen() {
      this.screen.recorder.stopRecording?.();
      this.screen.recorder.clearBlobUrl?.();
      this.screen.recorder = { status: '' };
      this.screen.loading = false;
      this.screen.duration = 0;
      this.screen.blob = null;
    },
    async onScreenConfirm() {
      if (!this.screen.blob) return;
      this.screen.dialog = false;
      const file = blobToFile(this.screen.blob, 'screen.webm');
      const state = await this.handleVideo(file);
      if (state) {
        this.task.option.videoType = 4;
        this.uploaded = true;
      }
    },
    resetOnlineInfo() {
      this.online.url = '';
      this.online.video = null;
      this.online.subtitle = null;
      this.online.messages = [];
      this.online.info = {
        url: '',
        title: '',
        videos: [],
        duration: null,
        thumbnail: '',
        subtitles: [],
        directLink: false,
      };
    },
    async onOnlineConfirm() {
      if (!this.online.video) return;

      const { t } = useNuxtApp().$i18n;
      const { transcodeVideo } = useTranscodeVideo();
      const title = this.online.info.title.trim();
      const duration = this.online.info.duration;
      const size =
        this.online.info.videos.find((item) => item.value === this.online.video)
          ?.size || 0;

      if (this.online.subtitle) {
        try {
          this.online.loading = true;
          this.online.text = 'Analyzing subtitle...';
          const res = await fetch(this.online.subtitle);
          const text = await res.text();
          const file = blobToFile(new Blob([text]), `${title}.srt`);
          const subData = await file2sub(file);
          this.task.offline.subtitleFile = file;
          this.task.subtitle = subData;
          this.task.option.subtitleType = 2;
          this.online.loading = false;
        } catch (error) {
          this.online.loading = false;
          errorNotify(t('create.downloadSubtitleFail'));
          throw error;
        }
      }

      if (this.isInstalled || this.online.info.directLink) {
        try {
          this.online.loading = true;
          this.online.text = `Download video...`;

          const blob = await downloadWithProgress({
            url: this.online.video,
            type: 'video/mp4',
            size: size,
            onProgress: ({ size, progress }) => {
              const text =
                progress && progress !== Infinity
                  ? `(${(progress * 100).toFixed(2)}%)`
                  : getSize(size);
              this.online.text = `Download video... ${text}`;
            },
          });

          if (blob.size <= 1024) {
            throw new Error('Invalid video size');
          }

          this.online.dialog = false;
          this.online.loading = false;
          const file = blobToFile(blob, `${Date.now()}.mp4`);

          try {
            await this.onFileChange(file);
          } catch (error) {
            console.error(error);
            const newFile = await transcodeVideo(file, duration);
            await this.onFileChange(newFile);
          }
        } catch (error) {
          this.online.loading = false;
          errorNotify(t('create.tryLater'));
          throw error;
        }
      } else {
        window.open(this.online.video, '_blank');
      }

      if (duration && duration !== Infinity) {
        this.task.offline.videoDuration = duration;
      }

      this.online.dialog = false;
      this.task.option.name = title;
      this.task.option.videoType = 2;
      useNotify({ title: 'ONLINE', task: this.task });
    },
    async onOnlineAnalyze() {
      const url = this.online.url.trim();
      if (this.online.loading) return;
      if (!/^https?:\/\//.test(url)) return;
      try {
        this.online.loading = true;
        this.online.messages = [];
        const { data } = await useDownloader(url, (message) => {
          this.online.messages.push(message);
        });
        if (data.url !== url) return;
        this.online.info = data;
        this.online.video = data.videos[0]?.value;
        this.online.subtitle = data.subtitles[0]?.value;
        this.online.loading = false;
        this.online.messages = [];
      } catch (error) {
        this.online.loading = false;
        this.online.messages = [];
        errorNotify(error.message);
        throw new Error(error.message);
      }
    },
  },
});
