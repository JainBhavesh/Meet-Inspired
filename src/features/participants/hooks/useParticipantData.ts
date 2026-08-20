import { useCallback, useSyncExternalStore } from 'react';
import { useRoomManager } from '../../../lib/livekit/RoomManagerContext';
import type { ParticipantSnapshot } from '../../../lib/livekit/roomManager';

const EMPTY_SNAPSHOT: ParticipantSnapshot = {
  identity: '',
  name: '',
  isLocal: false,
  isSpeaking: false,
  isCameraEnabled: false,
  isMicrophoneEnabled: false,
  isScreenSharing: false,
  connectionQuality: 'unknown',
};

/**
 * Subscribes to exactly one participant's speaking/mic/camera state. This is
 * the hook that makes ParticipantTile independent of its siblings — a mic
 * toggle from participant A never re-renders participant B's tile.
 */
export function useParticipantData(identity: string): ParticipantSnapshot {
  const roomManager = useRoomManager();

  const subscribe = useCallback(
    (listener: () => void) => roomManager.subscribeParticipant(identity, listener),
    [roomManager, identity],
  );
  const getSnapshot = useCallback(
    () => roomManager.getParticipantSnapshot(identity) ?? EMPTY_SNAPSHOT,
    [roomManager, identity],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
