<template>
  <NuxtLayout>
    <div class="flex h-screen flex-col overflow-hidden bg-black px-4">
      <div
        class="flex h-0 flex-1 flex-col items-center justify-center gap-4 font-thin"
      >
        <div class="mb-4 text-4xl leading-none">
          {{ $t(`error.title`) }}
        </div>
        <div class="text-2xl leading-none">
          {{ error.statusCode }}
        </div>
        <div class="text-base leading-none text-red-600">
          {{ error.message }}
        </div>
        <img
          src="/static/images/robot-pana.svg"
          class="pointer-events-none max-w-96"
        />
        <el-button color="#626aef" dark plain @click="handleError">
          {{ $t(`error.goHome`) }}
        </el-button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const handleError = () => clearError({ redirect: '/' });
</script>
