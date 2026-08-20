import { createContext, useContext } from 'react';
import type { RoomManager } from './roomManager';

/**
 * Holds a single RoomManager instance for the lifetime of a meeting. The
 * instance reference never changes while connected, so putting it in
 * Context causes zero re-renders on its own — all reactivity is driven by
 * RoomManager's own subscribe()/subscribeParticipant() pub-sub, consumed via
 * useSyncExternalStore in the hooks that read from it.
 */
export const RoomManagerContext = createContext<RoomManager | null>(null);

export function useRoomManager(): RoomManager {
  const manager = useContext(RoomManagerContext);
  if (!manager) {
    throw new Error('useRoomManager must be used within a RoomManagerContext.Provider');
  }
  return manager;
}
