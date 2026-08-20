import { useEffect, useRef } from 'react';
import type { LocalTrack, RemoteTrack } from 'livekit-client';

type AttachableTrack = LocalTrack | RemoteTrack;

/**
 * Attaches a LiveKit track to a <video>/<audio> element for the lifetime of
 * the track reference, detaching on cleanup. Centralized here because it's
 * the one piece of imperative DOM work every video tile needs, and getting
 * the cleanup wrong is exactly how orphaned MediaStreamTracks happen.
 */
export function useTrackAttachment<T extends HTMLMediaElement>(track: AttachableTrack | null | undefined) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !track) return;

    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return elementRef;
}
