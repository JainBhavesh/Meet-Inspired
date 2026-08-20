import { memo } from 'react';
import { useRoomManager } from '../../../lib/livekit/RoomManagerContext';
import { useParticipantData } from '../hooks/useParticipantData';
import { Avatar } from '../../../components/Avatar/Avatar';
import { ParticipantVideo } from './ParticipantVideo';
import { ParticipantAudio } from './ParticipantAudio';
import { ParticipantName } from './ParticipantName';
import { MicStatus } from './MicStatus';
import { ConnectionStatus } from './ConnectionStatus';
import styles from './ParticipantTile.module.css';

export interface ParticipantTileProps {
  participantId: string;
  /** Fill the parent grid cell instead of sizing from a fixed aspect ratio — used by the main grid, not the screen-share filmstrip. */
  fill?: boolean;
}

/**
 * Deliberately takes only an id, not the participant object — it reads its
 * own reactive slice via useParticipantData(participantId). That's what
 * keeps a mic toggle from participant A from re-rendering participant B's
 * tile; see docs/PERFORMANCE.md.
 */
function ParticipantTileComponent({ participantId, fill = false }: ParticipantTileProps) {
  const roomManager = useRoomManager();
  const participant = useParticipantData(participantId);

  const cameraTrack = participant.isCameraEnabled ? roomManager.getCameraTrack(participantId) : undefined;
  const microphoneTrack = !participant.isLocal ? roomManager.getMicrophoneTrack(participantId) : undefined;

  const tileClassName = [styles.tile, fill ? styles.fill : '', participant.isSpeaking ? styles.speaking : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={tileClassName}>
      {cameraTrack ? (
        <ParticipantVideo track={cameraTrack} mirrored={participant.isLocal} />
      ) : (
        <div className={styles.avatarWrap}>
          <Avatar name={participant.name || '?'} size="md" />
        </div>
      )}
      <ParticipantAudio track={microphoneTrack} />

      <div className={styles.footer}>
        <ParticipantName name={participant.name} isLocal={participant.isLocal} />
        <MicStatus isMuted={!participant.isMicrophoneEnabled} />
        <ConnectionStatus quality={participant.connectionQuality} />
      </div>
    </div>
  );
}

export const ParticipantTile = memo(ParticipantTileComponent);
