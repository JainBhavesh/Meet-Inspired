import { useRoomManager } from '../../../lib/livekit/RoomManagerContext';
import { useParticipantData } from './useParticipantData';
import type { ParticipantSnapshot } from '../../../lib/livekit/roomManager';

export function useLocalParticipantData(): ParticipantSnapshot {
  const roomManager = useRoomManager();
  return useParticipantData(roomManager.localParticipant.identity);
}
