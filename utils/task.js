export function isErrorSub(item) {
  const { t } = useNuxtApp().$i18n;
  const config = useAppConfig();
  const { MIN_SUB_TIME } = config.OPTION;
  const taskStore = useTaskStore();
  const index = taskStore.task.subtitle.indexOf(item);
  const previou = taskStore.task.subtitle[index - 1];
  if (previou && previou.endTime > item.startTime) {
    return t('task.overlap');
  }
  if (item?.duration < MIN_SUB_TIME) {
    return t('task.tooShort');
  }
  return '';
}

export function findIndex(startTime) {
  const taskStore = useTaskStore();
  return (
    taskStore.task.subtitle.findIndex((item, index) => {
      return (
        (startTime >= item.endTime && !taskStore.task.subtitle[index + 1]) ||
        (item.startTime <= startTime && item.endTime > startTime) ||
        (startTime >= item.endTime &&
          taskStore.task.subtitle[index + 1] &&
          startTime < taskStore.task.subtitle[index + 1].startTime)
      );
    }) + 1
  );
}
