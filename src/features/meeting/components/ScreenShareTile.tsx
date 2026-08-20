import { memo } from 'react';
import { useRoomManager } from '../../../lib/livekit/RoomManagerContext';
import { useParticipantData } from '../../participants/hooks/useParticipantData';
import { useTrackAttachment } from '../../../hooks/useTrackAttachment';
import { useAudioSink } from '../../../hooks/useAudioSink';
import { useAudioOutputDeviceId } from '../AudioOutputContext';
import { Icon } from '../../../components/Icon/Icon';
import styles from './ScreenShareTile.module.css';

export interface ScreenShareTileProps {
  participantId: string;
}

function ScreenShareTileComponent({ participantId }: ScreenShareTileProps) {
  const roomManager = useRoomManager();
  const participant = useParticipantData(participantId);
  const track = roomManager.getScreenShareTrack(participantId);
  const videoRef = useTrackAttachment<HTMLVideoElement>(track);

  // Only a remote presenter's shared-tab audio is played back — routing our
  // own captured audio to our own speakers would just echo it.
  const audioTrack = participant.isLocal ? undefined : roomManager.getScreenShareAudioTrack(participantId);
  const audioRef = useTrackAttachment<HTMLAudioElement>(audioTrack);
  const speakerDeviceId = useAudioOutputDeviceId();
  useAudioSink(audioRef, speakerDeviceId);

  return (
    <div className={styles.tile}>
      {track && (
        // Live screen-share stream — no caption track applies to a real-time peer video feed.

        <video ref={videoRef} className={styles.video} autoPlay playsInline />
      )}
      {audioTrack && (
        // Live screen-share tab/system audio — no caption track applies to a real-time peer audio stream.

        <audio ref={audioRef} autoPlay />
      )}
      <span className={styles.badge}>
        <Icon name="screen-share" size={14} />
        {participant.isLocal ? "You're presenting" : `${participant.name} is presenting`}
      </span>
    </div>
  );
}

export const ScreenShareTile = memo(ScreenShareTileComponent);
