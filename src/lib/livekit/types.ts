import type { ConnectionState, Participant } from '../../types';

export interface TokenRequest {
  roomName: string;
  participantName: string;
}

export interface TokenResponse {
  token: string;
  serverUrl: string;
}

/** Snapshot of everything the UI needs, published by RoomManager on every relevant LiveKit event. */
export interface RoomSnapshot {
  connectionState: ConnectionState;
  participants: Participant[];
  activeSpeakerIds: Set<string>;
  screenShareParticipantId: string | null;
  error: string | null;
}

export type RoomSnapshotListener = (snapshot: RoomSnapshot) => void;
