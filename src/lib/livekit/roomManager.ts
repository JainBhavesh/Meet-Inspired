import {
  ConnectionQuality,
  ConnectionState as LKConnectionState,
  Room,
  RoomEvent,
  Track,
  type AudioCaptureOptions,
  type LocalParticipant,
  type Participant as LKParticipant,
  type RemoteParticipant,
  type RoomOptions,
  type ScreenShareCaptureOptions,
  type TrackPublication,
  type VideoCaptureOptions,
} from 'livekit-client';
import { logger } from '../logger';
import {
  getCameraPublication,
  getMicrophonePublication,
  getScreenShareAudioPublication,
  getScreenSharePublication,
} from './participantHelpers';
import type { ConnectionState, Participant } from '../../types';

type Listener = () => void;

export interface ParticipantSnapshot {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: Participant['connectionQuality'];
}

export interface RoomSummary {
  connectionState: ConnectionState;
  participantIds: string[];
  screenShareParticipantId: string | null;
  error: string | null;
}

const CONNECTION_STATE_MAP: Record<LKConnectionState, ConnectionState> = {
  [LKConnectionState.Disconnected]: 'disconnected',
  [LKConnectionState.Connecting]: 'connecting',
  [LKConnectionState.Connected]: 'connected',
  [LKConnectionState.Reconnecting]: 'reconnecting',
  [LKConnectionState.SignalReconnecting]: 'reconnecting',
};

function mapConnectionQuality(quality: ConnectionQuality): Participant['connectionQuality'] {
  switch (quality) {
    case ConnectionQuality.Excellent:
      return 'excellent';
    case ConnectionQuality.Good:
      return 'good';
    case ConnectionQuality.Poor:
      return 'poor';
    default:
      return 'unknown';
  }
}

function toSnapshot(participant: LKParticipant): ParticipantSnapshot {
  return {
    identity: participant.identity,
    name: participant.name && participant.name.length > 0 ? participant.name : participant.identity,
    isLocal: participant.isLocal,
    isSpeaking: participant.isSpeaking,
    isCameraEnabled: participant.isCameraEnabled,
    isMicrophoneEnabled: participant.isMicrophoneEnabled,
    isScreenSharing: participant.isScreenShareEnabled,
    connectionQuality: mapConnectionQuality(participant.connectionQuality),
  };
}

function snapshotsEqual(a: ParticipantSnapshot, b: ParticipantSnapshot): boolean {
  return (
    a.name === b.name &&
    a.isSpeaking === b.isSpeaking &&
    a.isCameraEnabled === b.isCameraEnabled &&
    a.isMicrophoneEnabled === b.isMicrophoneEnabled &&
    a.isScreenSharing === b.isScreenSharing &&
    a.connectionQuality === b.connectionQuality
  );
}

const DEFAULT_ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
};

/**
 * Framework-agnostic wrapper around a single LiveKit `Room`. This is the
 * only place in the codebase that talks to livekit-client directly — every
 * React hook consumes it through subscribe()/subscribeParticipant(), never
 * the Room instance itself.
 *
 * Two subscription channels exist on purpose:
 *   - subscribe(): room-level facts (connection state, roster, screen share)
 *   - subscribeParticipant(id): one participant's speaking/mic/camera state
 * A tile that only cares about its own participant re-renders on its own
 * mic toggle, not on every other participant's activity — see
 * docs/PERFORMANCE.md for the reasoning.
 */
export class RoomManager {
  readonly room: Room;

  private roomListeners = new Set<Listener>();
  private participantListeners = new Map<string, Set<Listener>>();
  private participantSnapshots = new Map<string, ParticipantSnapshot>();
  private summary: RoomSummary = {
    connectionState: 'idle',
    participantIds: [],
    screenShareParticipantId: null,
    error: null,
  };
  private disposed = false;

  constructor(options: RoomOptions = DEFAULT_ROOM_OPTIONS) {
    this.room = new Room(options);
    this.bindEvents();
  }

  private bindEvents(): void {
    this.room
      .on(RoomEvent.ConnectionStateChanged, this.handleConnectionStateChanged)
      .on(RoomEvent.ParticipantConnected, this.handleRosterChanged)
      .on(RoomEvent.ParticipantDisconnected, this.handleParticipantDisconnected)
      .on(RoomEvent.LocalTrackPublished, this.handlePublicationEvent)
      .on(RoomEvent.LocalTrackUnpublished, this.handlePublicationEvent)
      .on(RoomEvent.TrackPublished, this.handlePublicationEvent)
      .on(RoomEvent.TrackUnpublished, this.handlePublicationEvent)
      .on(RoomEvent.TrackSubscribed, this.handleSubscriptionEvent)
      .on(RoomEvent.TrackUnsubscribed, this.handleSubscriptionEvent)
      .on(RoomEvent.TrackMuted, this.handlePublicationEvent)
      .on(RoomEvent.TrackUnmuted, this.handlePublicationEvent)
      .on(RoomEvent.ActiveSpeakersChanged, this.handleActiveSpeakersChanged)
      .on(RoomEvent.ConnectionQualityChanged, this.handleParticipantMetaChanged)
      .on(RoomEvent.ParticipantNameChanged, this.handleParticipantMetaChanged)
      .on(RoomEvent.Disconnected, this.handleDisconnected)
      .on(RoomEvent.MediaDevicesError, this.handleMediaDevicesError);
  }

  // ---- connection lifecycle ------------------------------------------------

  async connect(serverUrl: string, token: string): Promise<void> {
    if (this.disposed) return;
    this.setSummary({ connectionState: 'connecting', error: null });
    try {
      await this.room.connect(serverUrl, token);
      this.syncRosterFromRoom();
    } catch (cause) {
      logger.error('roomManager', 'Failed to connect to room', { cause });
      this.setSummary({
        connectionState: 'failed',
        error: cause instanceof Error ? cause.message : 'Unable to connect to the meeting.',
      });
      throw cause;
    }
  }

  async disconnect(): Promise<void> {
    if (this.disposed) return;
    await this.room.disconnect(true);
  }

  /** Releases all listeners. Call once the owning component unmounts for good. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const shouldDisconnect = this.room.state !== LKConnectionState.Disconnected;
    // Detach before disconnecting so a synchronous 'disconnected' emission
    // from the underlying Room can never reach an external subscriber —
    // no listener (ours or the caller's) is still attached by the time it fires.
    this.room.removeAllListeners();
    this.roomListeners.clear();
    this.participantListeners.clear();
    if (shouldDisconnect) {
      this.room.disconnect(true).catch((cause) => {
        logger.error('roomManager', 'Failed to disconnect during dispose', { cause });
      });
    }
  }

  // ---- local participant actions -------------------------------------------

  async setCameraEnabled(enabled: boolean, options?: VideoCaptureOptions): Promise<void> {
    await this.room.localParticipant.setCameraEnabled(enabled, options);
  }

  async setMicrophoneEnabled(enabled: boolean, options?: AudioCaptureOptions): Promise<void> {
    await this.room.localParticipant.setMicrophoneEnabled(enabled, options);
  }

  async setScreenShareEnabled(enabled: boolean, options?: ScreenShareCaptureOptions): Promise<void> {
    await this.room.localParticipant.setScreenShareEnabled(enabled, options ?? { audio: true });
  }

  get localParticipant(): LocalParticipant {
    return this.room.localParticipant;
  }

  // ---- subscriptions ---------------------------------------------------

  subscribe = (listener: Listener): (() => void) => {
    this.roomListeners.add(listener);
    return () => this.roomListeners.delete(listener);
  };

  getSummary = (): RoomSummary => this.summary;

  subscribeParticipant = (identity: string, listener: Listener): (() => void) => {
    let set = this.participantListeners.get(identity);
    if (!set) {
      set = new Set();
      this.participantListeners.set(identity, set);
    }
    set.add(listener);
    return () => set?.delete(listener);
  };

  getParticipantSnapshot = (identity: string): ParticipantSnapshot | undefined =>
    this.participantSnapshots.get(identity);

  // ---- track access (read fresh at render time, not part of the reactive snapshot) ----

  getCameraTrack(identity: string) {
    const participant = this.findParticipant(identity);
    return participant ? getCameraPublication(participant)?.videoTrack : undefined;
  }

  getMicrophoneTrack(identity: string) {
    const participant = this.findParticipant(identity);
    return participant ? getMicrophonePublication(participant)?.audioTrack : undefined;
  }

  getScreenShareTrack(identity: string) {
    const participant = this.findParticipant(identity);
    return participant ? getScreenSharePublication(participant)?.videoTrack : undefined;
  }

  getScreenShareAudioTrack(identity: string) {
    const participant = this.findParticipant(identity);
    return participant ? getScreenShareAudioPublication(participant)?.audioTrack : undefined;
  }

  // ---- internal event handlers ------------------------------------------

  private handleConnectionStateChanged = (state: LKConnectionState): void => {
    this.setSummary({ connectionState: CONNECTION_STATE_MAP[state] });
  };

  private handleDisconnected = (): void => {
    this.setSummary({ connectionState: 'disconnected', participantIds: [], screenShareParticipantId: null });
    this.participantSnapshots.clear();
  };

  private handleMediaDevicesError = (cause: Error): void => {
    logger.error('roomManager', 'Media device error', { cause });
    this.setSummary({ error: cause.message });
  };

  private handleRosterChanged = (): void => {
    this.syncRosterFromRoom();
  };

  private handleParticipantDisconnected = (participant: RemoteParticipant): void => {
    this.participantSnapshots.delete(participant.identity);
    this.participantListeners.delete(participant.identity);
    this.syncRosterFromRoom();
  };

  /** Shared by TrackPublished/Unpublished, TrackMuted/Unmuted, LocalTrackPublished/Unpublished — all fire as (publication, participant). */
  private handlePublicationEvent = (publication: TrackPublication, participant: LKParticipant): void => {
    this.onTrackEvent(publication, participant);
  };

  /** TrackSubscribed/Unsubscribed fire as (track, publication, participant). */
  private handleSubscriptionEvent = (
    _track: Track,
    publication: TrackPublication,
    participant: LKParticipant,
  ): void => {
    this.onTrackEvent(publication, participant);
  };

  /**
   * Track publish/subscribe events must always notify, even when none of
   * the compared snapshot fields change — e.g. TrackPublished can flip
   * isCameraEnabled to true while the actual MediaStreamTrack only becomes
   * attachable later on TrackSubscribed. Skipping that second notification
   * via the equality check would leave the tile's <video> without a track
   * to attach until some unrelated state change happened to re-render it.
   */
  private onTrackEvent(publication: TrackPublication, participant: LKParticipant): void {
    this.participantSnapshots.set(participant.identity, toSnapshot(participant));
    this.notifyParticipant(participant.identity);
    if (publication.source === Track.Source.ScreenShare) {
      this.recomputeScreenShare();
    }
  }

  private handleParticipantMetaChanged = (_arg: unknown, participant: LKParticipant): void => {
    this.participantSnapshots.set(participant.identity, toSnapshot(participant));
    this.notifyParticipant(participant.identity);
  };

  private handleActiveSpeakersChanged = (speakers: LKParticipant[]): void => {
    const speakingIds = new Set(speakers.map((s) => s.identity));
    for (const identity of this.participantSnapshots.keys()) {
      const participant = this.findParticipant(identity);
      if (participant) this.refreshParticipant(participant, speakingIds.has(identity));
    }
  };

  // ---- helpers -----------------------------------------------------------

  private findParticipant(identity: string): LKParticipant | undefined {
    if (this.room.localParticipant.identity === identity) return this.room.localParticipant;
    return this.room.remoteParticipants.get(identity);
  }

  private syncRosterFromRoom(): void {
    const all: LKParticipant[] = [this.room.localParticipant, ...this.room.remoteParticipants.values()];
    for (const participant of all) {
      this.refreshParticipant(participant, undefined, /* silent */ true);
    }
    const participantIds = all.map((p) => p.identity);
    this.recomputeScreenShare();
    this.setSummary({ participantIds });
  }

  private recomputeScreenShare(): void {
    const all: LKParticipant[] = [this.room.localParticipant, ...this.room.remoteParticipants.values()];
    const sharer = all.find((p) => p.isScreenShareEnabled);
    this.setSummary({ screenShareParticipantId: sharer?.identity ?? null });
  }

  private refreshParticipant(participant: LKParticipant, speakingOverride?: boolean, silent = false): void {
    const next = toSnapshot(participant);
    if (speakingOverride !== undefined) next.isSpeaking = speakingOverride;
    const prev = this.participantSnapshots.get(participant.identity);
    if (prev && snapshotsEqual(prev, next)) return;
    this.participantSnapshots.set(participant.identity, next);
    if (!silent) this.notifyParticipant(participant.identity);
  }

  private setSummary(patch: Partial<RoomSummary>): void {
    const next = { ...this.summary, ...patch };
    const changed =
      next.connectionState !== this.summary.connectionState ||
      next.error !== this.summary.error ||
      next.screenShareParticipantId !== this.summary.screenShareParticipantId ||
      next.participantIds.length !== this.summary.participantIds.length ||
      next.participantIds.some((id, i) => id !== this.summary.participantIds[i]);
    this.summary = next;
    if (changed) this.notifyRoom();
  }

  private notifyRoom(): void {
    this.roomListeners.forEach((listener) => listener());
  }

  private notifyParticipant(identity: string): void {
    this.participantListeners.get(identity)?.forEach((listener) => listener());
  }
}
