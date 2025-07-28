import { ElNotification } from 'element-plus';

export function errorNotify(message, duration = 3000) {
  const { t } = useNuxtApp().$i18n;
  return ElNotification({
    title: t('notify.error'),
    type: 'error',
    zIndex: 9999,
    offset: 50,
    duration,
    message,
  });
}

export function successNotify(message, duration = 3000) {
  const { t } = useNuxtApp().$i18n;
  return ElNotification({
    title: t('notify.success'),
    type: 'success',
    zIndex: 9999,
    offset: 50,
    duration,
    message,
  });
}

export function warningNotify(message, duration = 3000) {
  const { t } = useNuxtApp().$i18n;
  return ElNotification({
    title: t('notify.warning'),
    type: 'warning',
    zIndex: 9999,
    offset: 50,
    duration,
    message,
  });
}
