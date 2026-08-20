import { logger } from '../logger';

type SinkCapableElement = HTMLMediaElement & {
  setSinkId?: (deviceId: string) => Promise<void>;
};

export function supportsAudioOutputSelection(): boolean {
  return typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;
}

/**
 * Routes a single <audio>/<video> element to a specific output device.
 * Safari and Firefox don't implement setSinkId() at all — this silently
 * no-ops there rather than throwing, since audio still plays on the
 * system default device either way.
 */
export async function applyAudioOutputDevice(element: HTMLMediaElement, deviceId: string): Promise<void> {
  const sinkCapable = element as SinkCapableElement;
  if (!sinkCapable.setSinkId) return;

  try {
    await sinkCapable.setSinkId(deviceId);
  } catch (cause) {
    logger.warn('audioOutput', 'Failed to set audio output device', { cause });
  }
}
