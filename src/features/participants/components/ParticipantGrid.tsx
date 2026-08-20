import type { CSSProperties } from 'react';
import { useParticipants } from '../hooks/useParticipants';
import { useMeetingLayout } from '../../meeting/hooks/useMeetingLayout';
import { ScreenShareTile } from '../../meeting/components/ScreenShareTile';
import { ParticipantTile } from './ParticipantTile';
import styles from './ParticipantGrid.module.css';

export function ParticipantGrid() {
  const { participantIds, screenShareParticipantId } = useParticipants();
  const { columns } = useMeetingLayout(participantIds.length);

  if (screenShareParticipantId) {
    return (
      <div className={styles.spotlightLayout}>
        <div className={styles.spotlightMain}>
          <ScreenShareTile participantId={screenShareParticipantId} />
        </div>
        <div className={styles.filmstrip}>
          {participantIds.map((id) => (
            <ParticipantTile key={id} participantId={id} />
          ))}
        </div>
      </div>
    );
  }

  const gridStyle = { '--grid-columns': columns } as CSSProperties;

  return (
    <div className={styles.grid} style={gridStyle}>
      {participantIds.map((id) => (
        <ParticipantTile key={id} participantId={id} fill />
      ))}
    </div>
  );
}
