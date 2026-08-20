import { useSyncExternalStore } from 'react';
import { useRoomManager } from '../../../lib/livekit/RoomManagerContext';
import type { RoomSummary } from '../../../lib/livekit/roomManager';

/** Room-level facts: connection state, roster membership, screen share, last error. */
export function useRoomSummary(): RoomSummary {
  const roomManager = useRoomManager();
  return useSyncExternalStore(roomManager.subscribe, roomManager.getSummary, roomManager.getSummary);
}
