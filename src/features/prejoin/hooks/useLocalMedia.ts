import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  type LocalAudioTrack,
  type LocalVideoTrack,
} from 'livekit-client';
import { toMeetingError } from '../../../lib/media/errors';
import { logger } from '../../../lib/logger';
import type { MeetingError } from '../../../types';

export interface UseLocalMediaOptions {
  cameraDeviceId: string | null;
  microphoneDeviceId: string | null;
}

export interface UseLocalMediaResult {
  videoTrack: LocalVideoTrack | null;
  audioTrack: LocalAudioTrack | null;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isCameraStarting: boolean;
  isMicrophoneStarting: boolean;
  cameraError: MeetingError | null;
  microphoneError: MeetingError | null;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
}

/**
 * Owns the local camera/microphone tracks shown on the pre-join preview.
 * Tracks are fully stopped (not just muted) when disabled, which releases
 * the hardware indicator light — the behavior users expect from a "camera
 * off" toggle before they've joined a call.
 */
export function useLocalMedia({ cameraDeviceId, microphoneDeviceId }: UseLocalMediaOptions): UseLocalMediaResult {
  const [isCameraEnabled, setCameraEnabled] = useState(true);
  const [isMicrophoneEnabled, setMicrophoneEnabled] = useState(true);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [isCameraStarting, setCameraStarting] = useState(false);
  const [isMicrophoneStarting, setMicrophoneStarting] = useState(false);
  const [cameraError, setCameraError] = useState<MeetingError | null>(null);
  const [microphoneError, setMicrophoneError] = useState<MeetingError | null>(null);

  const videoTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioTrackRef = useRef<LocalAudioTrack | null>(null);

  useEffect(() => {
    if (!isCameraEnabled) {
      videoTrackRef.current?.stop();
      videoTrackRef.current = null;
      // Pairs with the imperative track.stop() above — clearing React state
      // to match hardware we just released, not something derivable during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVideoTrack(null);
      return;
    }

    let cancelled = false;
    setCameraStarting(true);
    setCameraError(null);

    createLocalVideoTrack(cameraDeviceId ? { deviceId: cameraDeviceId } : undefined)
      .then((track) => {
        if (cancelled) {
          track.stop();
          return;
        }
        videoTrackRef.current = track;
        setVideoTrack(track);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        logger.error('useLocalMedia', 'Failed to acquire camera track', { cause });
        setCameraError(toMeetingError('camera', cause));
        setCameraEnabled(false);
      })
      .finally(() => {
        if (!cancelled) setCameraStarting(false);
      });

    return () => {
      cancelled = true;
      // Only true when this effect run had already resolved its own track
      // (e.g. the camera device changed while enabled) — an in-flight
      // promise is instead stopped by the `cancelled` check above.
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
        setVideoTrack(null);
      }
    };
  }, [isCameraEnabled, cameraDeviceId]);

  useEffect(() => {
    if (!isMicrophoneEnabled) {
      audioTrackRef.current?.stop();
      audioTrackRef.current = null;
      // Pairs with the imperative track.stop() above — clearing React state
      // to match hardware we just released, not something derivable during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAudioTrack(null);
      return;
    }

    let cancelled = false;
    setMicrophoneStarting(true);
    setMicrophoneError(null);

    createLocalAudioTrack(microphoneDeviceId ? { deviceId: microphoneDeviceId } : undefined)
      .then((track) => {
        if (cancelled) {
          track.stop();
          return;
        }
        audioTrackRef.current = track;
        setAudioTrack(track);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        logger.error('useLocalMedia', 'Failed to acquire microphone track', { cause });
        setMicrophoneError(toMeetingError('microphone', cause));
        setMicrophoneEnabled(false);
      })
      .finally(() => {
        if (!cancelled) setMicrophoneStarting(false);
      });

    return () => {
      cancelled = true;
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current = null;
        setAudioTrack(null);
      }
    };
  }, [isMicrophoneEnabled, microphoneDeviceId]);

  // Stable references — these get passed straight through to memoized
  // CameraToggle/MicrophoneToggle components as onToggle props.
  const toggleCamera = useCallback(() => setCameraEnabled((prev) => !prev), []);
  const toggleMicrophone = useCallback(() => setMicrophoneEnabled((prev) => !prev), []);

  return {
    videoTrack,
    audioTrack,
    isCameraEnabled,
    isMicrophoneEnabled,
    isCameraStarting,
    isMicrophoneStarting,
    cameraError,
    microphoneError,
    toggleCamera,
    toggleMicrophone,
  };
}
