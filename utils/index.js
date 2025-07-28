import DT from 'duration-time-conversion';
import { filesize } from 'filesize';

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export function t2d(time) {
  return DT.t2d(time);
}

export function d2t(duration, trim) {
  if (trim) {
    return DT.d2t(duration).split('.')[0];
  } else {
    return DT.d2t(duration);
  }
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSize(size) {
  if (!size) return 'N/A';
  return filesize(size, { base: 10, standard: 'jedec' });
}

export function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function download(url, name) {
  const elink = document.createElement('a');
  elink.style.display = 'none';
  elink.href = url;
  elink.download = name;
  document.body.appendChild(elink);
  elink.click();
  document.body.removeChild(elink);
}

export function getKeyCode(event) {
  const tag = document.activeElement.tagName.toUpperCase();
  const editable = document.activeElement.getAttribute('contenteditable');
  if (
    tag !== 'INPUT' &&
    tag !== 'TEXTAREA' &&
    editable !== '' &&
    editable !== 'true'
  ) {
    return event.code;
  }
}

export function runPromisesInSeries(ps) {
  return ps.reduce((p, next) => p.then(next), Promise.resolve());
}

export function fileToBlobUrl(file) {
  return URL.createObjectURL(new Blob([file]));
}

export function getFileFormat(name) {
  return name.trim().toLowerCase().split('.').pop();
}

export function checkSubFormat(file) {
  const config = useAppConfig();
  const { SUBTITLE } = config.OPTION;
  const format = getFileFormat(file.name);
  return SUBTITLE.includes(format);
}

export function checkVideoFormat(file) {
  const config = useAppConfig();
  const { VIDEO } = config.OPTION;
  const format = getFileFormat(file.name);
  return VIDEO.includes(format);
}

export const blobToFile = (theBlob, fileName) => {
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  return theBlob;
};

export function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function () {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

export function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  var sliceSize = 1024;
  var byteCharacters = atob(base64Data);
  var bytesLength = byteCharacters.length;
  var slicesCount = Math.ceil(bytesLength / sliceSize);
  var byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    var begin = sliceIndex * sliceSize;
    var end = Math.min(begin + sliceSize, bytesLength);

    var bytes = new Array(end - begin);
    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

export async function downloadWithProgress({
  url,
  size = 0,
  type = '',
  onProgress,
}) {
  const response = await fetch(url);
  const contentLength = size || response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : null;

  const reader = response.body.getReader();
  let receivedLength = 0;
  let chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    receivedLength += value.length;
    onProgress({ size: receivedLength, progress: receivedLength / total });
  }

  let chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  return new Blob([chunksAll], { type });
}

export async function createBase64FromFile(file) {
  if (file instanceof File || file instanceof Blob) {
    return {
      type: file.type,
      ext: getFileFormat(file.name),
      base64: await blobToBase64(new Blob([file])),
    };
  } else {
    return null;
  }
}

export function createFileFromBase64({ base64, type, ext }) {
  return new File([base64toBlob(base64, type)], `${Date.now()}.${ext}`);
}

export const getBaseUrl = () => {
  if (import.meta.client) {
    return window.location.origin;
  }
  const url = useRequestURL();
  return url.origin || '';
};

export function checkIsolated() {
  if (import.meta.client) {
    return window.crossOriginIsolated && window.isSecureContext;
  }
  return false;
}

export function openFFmpegPage({ id }) {
  const appStore = useAppStore();
  if (checkIsolated()) {
    appStore.ffmpeg.id = id;
    appStore.ffmpeg.enable = true;
  } else {
    window.open(`${getBaseUrl()}/ffmpeg?id=${id}`, '_blank', 'noopener');
  }
}

export function closeFFmpegPage() {
  const appStore = useAppStore();
  appStore.ffmpeg.id = null;
  appStore.ffmpeg.progress = 0;
  appStore.ffmpeg.enable = false;
  appStore.ffmpeg.ready = false;
  appStore.ffmpeg.silence = false;
}
