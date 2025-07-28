import { DEMO } from '~/config/DEMO';
import cloneDeep from 'lodash/cloneDeep';
import clamp from 'lodash/clamp';

export const useTaskStore = defineStore('task', {
  state: () => {
    return {
      wf: null,
      art: null,
      duration: 0,
      beginTime: 0,
      currentTime: 0,
      currentItem: null,
      result: null,
      task: {
        ...cloneDeep(DEMO),
        subtitle: [],
      },
      artSize: {
        height: 0,
        width: 0,
      },
    };
  },
  getters: {
    currentIndex() {
      this.beginTime;
      this.currentTime;
      return this.task.subtitle.findIndex((item) => {
        return (
          item.startTime <= this.currentTime && this.currentTime <= item.endTime
        );
      });
    },
    currentSubtitles() {
      if (this.wf) {
        this.beginTime;
        this.currentTime;
        return this.task.subtitle.filter((item) => {
          return this.wf.checkVisible(item.startTime, item.endTime);
        });
      } else {
        return [];
      }
    },
    videoHeight() {
      if (!this.art) return 0;
      const { video } = this.art;
      if (video.videoHeight > video.videoWidth) {
        return this.artSize.height;
      } else {
        return (video.videoHeight / video.videoWidth) * this.artSize.width;
      }
    },
    videoBottom() {
      if (!this.art) return 0;
      const { video } = this.art;
      if (video.videoHeight > video.videoWidth) {
        return 0;
      } else {
        return clamp((this.artSize.height - this.videoHeight) / 2, 0, Infinity);
      }
    },
  },
  actions: {
    async init() {
      this.task = this.format(DEMO);
      await nextTick();
      this.clear?.();
    },
    async create(task) {
      this.task = this.format(task);
      await nextTick();
      this.clear?.();
    },
    format(task) {
      const clone = cloneDeep(task);
      clone.subtitle = clone.subtitle.map((sub) => new Sub(sub));
      return clone;
    },
  },
});
