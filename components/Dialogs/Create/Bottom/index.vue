<template>
  <div class="flex items-center gap-1">
    <el-button
      plain
      :dark="true"
      size="large"
      @click="appStore.popup.create = false"
    >
      <Icon name="fa-xmark" class="mr-2 text-xs" />
      {{ $t('create.cancel') }}
    </el-button>
    <el-button plain :dark="true" size="large" @click="createStore.$reset()">
      <Icon name="fa-broom-wide" class="mr-2 text-xs" />
      {{ $t('create.reset') }}
    </el-button>
  </div>
  <div class="flex items-center gap-4">
    <a :href="sponsorUrl" target="_blank">
      <el-button type="danger" plain size="large">
        <Icon name="fa-heart" class="mr-2 text-sm" />
        {{ $t('create.sponsor') }}
      </el-button>
    </a>
    <el-button
      color="#3662e3"
      :dark="true"
      size="large"
      :disabled="createStore.analyzing"
      @click="onSubmit"
    >
      <Icon name="fa-rocket-launch" class="mr-2 text-sm" />
      {{ $t('create.confirm') }}
    </el-button>
  </div>
</template>

<script setup>
import { ElLoading } from 'element-plus';

const { t } = useI18n();
const config = useAppConfig();
const appStore = useAppStore();
const taskStore = useTaskStore();
const createStore = useCreateStore();
const { extractAudio } = useExtractAudio();
const { transcribeAudio } = useTranscribeAudio();
const { language } = useNavigatorLanguage();

const sponsorUrl = computed(() => {
  const sponsor = {
    CNY: 'https://buy.stripe.com/6oE02a8aR5N65SE28d',
    USD: 'https://buy.stripe.com/bIYeX4fDjcbu3Kw14a',
  };
  if (language.value?.startsWith('zh')) {
    return sponsor.CNY;
  } else {
    return sponsor.USD;
  }
});

async function separateAudio() {
  const task = createStore.task;
  const audio =
    task.offline.audioFile ||
    (await extractAudio(task.offline.videoFile, task.option.name));
  task.offline.audioFile = audio;
  task.offline.audioBlobUrl = URL.createObjectURL(audio);
  return audio;
}

async function onSubmit() {
  const task = createStore.task;

  if (!createStore.uploaded) {
    return errorNotify(t('create.selectVideo'));
  }

  if (task.option.subtitleType === 2 && !task.offline.subtitleFile) {
    return errorNotify(t('create.selectSubtitle'));
  }

  if (task.option.subtitleType !== 2) {
    task.subtitle = [];
  }

  if (task.offline.canPlay === false) {
    return errorNotify(t('create.videoNotPlay'));
  }

  if (task.option.subtitleType === 1) {
    if (
      !task.offline.videoDuration ||
      task.offline.videoDuration === Infinity ||
      task.offline.videoDuration > config.OPTION.MAX_STT_DURATION
    ) {
      if (!appStore.option.openaiApiKey) {
        return errorNotify(t('create.sttDurationTooLong'));
      }
    }

    const loading = ElLoading.service({
      lock: true,
      customClass: '!z-[9999]',
      text: t('create.audioTranscribing'),
      background: 'rgba(0, 0, 0, 0.7)',
    });

    try {
      const audio = await separateAudio();
      task.subtitle = await transcribeAudio(audio);
      loading.close();
    } catch (error) {
      loading.close();
      errorNotify(error.message);
      throw error;
    }
  }

  taskStore.create(task);
  appStore.popup.create = false;
  useNotify({ title: 'CREATE', task });
  createStore.$reset();
  successNotify(t('create.createSuccess'));
}
</script>
