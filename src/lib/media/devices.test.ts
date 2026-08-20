import { describe, expect, it } from 'vitest';
import { groupDevicesByKind } from './devices';
import type { MediaDevice } from '../../types';

function device(kind: MediaDevice['kind'], deviceId: string, label = deviceId): MediaDevice {
  return { kind, deviceId, label };
}

describe('groupDevicesByKind', () => {
  it('splits a mixed device list into camera/microphone/speaker buckets', () => {
    const devices: MediaDevice[] = [
      device('videoinput', 'cam-1'),
      device('audioinput', 'mic-1'),
      device('audiooutput', 'speaker-1'),
      device('videoinput', 'cam-2'),
    ];

    const grouped = groupDevicesByKind(devices);

    expect(grouped.videoinput.map((d) => d.deviceId)).toEqual(['cam-1', 'cam-2']);
    expect(grouped.audioinput.map((d) => d.deviceId)).toEqual(['mic-1']);
    expect(grouped.audiooutput.map((d) => d.deviceId)).toEqual(['speaker-1']);
  });

  it('returns empty arrays for kinds with no devices', () => {
    const grouped = groupDevicesByKind([device('videoinput', 'cam-1')]);
    expect(grouped.audioinput).toEqual([]);
    expect(grouped.audiooutput).toEqual([]);
  });

  it('handles an empty device list', () => {
    const grouped = groupDevicesByKind([]);
    expect(grouped).toEqual({ videoinput: [], audioinput: [], audiooutput: [] });
  });
});
