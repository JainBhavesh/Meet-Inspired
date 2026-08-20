export interface JoinSession {
  displayName: string;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  cameraDeviceId: string | null;
  microphoneDeviceId: string | null;
  speakerDeviceId: string | null;
}
