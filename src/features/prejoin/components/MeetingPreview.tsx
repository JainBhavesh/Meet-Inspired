import type { LocalVideoTrack } from 'livekit-client';
import { LocalVideoPreview } from './LocalVideoPreview';
import { MediaControls, type MediaControlsProps } from './MediaControls';
import type { MeetingError } from '../../../types';
import styles from './MeetingPreview.module.css';

export interface MeetingPreviewProps extends MediaControlsProps {
  videoTrack: LocalVideoTrack | null;
  isCameraStarting: boolean;
  cameraError: MeetingError | null;
  displayName: string;
}

/** The video-preview panel: live camera feed with the mic/camera/settings controls floating over it. */
export function MeetingPreview({
  videoTrack,
  isCameraStarting,
  cameraError,
  displayName,
  ...mediaControlsProps
}: MeetingPreviewProps) {
  return (
    <div className={styles.wrapper}>
      <LocalVideoPreview
        videoTrack={videoTrack}
        isCameraEnabled={mediaControlsProps.isCameraEnabled}
        isCameraStarting={isCameraStarting}
        cameraError={cameraError}
        displayName={displayName}
      />
      <div className={styles.controlsOverlay}>
        <MediaControls {...mediaControlsProps} />
      </div>
    </div>
  );
}
