import { useCallback, useEffect, useState } from 'react';
import { RoomManager } from '../../../lib/livekit/roomManager';
import { requestLiveKitToken, TokenRequestError } from '../../../lib/livekit/tokenService';
import { logger } from '../../../lib/logger';
import type { JoinSession } from '../../prejoin/types';

export interface UseMeetingResult {
  roomManager: RoomManager | null;
  fatalError: string | null;
  retry: () => void;
  leave: () => Promise<void>;
}

/**
 * Owns the connect → publish-initial-media → disconnect lifecycle for one
 * meeting attempt. A fresh RoomManager is created per effect run (rather
 * than reused via a ref) so React Strict Mode's mount → cleanup → mount
 * never hands a disposed manager back to a live connection attempt.
 *
 * `session` is expected to be referentially stable for the component's
 * lifetime (PreJoinScreen hands it off once via onJoin) — it's a normal
 * effect dependency here, not something that needs a ref to avoid re-runs.
 */
export function useMeeting(meetingId: string, session: JoinSession): UseMeetingResult {
  const [roomManager, setRoomManager] = useState<RoomManager | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const manager = new RoomManager();
    let torndown = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishing the resource this effect owns for render to consume, the standard "connect to an external system" shape.
    setRoomManager(manager);
    setFatalError(null);

    async function join(): Promise<void> {
      const { displayName, cameraEnabled, microphoneEnabled, cameraDeviceId, microphoneDeviceId } = session;

      let token: string;
      let serverUrl: string;
      try {
        const response = await requestLiveKitToken({ roomName: meetingId, participantName: displayName });
        token = response.token;
        serverUrl = response.serverUrl;
      } catch (cause) {
        if (torndown) return;
        const message = cause instanceof TokenRequestError ? cause.message : 'Unable to reach the meeting server.';
        setFatalError(message);
        return;
      }

      if (torndown) return;

      try {
        await manager.connect(serverUrl, token);
      } catch {
        // RoomManager already recorded this in its own summary (connectionState: 'failed').
        return;
      }

      if (torndown) return;

      try {
        await Promise.all([
          manager.setCameraEnabled(cameraEnabled, cameraDeviceId ? { deviceId: cameraDeviceId } : undefined),
          manager.setMicrophoneEnabled(
            microphoneEnabled,
            microphoneDeviceId ? { deviceId: microphoneDeviceId } : undefined,
          ),
        ]);
      } catch (cause) {
        logger.warn('useMeeting', 'Could not publish initial media state', { cause });
      }
    }

    void join();

    return () => {
      torndown = true;
      manager
        .disconnect()
        .catch((cause) => {
          logger.error('useMeeting', 'Error disconnecting during cleanup', { cause });
        })
        .finally(() => manager.dispose());
    };
  }, [meetingId, attempt, session]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const leave = useCallback(async () => {
    if (!roomManager) return;
    try {
      await roomManager.disconnect();
    } catch (cause) {
      logger.error('useMeeting', 'Error disconnecting on leave', { cause });
    } finally {
      roomManager.dispose();
    }
  }, [roomManager]);

  return { roomManager, fatalError, retry, leave };
}
