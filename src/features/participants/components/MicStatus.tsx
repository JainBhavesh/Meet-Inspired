import { memo } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import styles from './ParticipantTile.module.css';

export interface MicStatusProps {
  isMuted: boolean;
}

function MicStatusComponent({ isMuted }: MicStatusProps) {
  if (!isMuted) return null;

  return (
    <span className={styles.micStatus} aria-label="Microphone muted">
      <Icon name="mic-off" size={14} />
    </span>
  );
}

export const MicStatus = memo(MicStatusComponent);
