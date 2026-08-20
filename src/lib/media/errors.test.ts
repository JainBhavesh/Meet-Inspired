import { afterEach, describe, expect, it, vi } from 'vitest';
import { toMeetingError } from './errors';

function domException(name: string): DOMException {
  return new DOMException('simulated', name);
}

describe('toMeetingError', () => {
  it('maps NotAllowedError to a recoverable permission-denied error', () => {
    const error = toMeetingError('camera', domException('NotAllowedError'));
    expect(error.code).toBe('permission-denied-camera');
    expect(error.recoverable).toBe(true);
  });

  it('maps SecurityError to permission-denied for the microphone', () => {
    const error = toMeetingError('microphone', domException('SecurityError'));
    expect(error.code).toBe('permission-denied-microphone');
  });

  it('maps NotFoundError to an unrecoverable device-unavailable error', () => {
    const error = toMeetingError('camera', domException('NotFoundError'));
    expect(error.code).toBe('device-unavailable-camera');
    expect(error.recoverable).toBe(false);
  });

  it('maps OverconstrainedError to device-unavailable', () => {
    const error = toMeetingError('microphone', domException('OverconstrainedError'));
    expect(error.code).toBe('device-unavailable-microphone');
    expect(error.recoverable).toBe(false);
  });

  it('maps NotReadableError to a recoverable device-unavailable error (device busy)', () => {
    const error = toMeetingError('camera', domException('NotReadableError'));
    expect(error.code).toBe('device-unavailable-camera');
    expect(error.recoverable).toBe(true);
  });

  it('falls back to "unknown" for a non-DOMException failure', () => {
    const error = toMeetingError('camera', new Error('something else broke'));
    expect(error.code).toBe('unknown');
    expect(error.recoverable).toBe(true);
  });

  it('preserves the original cause for debugging', () => {
    const cause = domException('NotAllowedError');
    const error = toMeetingError('camera', cause);
    expect(error.cause).toBe(cause);
  });

  describe('when getUserMedia is missing because the page is not a secure context', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('reports insecure-context instead of the generic fallback', () => {
      vi.stubGlobal('window', {
        ...window,
        isSecureContext: false,
        location: { protocol: 'http:', hostname: '192.168.1.4' },
      });

      // navigator.mediaDevices is undefined outside a secure context, so the
      // real failure is a plain TypeError, not one of the DOMExceptions above.
      const error = toMeetingError('camera', new TypeError("Cannot read properties of undefined (reading 'getUserMedia')"));
      expect(error.code).toBe('insecure-context');
      expect(error.recoverable).toBe(false);
      expect(error.message).toContain('http://192.168.1.4');
    });
  });
});
