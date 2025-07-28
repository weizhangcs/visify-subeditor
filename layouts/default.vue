<template>
  <slot />
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const createStore = useCreateStore();
const option = useCookie('option');
const { language } = useNavigatorLanguage();
const { locale, setLocale, availableLocales } = useI18n();

if (option.value?.i18n) {
  locale.value = option.value.i18n;
}

function checkFontSize() {
  const { width } = useWindowSize();
  if (width.value > 1920 && typeof document !== 'undefined') {
    document.documentElement.style.fontSize = '20px';
  } else {
    document.documentElement.style.fontSize = '';
  }
}

function setDefaultLanguage() {
  if (
    language.value &&
    !option.value?.i18n &&
    availableLocales.includes(language.value) &&
    language.value !== locale.value
  ) {
    setLocale(language.value);
    appStore.option.i18n = language.value;
    option.value = appStore.option;
  }
}

function checkUrl() {
  const { url } = route.query;
  if (!url) return;
  appStore.popup.create = true;
  createStore.online.dialog = true;
  createStore.online.url = url;
  createStore.onOnlineAnalyze();
  router.replace({ query: {} });
}

onMounted(() => {
  checkUrl();
  checkFontSize();
  setDefaultLanguage();
  useEventListener(window, 'resize', checkFontSize);
});
</script>
