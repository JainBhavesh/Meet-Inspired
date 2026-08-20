import type { LocalVideoTrack } from 'livekit-client';
import { useTrackAttachment } from '../../../hooks/useTrackAttachment';
import { Avatar } from '../../../components/Avatar/Avatar';
import { Icon } from '../../../components/Icon/Icon';
import type { MeetingError } from '../../../types';
import styles from './LocalVideoPreview.module.css';

export interface LocalVideoPreviewProps {
  videoTrack: LocalVideoTrack | null;
  isCameraEnabled: boolean;
  isCameraStarting: boolean;
  cameraError: MeetingError | null;
  displayName: string;
}

export function LocalVideoPreview({
  videoTrack,
  isCameraEnabled,
  isCameraStarting,
  cameraError,
  displayName,
}: LocalVideoPreviewProps) {
  const videoRef = useTrackAttachment<HTMLVideoElement>(videoTrack);

  return (
    <div className={styles.preview}>
      {cameraError ? (
        <div className={styles.placeholder}>
          <Icon name="video-off" size={32} />
          <p className={styles.placeholderTitle}>Camera unavailable</p>
          <p className={styles.placeholderBody}>{cameraError.message}</p>
        </div>
      ) : !isCameraEnabled ? (
        <div className={styles.placeholder}>
          <Avatar name={displayName || '?'} size="lg" />
          <p className={styles.placeholderTitle}>Camera off</p>
        </div>
      ) : isCameraStarting || !videoTrack ? (
        <div className={styles.placeholder}>
          <Icon name="spinner" size={28} />
        </div>
      ) : (
        <video ref={videoRef} className={styles.video} autoPlay playsInline muted aria-label="Your camera preview" />
      )}
      {displayName && <span className={styles.nameBadge}>{displayName}</span>}
    </div>
  );
}
