import clamp from 'lodash/clamp';

export function createThumbnail({ $video, progress = () => null }) {
  return new Promise(async (resolve) => {
    if ($video.duration < 60) return resolve(null);

    try {
      const column = 10;
      const height = 90;
      const number = clamp(Math.floor($video.duration), 60, 180);
      const width = Math.floor(
        ($video.videoWidth / $video.videoHeight) * height,
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });
      canvas.width = width * column;
      canvas.height = Math.ceil(number / column) * height;
      ctx.imageSmoothingQuality = 'low';
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const screenshotDate = (() => {
        const timeGap = $video.duration / number;
        const timePoints = [timeGap];
        while (timePoints.length < number) {
          const last = timePoints[timePoints.length - 1];
          timePoints.push(last + timeGap);
        }
        return timePoints.map((item, index) => ({
          time: item - timeGap / 2,
          x: Math.floor((index % column) * width),
          y: Math.floor(index / column) * height,
        }));
      })();

      const promiseList = screenshotDate.map((item, index) => () => {
        return new Promise((resolve2) => {
          $video.oncanplay = () => {
            ctx.drawImage($video, item.x, item.y, width, height);
            progress((index + 1) / screenshotDate.length);
            $video.oncanplay = null;
            resolve2();
          };
          $video.currentTime = item.time;
        });
      });

      await runPromisesInSeries(promiseList);

      canvas.toBlob((blob) => {
        if (!blob || blob.size < 1024) return resolve(null);
        const url = URL.createObjectURL(blob);
        resolve({
          url,
          height,
          width,
          number,
          column,
        });
      });
    } catch (error) {
      resolve(null);
      throw error;
    }
  });
}

export function createHideVideo() {
  const $video = document.createElement('video');
  $video.muted = true;
  $video.style.position = 'fixed';
  $video.style.zIndex = 9999;
  $video.style.left = '0px';
  $video.style.top = '0px';
  $video.style.visibility = 'hidden';
  $video.style.pointerEvents = 'none';
  document.body.appendChild($video);
  return $video;
}

export function checkVideoHasVideo(video) {
  return Boolean(video.videoHeight) && Boolean(video.videoWidth);
}

export function checkVideoHasAudio(video) {
  return (
    video.mozHasAudio ||
    Boolean(video.webkitAudioDecodedByteCount) ||
    Boolean(video.audioTracks && video.audioTracks.length)
  );
}

export function createPosterFromVideo(video) {
  return new Promise((resolve) => {
    const $canvas = document.createElement('canvas');
    $canvas.width = video.videoWidth;
    $canvas.height = video.videoHeight;
    $canvas.getContext('2d').drawImage(video, 0, 0);
    $canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        resolve('');
      }
    });
  });
}

export function getVideoInfo(blobUrl, progress = () => null) {
  return new Promise((resolve) => {
    const $video = createHideVideo();
    $video.oncanplay = async () => {
      await sleep(1000);
      $video.oncanplay = null;
      $video.currentTime = 1;
      await sleep(1000);
      const hasAudio = checkVideoHasAudio($video);
      const hasVideo = checkVideoHasVideo($video);
      const poster = await createPosterFromVideo($video);
      const thumbnail = await createThumbnail({ $video, progress });
      resolve({
        poster,
        hasAudio,
        hasVideo,
        thumbnail,
        canPlay: true,
        duration: $video.duration,
      });
      await sleep(100);
      document.body.removeChild($video);
    };
    $video.onerror = () => {
      resolve({ canPlay: false });
      document.body.removeChild($video);
    };
    $video.src = blobUrl;
  });
}
