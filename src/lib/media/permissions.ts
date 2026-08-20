import type { PermissionState } from '../../types';

export type MediaKind = 'camera' | 'microphone';

const PERMISSION_NAME: Record<MediaKind, PermissionName> = {
  camera: 'camera' as PermissionName,
  microphone: 'microphone' as PermissionName,
};

/**
 * Reads the current permission state without prompting. Safari and Firefox
 * don't implement the Permissions API for camera/microphone, so callers must
 * treat 'unsupported' as "unknown — ask getUserMedia to find out".
 */
export async function queryPermissionState(kind: MediaKind): Promise<PermissionState> {
  if (!navigator.permissions?.query) return 'unsupported';

  try {
    const status = await navigator.permissions.query({ name: PERMISSION_NAME[kind] });
    return status.state as PermissionState;
  } catch {
    return 'unsupported';
  }
}

export function watchPermissionState(
  kind: MediaKind,
  onChange: (state: PermissionState) => void,
): (() => void) | undefined {
  if (!navigator.permissions?.query) return undefined;

  let status: PermissionStatus | undefined;
  let cancelled = false;
  const handleChange = (): void => onChange(status?.state as PermissionState);

  navigator.permissions
    .query({ name: PERMISSION_NAME[kind] })
    .then((result) => {
      if (cancelled) return;
      status = result;
      status.addEventListener('change', handleChange);
    })
    .catch(() => {
      /* Permissions API unsupported for this name — nothing to watch. */
    });

  return () => {
    cancelled = true;
    status?.removeEventListener('change', handleChange);
  };
}
