async function checkVideoDirectLink(url) {
  try {
    const config = useAppConfig();
    const { VIDEO } = config.OPTION;
    const format = getFileFormat(url);
    const isVideoFormat = VIDEO.includes(format);
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length') || 0;
    const isLargeFile = contentLength && parseInt(contentLength) > 1048576;

    const isVideoContentType = [
      'video/',
      'application/mp4',
      'application/octet-stream',
    ].some((type) => contentType?.toLowerCase().includes(type));

    const state =
      [isVideoContentType, isVideoFormat, isLargeFile].filter(Boolean).length >
      1;

    return {
      state,
      data: {
        url,
        title: 'Video Direct Link',
        subtitles: [],
        duration: 0,
        thumbnail: '/static/images/robot-pana.svg',
        directLink: true,
        videos: [
          {
            value: url,
            ext: format,
            size: contentLength,
            label: `Video Direct Link - ${format || contentType || 'unknown'} - ${getSize(contentLength)}`,
          },
        ],
      },
    };
  } catch (error) {
    return {
      state: false,
      data: null,
      error,
    };
  }
}

export const useDownloader = async (url, onMessage) => {
  return new Promise(async (resolve, reject) => {
    onMessage('Checking video direct link...');
    const videoDirectLink = await checkVideoDirectLink(url);

    if (videoDirectLink.state) {
      return resolve({
        data: videoDirectLink.data,
      });
    }

    let isCompleted = false;

    const encode = encodeURIComponent(url);
    const BASE_URL = 'https://api.aimu.app/download';
    const eventSource = new EventSource(`${BASE_URL}/?url=${encode}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data.message);

        switch (data.status) {
          case 'complete':
            isCompleted = true;
            eventSource.close();
            resolve(data);
            break;
          case 'error':
            isCompleted = true;
            eventSource.close();
            reject(new Error(data.message || 'Download failed'));
            break;
        }
      } catch (error) {
        isCompleted = true;
        eventSource.close();
        reject(error);
      }
    };

    eventSource.onerror = () => {
      if (!isCompleted) {
        eventSource.close();
        reject(new Error('EventSource connection failed'));
      }
    };
  });
};
