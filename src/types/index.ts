/**
 * Domain types shared across features. Kept independent of LiveKit SDK types
 * where possible so UI code depends on our own vocabulary, not a vendor's.
 */

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface MediaPermissionState {
  camera: PermissionState;
  microphone: PermissionState;
}

export type DeviceKind = 'videoinput' | 'audioinput' | 'audiooutput';

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: DeviceKind;
}

export interface SelectedDevices {
  cameraId: string | null;
  microphoneId: string | null;
  speakerId: string | null;
}

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

export interface Participant {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  joinedAt: number;
}

export interface Meeting {
  meetingId: string;
  displayName: string;
}

export type MeetingErrorCode =
  | 'permission-denied-camera'
  | 'permission-denied-microphone'
  | 'device-unavailable-camera'
  | 'device-unavailable-microphone'
  | 'insecure-context'
  | 'token-request-failed'
  | 'connection-failed'
  | 'invalid-meeting-id'
  | 'screen-share-failed'
  | 'network-error'
  | 'unknown';

export interface MeetingError {
  code: MeetingErrorCode;
  message: string;
  recoverable: boolean;
  cause?: unknown;
}
