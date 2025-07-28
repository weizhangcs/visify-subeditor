<template>
  <el-dropdown @command="onChange">
    <div>
      <HeaderKey>
        <Icon name="fa-language" />
      </HeaderKey>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in I18N"
          :key="item.key"
          :command="item.key"
        >
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
const { setLocale } = useI18n();
const appStore = useAppStore();
const { I18N } = useAppConfig();

function onChange(lang) {
  setLocale(lang);
  appStore.option.i18n = lang;
}
</script>
