<template>
  <div class="flex flex-col">
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`utils.import`) }}:
      </div>
      <div class="flex items-center gap-2">
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="subtitle.open"
          >
            <Icon name="fa-arrow-up-from-bracket" class="mr-1" />
            {{ $t(`utils.importSubtitle`) }}
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onDownload"
          >
            <Icon name="fa-download" class="mr-1" />
            {{ $t(`export.json`) }}
          </el-button>
        </div>
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`utils.offset`) }}:
      </div>
      <div class="flex items-center gap-2">
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onTimerOffset(-0.1)"
          >
            - 0.1s
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onTimerOffset(0.1)"
          >
            + 0.1s
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onTimerOffset(-1)"
          >
            - 1.0s
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onTimerOffset(1)"
          >
            + 1.0s
          </el-button>
        </div>
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`utils.replace`) }}:
      </div>
      <div class="flex items-center gap-2">
        <el-input
          v-model="input"
          :maxlength="20"
          size="small"
          clearable
          class="!w-36"
          :placeholder="$t(`utils.replaceInput`)"
        />
        <Icon name="fa-arrow-right" class="text-sm" />
        <el-input
          v-model="output"
          :maxlength="20"
          size="small"
          clearable
          class="!w-36"
          :placeholder="$t(`utils.replaceOutput`)"
        />
        <el-button
          :disabled="!input"
          color="#e47470"
          dark
          plain
          size="small"
          @click="onReplaceClick"
        >
          <Icon name="fa-right-left" class="mr-1" />
          {{ $t(`create.confirm`) }}
        </el-button>
      </div>
    </div>
    <div class="flex items-start gap-2 px-3 py-2">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`utils.batch`) }}:
      </div>
      <div class="flex flex-wrap items-start gap-2">
        <div>
          <el-button
            color="#e47470"
            dark
            plain
            size="small"
            @click="onClearClick"
          >
            {{ $t(`utils.clear`) }}
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onEmptyClick"
          >
            {{ $t(`utils.empty`) }}
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onPunctuationClick"
          >
            {{ $t(`utils.punctuation`) }}
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onSwapClick"
          >
            {{ $t(`utils.swap`) }}
          </el-button>
        </div>
        <div>
          <el-button
            color="#626aef"
            dark
            plain
            size="small"
            @click="onWrapClick"
          >
            {{ $t(`utils.wrap`) }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import clamp from 'lodash-es/clamp';

const { t } = useI18n();
const taskStore = useTaskStore();
const config = useAppConfig();
const { MIN_SUB_TIME } = config.OPTION;
const input = ref('');
const output = ref('');

const subtitle = useFileDialog({
  multiple: false,
  extensions: ['srt', 'vtt', 'ass', 'json'],
});

subtitle.onChange(async (files) => {
  if (!files?.length) return;
  const file = files[0];
  if (file) {
    const state = checkSubFormat(file);
    if (state) {
      const subData = await file2sub(file);
      taskStore.task.subtitle = subData;
    } else {
      errorNotify(t('create.formatErr'));
    }
  }
  subtitle.reset();
});

function onTimerOffset(offset) {
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    const startTime = clamp(t2d(item.start) + offset, 0, Infinity);
    const endTime = clamp(
      t2d(item.end) + offset,
      startTime + MIN_SUB_TIME,
      Infinity,
    );
    item.start = d2t(startTime);
    item.end = d2t(endTime);
  }
}

function onReplaceClick() {
  if (!input.value) return;
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    item.text = item.text.replace(new RegExp(input.value, 'g'), output.value);
    item.text2 = item.text2.replace(new RegExp(input.value, 'g'), output.value);
  }
  successNotify(t('utils.replaceSuccess'));
}

function onClearClick() {
  taskStore.task.subtitle = [];
  successNotify(t('utils.clearSuccess'));
}

function onSwapClick() {
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    const text = item.text;
    item.text = item.text2;
    item.text2 = text;
  }
  successNotify(t('utils.swapSuccess'));
}

function onEmptyClick() {
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    if (!item.text.trim() && !item.text2.trim()) {
      subtitle.splice(index, 1);
      index--;
    }
  }
  successNotify(t('utils.clearSuccess'));
}

function onPunctuationClick() {
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    item.text = item.text.replace(/[,，.。!！?？;；:：]$/, '');
    item.text2 = item.text2.replace(/[,，.。!！?？;；:：]$/, '');
  }
  successNotify(t('utils.clearSuccess'));
}

function onWrapClick() {
  const { subtitle } = taskStore.task;
  for (let index = 0; index < subtitle.length; index++) {
    const item = subtitle[index];
    if (item.text.includes('\n')) {
      const [text, ...text2] = item.text.split('\n');
      item.text = text;
      item.text2 = (text2.join('\n') + '\n' + item.text2).trim();
    }
  }
  successNotify(t('utils.wrapSuccess'));
}

function onDownload() {
  const { subtitle } = taskStore.task;
  const text = JSON.stringify(subtitle);
  const url = URL.createObjectURL(new Blob([text]));
  const name = `${taskStore.task.name || Date.now()}.json`;
  download(url, name);
}
</script>
