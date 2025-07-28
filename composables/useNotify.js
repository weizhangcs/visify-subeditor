export function useNotify({ title, task }) {
  const times = useCookie('times', {
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!times.value) {
    times.value = 0;
  }

  if (title === 'CREATE') {
    times.value += 1;
  }

  const subtitleType = task.option.subtitleType;
  const duration = d2t(task.offline.videoDuration || 0, true);
  const name = task.option.name || task.offline.videoFile.name || '';
  return useFetch('/api/notify', {
    method: 'POST',
    body: {
      title,
      message: `[${times.value}][${duration}][${subtitleType}]${name}`,
    },
  });
}
