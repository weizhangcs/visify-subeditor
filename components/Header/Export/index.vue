<template>
  <div class="flex items-center">
    <el-button :loading="isSaving" type="primary" dark @click="saveToDjango">
      <Icon name="fa-save" class="mr-2 text-xs" />
      {{ $t('header.saveToDjango') }}
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTaskStore } from '~/stores/task';
import { useI18n } from 'vue-i18n';
import { sub2ass } from '~/utils/subtitle';
import { ElNotification } from 'element-plus';

const taskStore = useTaskStore();
const { t } = useI18n();
const isSaving = ref(false);

// 从 Cookie 中获取 CSRF Token 的辅助函数
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function saveToDjango() {
  isSaving.value = true;
  try {
    // 1. 获取 assetId
    const params = new URLSearchParams(window.location.search);
    const assetId = params.get('assetId');
    if (!assetId) {
      throw new Error('Asset ID not found in URL.');
    }

    // 2. 生成 .ass 内容
    const assContent = sub2ass(taskStore.task);

    // 3. 构建并发送 API 请求
    const djangoApiUrl = `http://localhost:8000/integrations/ls/asset/${assetId}/save-l1-output/`;
    const csrftoken = getCookie('csrftoken'); // 获取 CSRF Token

    const response = await fetch(djangoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8', // <-- 修正拼写错误
        'X-CSRFToken': csrftoken, // <-- 增加 CSRF Token
      },
      body: assContent,
    });

    if (!response.ok) {
      // 尝试解析JSON错误信息，如果失败则使用通用的状态文本
      let errorMessage = `HTTP error! status: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 响应不是JSON，保持原始错误信息
      }
      throw new Error(errorMessage);
    }

    // 4. 用户反馈
    ElNotification({
      title: '成功',
      message: t('header.saveSuccess') || '保存成功！',
      type: 'success',
    });
  } catch (error) {
    console.error('Save to Django failed:', error);
    ElNotification({ title: '失败', message: error.message, type: 'error' });
  } finally {
    isSaving.value = false;
  }
}
</script>
