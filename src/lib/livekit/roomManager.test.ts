import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * livekit-client talks to real WebRTC APIs the moment it's imported for
 * real, which don't exist under jsdom. RoomManager is designed so that
 * livekit-client is the only thing it depends on — mocking the module here
 * (Room plus the plain string enums it reads) is enough to exercise the
 * entire event-driven state machine without a real connection. See
 * docs/PERFORMANCE.md and docs/LIVEKIT.md for why the class is shaped this way.
 *
 * A minimal hand-rolled emitter stands in for Node's EventEmitter (which
 * `Room` extends for real) — enough for `.on()`/`.emit()`, without pulling
 * Node's type declarations into a browser app's tsconfig just for a test.
 */
class MiniEmitter {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  on(event: string, handler: (...args: unknown[]) => void): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler);
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((handler) => handler(...args));
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
const RoomEvent = {
  ConnectionStateChanged: 'connectionStateChanged',
  ParticipantConnected: 'participantConnected',
  ParticipantDisconnected: 'participantDisconnected',
  LocalTrackPublished: 'localTrackPublished',
  LocalTrackUnpublished: 'localTrackUnpublished',
  TrackPublished: 'trackPublished',
  TrackUnpublished: 'trackUnpublished',
  TrackSubscribed: 'trackSubscribed',
  TrackUnsubscribed: 'trackUnsubscribed',
  TrackMuted: 'trackMuted',
  TrackUnmuted: 'trackUnmuted',
  ActiveSpeakersChanged: 'activeSpeakersChanged',
  ConnectionQualityChanged: 'connectionQualityChanged',
  ParticipantNameChanged: 'participantNameChanged',
  Disconnected: 'disconnected',
  MediaDevicesError: 'mediaDevicesError',
} as const;

const ConnectionState = {
  Disconnected: 'disconnected',
  Connecting: 'connecting',
  Connected: 'connected',
  Reconnecting: 'reconnecting',
  SignalReconnecting: 'signalReconnecting',
} as const;

const ConnectionQuality = {
  Excellent: 'excellent',
  Good: 'good',
  Poor: 'poor',
  Lost: 'lost',
  Unknown: 'unknown',
} as const;

const Track = { Source: { Camera: 'camera', Microphone: 'microphone', ScreenShare: 'screen_share' } } as const;

interface FakeParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  connectionQuality: string;
  getTrackPublication: (source: string) => undefined;
}

function createFakeParticipant(identity: string, overrides: Partial<FakeParticipant> = {}): FakeParticipant {
  return {
    identity,
    name: identity,
    isLocal: false,
    isSpeaking: false,
    isCameraEnabled: false,
    isMicrophoneEnabled: true,
    isScreenShareEnabled: false,
    connectionQuality: ConnectionQuality.Good,
    getTrackPublication: () => undefined,
    ...overrides,
  };
}

class FakeRoom extends MiniEmitter {
  localParticipant: FakeParticipant = createFakeParticipant('local-1', { isLocal: true, name: 'Alice' });
  remoteParticipants = new Map<string, FakeParticipant>();

  connect = vi.fn(async () => {
    this.emit(RoomEvent.ConnectionStateChanged, ConnectionState.Connected);
  });

  disconnect = vi.fn(async () => {
    this.emit(RoomEvent.Disconnected);
  });
}

vi.mock('livekit-client', () => ({
  Room: FakeRoom,
  RoomEvent,
  ConnectionState,
  ConnectionQuality,
  Track,
}));

const { RoomManager } = await import('./roomManager');

function getFakeRoom(manager: InstanceType<typeof RoomManager>): FakeRoom {
  return manager.room as unknown as FakeRoom;
}

describe('RoomManager', () => {
  let manager: InstanceType<typeof RoomManager>;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it('starts idle with an empty roster', () => {
    const summary = manager.getSummary();
    expect(summary.connectionState).toBe('idle');
    expect(summary.participantIds).toEqual([]);
    expect(summary.error).toBeNull();
  });

  it('transitions connecting -> connected and populates the roster on connect()', async () => {
    const states: string[] = [];
    manager.subscribe(() => states.push(manager.getSummary().connectionState));

    await manager.connect('wss://example.test', 'token');

    expect(states).toContain('connecting');
    expect(states.at(-1)).toBe('connected');
    expect(manager.getSummary().participantIds).toEqual(['local-1']);
  });

  it('records a failed connection without throwing out of the caller silently ignoring it', async () => {
    const room = getFakeRoom(manager);
    room.connect.mockRejectedValueOnce(new Error('invalid API key'));

    await expect(manager.connect('wss://example.test', 'token')).rejects.toThrow('invalid API key');
    expect(manager.getSummary().connectionState).toBe('failed');
    expect(manager.getSummary().error).toBe('invalid API key');
  });

  it('adds a remote participant to the roster on ParticipantConnected', async () => {
    await manager.connect('wss://example.test', 'token');
    const room = getFakeRoom(manager);
    const bob = createFakeParticipant('remote-1', { name: 'Bob' });
    room.remoteParticipants.set(bob.identity, bob);

    room.emit(RoomEvent.ParticipantConnected, bob);

    expect(manager.getSummary().participantIds).toEqual(['local-1', 'remote-1']);
    expect(manager.getParticipantSnapshot('remote-1')?.name).toBe('Bob');
  });

  it('removes a participant from the roster on ParticipantDisconnected', async () => {
    await manager.connect('wss://example.test', 'token');
    const room = getFakeRoom(manager);
    const bob = createFakeParticipant('remote-1', { name: 'Bob' });
    room.remoteParticipants.set(bob.identity, bob);
    room.emit(RoomEvent.ParticipantConnected, bob);

    room.remoteParticipants.delete(bob.identity);
    room.emit(RoomEvent.ParticipantDisconnected, bob);

    expect(manager.getSummary().participantIds).toEqual(['local-1']);
    expect(manager.getParticipantSnapshot('remote-1')).toBeUndefined();
  });

  it('notifies only the affected participant on a mic mute, not the whole room listener', async () => {
    await manager.connect('wss://example.test', 'token');
    const room = getFakeRoom(manager);
    const bob = createFakeParticipant('remote-1', { name: 'Bob', isMicrophoneEnabled: true });
    room.remoteParticipants.set(bob.identity, bob);
    room.emit(RoomEvent.ParticipantConnected, bob);

    const roomListener = vi.fn();
    const participantListener = vi.fn();
    manager.subscribe(roomListener);
    manager.subscribeParticipant('remote-1', participantListener);

    bob.isMicrophoneEnabled = false;
    room.emit(RoomEvent.TrackMuted, { source: Track.Source.Microphone }, bob);

    expect(participantListener).toHaveBeenCalledTimes(1);
    expect(manager.getParticipantSnapshot('remote-1')?.isMicrophoneEnabled).toBe(false);
    expect(roomListener).not.toHaveBeenCalled();
  });

  it('reflects only the active speakers from ActiveSpeakersChanged', async () => {
    await manager.connect('wss://example.test', 'token');
    const room = getFakeRoom(manager);
    const bob = createFakeParticipant('remote-1', { name: 'Bob' });
    room.remoteParticipants.set(bob.identity, bob);
    room.emit(RoomEvent.ParticipantConnected, bob);

    room.emit(RoomEvent.ActiveSpeakersChanged, [bob]);

    expect(manager.getParticipantSnapshot('remote-1')?.isSpeaking).toBe(true);
    expect(manager.getParticipantSnapshot('local-1')?.isSpeaking).toBe(false);

    room.emit(RoomEvent.ActiveSpeakersChanged, []);

    expect(manager.getParticipantSnapshot('remote-1')?.isSpeaking).toBe(false);
  });

  it('tracks the current screen-share presenter', async () => {
    await manager.connect('wss://example.test', 'token');
    const room = getFakeRoom(manager);
    const bob = createFakeParticipant('remote-1', { name: 'Bob', isScreenShareEnabled: true });
    room.remoteParticipants.set(bob.identity, bob);
    room.emit(RoomEvent.ParticipantConnected, bob);
    room.emit(RoomEvent.TrackPublished, { source: Track.Source.ScreenShare }, bob);

    expect(manager.getSummary().screenShareParticipantId).toBe('remote-1');

    bob.isScreenShareEnabled = false;
    room.emit(RoomEvent.TrackUnpublished, { source: Track.Source.ScreenShare }, bob);

    expect(manager.getSummary().screenShareParticipantId).toBeNull();
  });

  it('clears the roster and marks disconnected on disconnect()', async () => {
    await manager.connect('wss://example.test', 'token');
    await manager.disconnect();

    const summary = manager.getSummary();
    expect(summary.connectionState).toBe('disconnected');
    expect(summary.participantIds).toEqual([]);
  });

  it('stops notifying subscribers once disposed', async () => {
    await manager.connect('wss://example.test', 'token');
    const room = getFakeRoom(manager);
    const listener = vi.fn();
    manager.subscribe(listener);

    manager.dispose();
    room.emit(RoomEvent.ConnectionStateChanged, ConnectionState.Reconnecting);

    expect(listener).not.toHaveBeenCalled();
  });
});
