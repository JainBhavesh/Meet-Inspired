import { useEffect, useState } from 'react';
import { queryPermissionState, watchPermissionState } from '../lib/media/permissions';
import type { MediaPermissionState } from '../types';

const INITIAL_STATE: MediaPermissionState = { camera: 'prompt', microphone: 'prompt' };

/**
 * Read-only view of the browser's current camera/microphone permission
 * state via the Permissions API. Safari/Firefox don't support querying
 * camera/microphone this way, in which case both fields stay 'unsupported'
 * and callers should fall back to interpreting getUserMedia() results
 * directly (see useLocalMedia).
 */
export function useMediaPermissions(): MediaPermissionState {
  const [state, setState] = useState<MediaPermissionState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    queryPermissionState('camera')
      .then((camera) => {
        if (!cancelled) setState((prev) => ({ ...prev, camera }));
      })
      .catch(() => undefined);

    queryPermissionState('microphone')
      .then((microphone) => {
        if (!cancelled) setState((prev) => ({ ...prev, microphone }));
      })
      .catch(() => undefined);

    const unwatchCamera = watchPermissionState('camera', (camera) => {
      setState((prev) => ({ ...prev, camera }));
    });
    const unwatchMicrophone = watchPermissionState('microphone', (microphone) => {
      setState((prev) => ({ ...prev, microphone }));
    });

    return () => {
      cancelled = true;
      unwatchCamera?.();
      unwatchMicrophone?.();
    };
  }, []);

  return state;
}
