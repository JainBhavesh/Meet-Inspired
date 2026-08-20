import type { DeviceKind, MediaDevice } from '../../types';

const KIND_MAP: Record<MediaDeviceKind, DeviceKind> = {
  videoinput: 'videoinput',
  audioinput: 'audioinput',
  audiooutput: 'audiooutput',
};

export async function listMediaDevices(): Promise<MediaDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  const countByKind: Partial<Record<MediaDeviceKind, number>> = {};
  return devices
    .filter((device): device is MediaDeviceInfo & { kind: MediaDeviceKind } => device.kind in KIND_MAP)
    .map((device) => {
      const ordinal = (countByKind[device.kind] ?? 0) + 1;
      countByKind[device.kind] = ordinal;
      return {
        deviceId: device.deviceId,
        kind: KIND_MAP[device.kind],
        label: device.label || `${labelForKind(device.kind)} ${ordinal}`,
      };
    });
}

function labelForKind(kind: MediaDeviceKind): string {
  switch (kind) {
    case 'videoinput':
      return 'Camera';
    case 'audioinput':
      return 'Microphone';
    case 'audiooutput':
      return 'Speaker';
    default:
      return 'Device';
  }
}

export function groupDevicesByKind(devices: MediaDevice[]): Record<DeviceKind, MediaDevice[]> {
  return {
    videoinput: devices.filter((d) => d.kind === 'videoinput'),
    audioinput: devices.filter((d) => d.kind === 'audioinput'),
    audiooutput: devices.filter((d) => d.kind === 'audiooutput'),
  };
}
