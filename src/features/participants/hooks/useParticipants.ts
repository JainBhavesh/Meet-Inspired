import { useRoomSummary } from '../../meeting/hooks/useRoomSummary';

export interface UseParticipantsResult {
  participantIds: string[];
  screenShareParticipantId: string | null;
}

/** Roster + screen-share membership only — never per-participant media state, so a mic toggle elsewhere doesn't re-render this. */
export function useParticipants(): UseParticipantsResult {
  const { participantIds, screenShareParticipantId } = useRoomSummary();
  return { participantIds, screenShareParticipantId };
}
