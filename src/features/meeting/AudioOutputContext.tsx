import { createContext, useContext } from 'react';

/**
 * The speaker device chosen on the pre-join screen, threaded down to every
 * remote audio element for the life of the call. A plain Context is the
 * right tool here (as opposed to RoomManager's pub-sub) — this value is set
 * once at join time and never changes, so it causes no re-renders of its own.
 */
export const AudioOutputContext = createContext<string | null>(null);

export function useAudioOutputDeviceId(): string | null {
  return useContext(AudioOutputContext);
}
