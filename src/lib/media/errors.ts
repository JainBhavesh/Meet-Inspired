import { isErrorLike } from '../errorLike';
import type { MediaKind } from './permissions';
import type { MeetingError, MeetingErrorCode } from '../../types';

/** Maps a getUserMedia() rejection to a code the UI already knows how to render. */
export function toMeetingError(kind: MediaKind, cause: unknown): MeetingError {
  // Duck-typed rather than `cause instanceof DOMException`: instanceof breaks across
  // realms and whenever a value has passed through a different bundle's copy of the
  // class, which silently dropped real "permission denied" DOMExceptions into the
  // generic fallback below instead of matching NotAllowedError.
  const name = isErrorLike(cause) ? cause.name : undefined;

  const deniedCode: MeetingErrorCode = kind === 'camera' ? 'permission-denied-camera' : 'permission-denied-microphone';
  const unavailableCode: MeetingErrorCode =
    kind === 'camera' ? 'device-unavailable-camera' : 'device-unavailable-microphone';

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        code: deniedCode,
        message: `${kind === 'camera' ? 'Camera' : 'Microphone'} access is blocked. Enable it from your browser settings.`,
        recoverable: true,
        cause,
      };
    case 'NotFoundError':
    case 'OverconstrainedError':
      return {
        code: unavailableCode,
        message: `No ${kind} was found on this device.`,
        recoverable: false,
        cause,
      };
    case 'NotReadableError':
      return {
        code: unavailableCode,
        message: `${kind === 'camera' ? 'Camera' : 'Microphone'} is already in use by another application.`,
        recoverable: true,
        cause,
      };
    default:
      // getUserMedia only exists in a secure context (HTTPS, or localhost/127.0.0.1).
      // Opening this page via the dev server's LAN IP — to test from another device, or
      // as a second "participant" tab on this machine — loads over plain HTTP, so
      // `navigator.mediaDevices` is undefined there and the SDK's call throws a plain
      // TypeError instead of one of the DOMExceptions handled above, which otherwise
      // looks just like an unexplained generic failure. `isSecureContext` is checked
      // with `=== false` rather than falsy: unsupported test/SSR environments report it
      // as `undefined` and should fall through to the generic case below, not this one.
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        return {
          code: 'insecure-context',
          message: `${kind === 'camera' ? 'Camera' : 'Microphone'} access requires HTTPS or localhost — this page was opened over an insecure connection (${window.location.protocol}//${window.location.hostname}). Use localhost, or set up HTTPS for LAN/device testing.`,
          recoverable: false,
          cause,
        };
      }
      return {
        code: 'unknown',
        message: `Could not access your ${kind}.`,
        recoverable: true,
        cause,
      };
  }
}
