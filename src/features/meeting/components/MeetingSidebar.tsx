import { memo } from 'react';
import { IconButton } from '../../../components/IconButton/IconButton';
import { Icon } from '../../../components/Icon/Icon';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useParticipants } from '../../participants/hooks/useParticipants';
import { useParticipantData } from '../../participants/hooks/useParticipantData';
import styles from './MeetingSidebar.module.css';

export interface MeetingSidebarProps {
  onClose: () => void;
}

const SidebarRow = memo(function SidebarRow({ participantId }: { participantId: string }) {
  const participant = useParticipantData(participantId);

  return (
    <li className={styles.item}>
      <Avatar name={participant.name || '?'} size="sm" />
      <span className={styles.itemName}>
        {participant.name}
        {participant.isLocal ? ' (You)' : ''}
      </span>
      {!participant.isMicrophoneEnabled && (
        <span className={styles.itemMicOff} aria-label="Microphone muted">
          <Icon name="mic-off" size={16} />
        </span>
      )}
    </li>
  );
});

export function MeetingSidebar({ onClose }: MeetingSidebarProps) {
  const { participantIds } = useParticipants();

  return (
    <aside className={styles.sidebar} aria-label="Participants">
      <div className={styles.header}>
        <h2 className={styles.title}>Participants ({participantIds.length})</h2>
        <IconButton aria-label="Close participants panel" size="small" onClick={onClose}>
          <Icon name="close" size={16} />
        </IconButton>
      </div>
      <ul className={styles.list}>
        {participantIds.map((id) => (
          <SidebarRow key={id} participantId={id} />
        ))}
      </ul>
    </aside>
  );
}
