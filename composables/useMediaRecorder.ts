import {
  register,
  MediaRecorder as ExtendableMediaRecorder,
  type IMediaRecorder,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

type ReactMediaRecorderRenderProps = {
  muteAudio: () => void;
  unMuteAudio: () => void;
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  mediaBlobUrl: Ref<string | undefined>;
  status: Ref<StatusMessages>;
  isAudioMuted: Ref<boolean>;
  previewStream: MediaStream | null;
  previewAudioStream: MediaStream | null;
  clearBlobUrl: () => void;
};

type ReactMediaRecorderHookProps = {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
  screen?: boolean;
  onStop?: (blobUrl: string, blob: Blob) => void;
  onStart?: (
    stream: ReactMediaRecorderRenderProps['previewAudioStream'],
  ) => void;
  onError?: (message: string) => void;
  blobPropertyBag?: BlobPropertyBag;
  mediaRecorderOptions?: MediaRecorderOptions | undefined;
  customMediaStream?: MediaStream | null;
  stopStreamsOnStop?: boolean;
  askPermissionOnMount?: boolean;
};

type StatusMessages =
  | 'media_aborted'
  | 'permission_denied'
  | 'no_specified_media_found'
  | 'media_in_use'
  | 'invalid_media_constraints'
  | 'no_constraints'
  | 'recorder_error'
  | 'idle'
  | 'acquiring_media'
  | 'delayed_start'
  | 'recording'
  | 'stopping'
  | 'stopped'
  | 'paused';

enum RecorderErrors {
  AbortError = 'media_aborted',
  NotAllowedError = 'permission_denied',
  NotFoundError = 'no_specified_media_found',
  NotReadableError = 'media_in_use',
  OverconstrainedError = 'invalid_media_constraints',
  TypeError = 'no_constraints',
  NONE = '',
  NO_RECORDER = 'recorder_error',
}

export default function useMediaRecorder({
  audio = true,
  video = false,
  onStop = () => null,
  onStart = () => null,
  onError = (message: String) => null,
  blobPropertyBag,
  screen = false,
  mediaRecorderOptions = undefined,
  customMediaStream = null,
  stopStreamsOnStop = true,
  askPermissionOnMount = false,
}: ReactMediaRecorderHookProps): ReactMediaRecorderRenderProps {
  const mediaRecorder = ref<IMediaRecorder | null>(null);
  const mediaChunks = ref<Blob[]>([]);
  const mediaStream = ref<MediaStream | null>(null);
  const status = ref<StatusMessages>('idle');
  const isAudioMuted = ref<boolean>(false);
  const mediaBlobUrl = ref<string | undefined>(undefined);
  const error = ref<keyof typeof RecorderErrors>('NONE');
  const init = ref(false);

  onMounted(() => {
    if (init.value) {
      return;
    }

    const setup = async () => {
      try {
        await register(await connect());
      } catch (e) {
        //
      }
    };

    setup();
    init.value = true;
  });

  const getMediaStream = async () => {
    status.value = 'acquiring_media';
    const requiredMedia: MediaStreamConstraints = {
      audio: typeof audio === 'boolean' ? !!audio : audio,
      video: typeof video === 'boolean' ? !!video : video,
    };
    try {
      if (customMediaStream) {
        mediaStream.value = customMediaStream;
      } else if (screen) {
        const stream = (await window.navigator.mediaDevices.getDisplayMedia({
          video: video || true,
          audio: audio || true,
        })) as MediaStream;
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopRecording();
        });
        if (audio) {
          const audioStream = await window.navigator.mediaDevices.getUserMedia({
            audio,
          });

          audioStream
            .getAudioTracks()
            .forEach((audioTrack) => stream.addTrack(audioTrack));
        }
        mediaStream.value = stream;
      } else {
        const stream =
          await window.navigator.mediaDevices.getUserMedia(requiredMedia);
        mediaStream.value = stream;
      }
      status.value = 'idle';
    } catch (error: any) {
      error.value = error.name;
      status.value = 'idle';
    }
  };

  watchEffect((onCleanup: Function) => {
    if (!window.MediaRecorder) {
      throw new Error('Unsupported Browser');
    }

    if (screen) {
      if (!window.navigator.mediaDevices.getDisplayMedia) {
        throw new Error("This browser doesn't support screen capturing");
      }
    }

    const checkConstraints = (mediaType: MediaTrackConstraints) => {
      const supportedMediaConstraints =
        navigator.mediaDevices.getSupportedConstraints();
      const unSupportedConstraints = Object.keys(mediaType).filter(
        (constraint) =>
          !(supportedMediaConstraints as { [key: string]: any })[constraint],
      );

      if (unSupportedConstraints.length > 0) {
        console.error(
          `The constraints ${unSupportedConstraints.join(
            ',',
          )} doesn't support on this browser. Please check your ReactMediaRecorder component.`,
        );
      }
    };

    if (typeof audio === 'object') {
      checkConstraints(audio);
    }

    if (typeof video === 'object') {
      checkConstraints(video);
    }

    if (mediaRecorderOptions && mediaRecorderOptions.mimeType) {
      if (!MediaRecorder.isTypeSupported(mediaRecorderOptions.mimeType)) {
        console.error(
          `The specified MIME type you supplied for MediaRecorder doesn't support this browser`,
        );
      }
    }

    if (!mediaStream.value && askPermissionOnMount) {
      getMediaStream();
    }

    onCleanup(() => {
      if (mediaStream.value) {
        const tracks = mediaStream.value.getTracks();
        tracks.forEach((track: any) => track.clone().stop());
      }
    });
  });

  watch(error, () => {
    if (onError) {
      onError(RecorderErrors[error.value]);
    }
  });

  // Media Recorder Handlers

  const startRecording = async () => {
    error.value = 'NONE';
    if (!mediaStream.value) {
      await getMediaStream();
    }
    if (mediaStream.value) {
      const isStreamEnded = mediaStream.value
        .getTracks()
        .some((track: any) => track.readyState === 'ended');
      if (isStreamEnded) {
        await getMediaStream();
      }

      // User blocked the permissions (getMediaStream errored out)
      if (!mediaStream.value.active) {
        return;
      }
      mediaRecorder.value = new ExtendableMediaRecorder(
        mediaStream.value,
        mediaRecorderOptions || undefined,
      );
      mediaRecorder.value.ondataavailable = onRecordingActive;
      mediaRecorder.value.onstop = onRecordingStop;
      mediaRecorder.value.onstart = onRecordingStart;
      mediaRecorder.value.onerror = () => {
        error.value = 'NO_RECORDER';
        status.value = 'idle';
      };
      mediaRecorder.value.start();
      status.value = 'recording';
    } else {
      error.value = 'NotFoundError';
    }
  };

  const onRecordingActive = ({ data }: BlobEvent) => {
    mediaChunks.value.push(data);
  };

  const onRecordingStart = () => {
    const previewStream = mediaStream.value
      ? new MediaStream(mediaStream.value.getVideoTracks())
      : null;
    onStart(previewStream);
  };

  const onRecordingStop = () => {
    const [chunk] = mediaChunks.value;
    const blobProperty: BlobPropertyBag = Object.assign(
      { type: chunk.type },
      blobPropertyBag ||
        (video ? { type: 'video/mp4' } : { type: 'audio/wav' }),
    );
    const blob = new Blob(mediaChunks.value, blobProperty);
    const url = URL.createObjectURL(blob);
    status.value = 'stopped';
    mediaBlobUrl.value = url;
    onStop(url, blob);
  };

  const muteAudio = (mute: boolean) => {
    isAudioMuted.value = mute;
    if (mediaStream.value) {
      mediaStream.value
        .getAudioTracks()
        .forEach((audioTrack: any) => (audioTrack.enabled = !mute));
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      status.value = 'paused';
      mediaRecorder.value.pause();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.value && mediaRecorder.value.state === 'paused') {
      status.value = 'recording';
      mediaRecorder.value.resume();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.value) {
      if (mediaRecorder.value.state !== 'inactive') {
        status.value = 'stopping';
        mediaRecorder.value.stop();
        if (stopStreamsOnStop) {
          mediaStream.value &&
            mediaStream.value.getTracks().forEach((track: any) => track.stop());
        }
        mediaChunks.value = [];
      }
    }
  };

  return {
    muteAudio: () => muteAudio(true),
    unMuteAudio: () => muteAudio(false),
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    mediaBlobUrl,
    status,
    isAudioMuted,
    previewStream: mediaStream.value
      ? new MediaStream(mediaStream.value.getVideoTracks())
      : null,
    previewAudioStream: mediaStream.value
      ? new MediaStream(mediaStream.value.getAudioTracks())
      : null,
    clearBlobUrl: () => {
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl.value || '');
      }
      mediaBlobUrl.value = undefined;
      status.value = 'idle';
    },
  };
}
