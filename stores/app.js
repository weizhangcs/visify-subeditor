export const useAppStore = defineStore('app', {
  state: () => {
    return {
      popup: {
        help: false,
        create: false,
        export: false,
        keyboard: false,
      },
      ffmpeg: {
        id: null,
        enable: false,
        ready: false,
        silence: false,
        progress: 0,
      },
      option: {
        tab: 'style',
        tooltip: true,
        toolbar: true,
        autoAlign: true,
        i18n: 'zh-CN',
        splitX: 0.5,
        ...(useCookie('option').value || {}),
      },
    };
  },
});
