import { useEffect, type RefObject } from 'react';
import { applyAudioOutputDevice } from '../lib/media/audioOutput';

/** Applies the chosen output device to a media element whenever either changes. No-ops where setSinkId() isn't supported. */
export function useAudioSink(elementRef: RefObject<HTMLMediaElement | null>, deviceId: string | null): void {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !deviceId) return;
    void applyAudioOutputDevice(element, deviceId);
  }, [elementRef, deviceId]);
}
