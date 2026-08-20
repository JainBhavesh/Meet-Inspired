import { memo } from 'react';
import type { LocalVideoTrack, RemoteVideoTrack } from 'livekit-client';
import { useTrackAttachment } from '../../../hooks/useTrackAttachment';
import styles from './ParticipantVideo.module.css';

export interface ParticipantVideoProps {
  track: LocalVideoTrack | RemoteVideoTrack | undefined;
  mirrored?: boolean;
}

function ParticipantVideoComponent({ track, mirrored = false }: ParticipantVideoProps) {
  const videoRef = useTrackAttachment<HTMLVideoElement>(track);

  if (!track) return null;

  return (
    // Live WebRTC camera feed — there is no caption track to provide for a real-time peer video stream.

    <video ref={videoRef} className={`${styles.video} ${mirrored ? styles.mirrored : ''}`} autoPlay playsInline />
  );
}

export const ParticipantVideo = memo(ParticipantVideoComponent);
