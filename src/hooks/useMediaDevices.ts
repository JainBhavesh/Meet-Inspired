import { useCallback, useEffect, useState } from 'react';
import { groupDevicesByKind, listMediaDevices } from '../lib/media/devices';
import type { MediaDevice } from '../types';

export interface UseMediaDevicesResult {
  cameras: MediaDevice[];
  microphones: MediaDevice[];
  speakers: MediaDevice[];
  refresh: () => void;
}

/**
 * Enumerates media devices and keeps the list current as hardware is
 * plugged/unplugged. Device labels are only populated once permission has
 * been granted at least once — callers should re-run refresh() after a
 * successful getUserMedia() call to pick up real labels.
 */
export function useMediaDevices(): UseMediaDevicesResult {
  const [devices, setDevices] = useState<MediaDevice[]>([]);

  const refresh = useCallback(() => {
    listMediaDevices()
      .then(setDevices)
      .catch(() => setDevices([]));
  }, []);

  useEffect(() => {
    refresh();

    if (!navigator.mediaDevices?.addEventListener) return;
    navigator.mediaDevices.addEventListener('devicechange', refresh);
    return () => navigator.mediaDevices.removeEventListener('devicechange', refresh);
  }, [refresh]);

  const grouped = groupDevicesByKind(devices);

  return {
    cameras: grouped.videoinput,
    microphones: grouped.audioinput,
    speakers: grouped.audiooutput,
    refresh,
  };
}
