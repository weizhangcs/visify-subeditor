<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();

const handleReturn = () => {
  const returnUrl = route.query.returnUrl;
  if (returnUrl) {
    // 如果URL中提供了返回地址，则跳转到该地址
    window.location.href = decodeURIComponent(returnUrl);
  } else {
    // 否则，作为备用方案，关闭当前窗口
    window.close();
  }
};
</script>

<template>
  <div class="flex items-center">
    <el-button :loading="isSaving" type="primary" dark @click="handleReturn">
      <Icon name="fa-reply" class="mr-2 text-xs" />
      {{ $t('header.returnToWorkbench') }}
    </el-button>
  </div>
</template>
