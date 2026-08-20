import { memo } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import type { Participant } from '../../../types';
import styles from './ParticipantTile.module.css';

export interface ConnectionStatusProps {
  quality: Participant['connectionQuality'];
}

function ConnectionStatusComponent({ quality }: ConnectionStatusProps) {
  if (quality !== 'poor') return null;

  return (
    <span className={styles.connectionStatus} aria-label="Poor connection">
      <Icon name="signal-poor" size={14} />
    </span>
  );
}

export const ConnectionStatus = memo(ConnectionStatusComponent);
