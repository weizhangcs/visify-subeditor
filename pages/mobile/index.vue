<template>
  <NuxtLayout>
    <Head>
      <Title>{{ $t('title') }}</Title>
      <Meta name="description" :content="$t('description')" />
      <Meta name="keywords" :content="$t('keywords')" />
      <Meta property="og:title" :content="$t('title')" />
      <Meta property="og:description" :content="$t('description')" />
      <Meta property="og:image" :content="`${baseUrl}/logo.png`" />
      <Meta property="og:url" :content="baseUrl" />
      <Meta property="og:type" content="subtitle" />
      <Meta property="og:site_name" :content="$t('title')" />
      <Meta property="og:locale" content="en" />
      <Link rel="canonical" :href="baseUrl" />
    </Head>
    <div class="flex h-screen flex-col overflow-hidden bg-[#0e0e0e] px-4">
      <div
        class="flex h-0 flex-1 flex-col items-center justify-center gap-4 font-thin"
      >
        <div class="text-4xl leading-none">
          {{ $t(`error.mobile`) }}
        </div>
        <div class="text-xl leading-none">
          {{ $t(`error.mobileTip`) }}
        </div>
        <div class="text-base leading-none" />
        <img
          src="/static/images/robot-pana.svg"
          class="pointer-events-none max-w-96"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const { isMobile } = useDevice();
const baseUrl = getBaseUrl();
if (!isMobile) navigateTo('/');
</script>
