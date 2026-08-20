import { memo } from 'react';
import styles from './ParticipantTile.module.css';

export interface ParticipantNameProps {
  name: string;
  isLocal: boolean;
}

function ParticipantNameComponent({ name, isLocal }: ParticipantNameProps) {
  return (
    <span className={styles.name}>
      {name}
      {isLocal ? ' (You)' : ''}
    </span>
  );
}

export const ParticipantName = memo(ParticipantNameComponent);
