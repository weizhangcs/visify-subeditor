<template>
  <div
    class="relative flex flex-col transition-[height] duration-300"
    :class="toolbar ? 'h-52' : 'h-8'"
  >
    <div
      class="flex h-8 items-center justify-between border-b"
      :class="toolbar ? 'border-[#1d1e23]' : 'border-transparent'"
    >
      <div class="flex h-full items-center text-[13px]">
        <div
          class="relative flex h-full cursor-pointer items-center gap-1.5 border-r border-[#1d1e23] px-4 transition-all duration-300"
          :class="{
            'bg-[#502cab] text-white': tab === 'style',
            'text-white/70': tab !== 'style',
            active: tab === 'style' && toolbar,
          }"
          @click="onTabClick('style')"
        >
          <Icon name="fa-palette" />
          {{ $t('tool.style') }}
        </div>
        <div
          class="relative flex h-full cursor-pointer items-center gap-1.5 border-r border-[#1d1e23] px-4 transition-all duration-300"
          :class="{
            'bg-[#502cab] text-white': tab === 'utils',
            'text-white/70': tab !== 'utils',
            active: tab === 'utils' && toolbar,
          }"
          @click="onTabClick('utils')"
        >
          <Icon name="fa-screwdriver-wrench" />
          {{ $t('tool.utils') }}
        </div>
        <div
          class="relative flex h-full cursor-pointer items-center gap-1.5 border-r border-[#1d1e23] px-4 transition-all duration-300"
          :class="{
            'bg-[#502cab] text-white': tab === 'option',
            'text-white/70': tab !== 'option',
            active: tab === 'option' && toolbar,
          }"
          @click="onTabClick('option')"
        >
          <Icon name="fa-gear" />
          {{ $t('tool.option') }}
        </div>
        <div
          class="relative flex h-full cursor-pointer items-center gap-1.5 border-r border-[#1d1e23] px-4 transition-all duration-300"
          :class="{
            'bg-[#502cab] text-white': tab === 'api',
            'text-white/70': tab !== 'api',
            active: tab === 'api' && toolbar,
          }"
          @click="onTabClick('api')"
        >
          <Icon name="fa-key" />
          API
        </div>
      </div>
      <div
        class="group flex h-8 w-8 cursor-pointer items-center justify-center text-base transition duration-300 hover:bg-[#502cab]"
        @click="appStore.option.toolbar = !toolbar"
      >
        <Icon
          name="fa-chevron-down"
          class="text-white/50 transition duration-300 group-hover:scale-125 group-hover:text-white"
          :class="toolbar ? '' : 'rotate-180'"
        />
      </div>
    </div>
    <div
      class="h-0 flex-1 overflow-y-auto bg-[#4b2ea5]/10 pt-1 text-[13px] leading-none text-white/50 transition duration-300"
      :class="toolbar ? 'opacity-100' : 'opacity-0'"
    >
      <client-only>
        <el-scrollbar always height="100%">
          <ToolStyle v-if="tab === 'style'" />
          <ToolUtils v-if="tab === 'utils'" />
          <ToolOption v-if="tab === 'option'" />
          <ToolApi v-if="tab === 'api'" />
        </el-scrollbar>
      </client-only>
    </div>
  </div>
</template>

<script setup>
const appStore = useAppStore();
const tab = computed(() => appStore.option.tab);
const toolbar = computed(() => appStore.option.toolbar);

function onTabClick(tab) {
  appStore.option.tab = tab;
  appStore.option.toolbar = true;
}
</script>

<style lang="scss" scoped>
.active {
  &:after {
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    bottom: -5px;
    left: calc(50% - 5px);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #502cab;
  }
}
</style>
