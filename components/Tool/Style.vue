<template>
  <div class="flex flex-col">
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`style.color`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <div class="flex items-center gap-1">
          {{ $t(`style.primaryColour`) }}
          <ToolPickr :color="PrimaryColour" @change="onPrimaryColourChange" />
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.outlineColour`) }}
          <ToolPickr :color="OutlineColour" @change="onOutlineColourChange" />
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.secondaryColour`) }}
          <ToolPickr
            :color="SecondaryColour"
            @change="onSecondaryColourChange"
          />
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.secondaryOutlineColour`) }}
          <ToolPickr
            :color="SecondaryOutlineColour"
            @change="onSecondaryOutlineColourChange"
          />
        </div>
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`style.size`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <div class="flex items-center gap-1.5">
          {{ $t(`style.fontSize`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="style.Fontsize"
              :min="14"
              :max="30"
              :step="1"
              size="small"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          {{ $t(`style.spacing`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="style.Spacing"
              :min="0"
              :max="5"
              :step="1"
              size="small"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          {{ $t(`style.marginV`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="style.MarginV"
              :min="0"
              :max="100"
              :step="1"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 border-b border-[#1d1e23]/50 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`style.shadow`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <div class="flex items-center gap-1">
          {{ $t(`style.background`) }}
          <el-switch
            v-model="style.BorderStyle"
            :active-value="4"
            :inactive-value="1"
            active-text="Y"
            inactive-text="N"
            inline-prompt
            @change="onBackColourChange"
          />
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.backColour`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="BackColour"
              :min="0"
              :max="250"
              :step="10"
              size="small"
            />
          </div>
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.Outline`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="style.Outline"
              :min="1"
              :max="3"
              :step="1"
              size="small"
            />
          </div>
        </div>
        <div v-if="style.BorderStyle === 1" class="flex items-center gap-1">
          {{ $t(`style.Shadow`) }}
          <div class="flex h-4 w-24 scale-90 items-center">
            <el-slider
              v-model="style.Shadow"
              :min="0"
              :max="3"
              :step="1"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex h-10 items-center gap-2 px-3">
      <div class="flex h-6 shrink-0 items-center text-white">
        {{ $t(`style.font`) }}:
      </div>
      <div class="flex shrink-0 items-center gap-5">
        <div class="flex items-center gap-1">
          <el-select v-model="style.Fontname" class="!w-36" size="small">
            <el-option
              v-for="font in FONTS"
              :key="font.name"
              :value="font.name"
              :label="font.type === 'cn' ? $t(`fonts.${font.name}`) : font.name"
            >
              <div :style="{ fontFamily: font.name }">
                {{ font.type === 'cn' ? $t(`fonts.${font.name}`) : font.name }}
              </div>
            </el-option>
          </el-select>
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.bold`) }}
          <el-switch
            v-model="style.Bold"
            :active-value="-1"
            :inactive-value="0"
            active-text="Y"
            inactive-text="N"
            inline-prompt
          />
        </div>
        <div class="flex items-center gap-1">
          {{ $t(`style.italic`) }}
          <el-switch
            v-model="style.Italic"
            :active-value="-1"
            :inactive-value="0"
            active-text="Y"
            inactive-text="N"
            inline-prompt
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const taskStore = useTaskStore();
const { FONTS } = useAppConfig();
const style = computed(() => taskStore.task.style);
const BackColour = ref(alphaToNum(style.value.BackColour));

const PrimaryColour = computed(() =>
  colorToHtml(readColor(style.value.PrimaryColour)),
);

const OutlineColour = computed(() =>
  colorToHtml(readColor(style.value.OutlineColour)),
);

const SecondaryColour = computed(() =>
  colorToHtml(readColor(style.value.SecondaryColour)),
);

const SecondaryOutlineColour = computed(() =>
  colorToHtml(readColor(style.value.SecondaryOutlineColour)),
);

function onPrimaryColourChange(color) {
  style.value.PrimaryColour = colorToAss(color);
}

function onOutlineColourChange(color) {
  style.value.OutlineColour = colorToAss(color);
}

function onSecondaryColourChange(color) {
  style.value.SecondaryColour = colorToAss(color);
}

function onSecondaryOutlineColourChange(color) {
  style.value.SecondaryOutlineColour = colorToAss(color);
}

function onBackColourChange() {
  const value = Number(BackColour.value).toString(16);
  style.value.BackColour = `&H${value.length === 1 ? '0' + value : value}000000`;
}

watch(() => BackColour.value, onBackColourChange);
</script>
