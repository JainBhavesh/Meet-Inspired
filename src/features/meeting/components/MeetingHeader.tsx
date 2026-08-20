import { Icon } from '../../../components/Icon/Icon';
import { useConnectionState } from '../hooks/useConnectionState';
import { useParticipants } from '../../participants/hooks/useParticipants';
import styles from './MeetingHeader.module.css';

export interface MeetingHeaderProps {
  meetingId: string;
}

export function MeetingHeader({ meetingId }: MeetingHeaderProps) {
  const { connectionState } = useConnectionState();
  const { participantIds } = useParticipants();

  return (
    <header className={styles.header}>
      <span className={styles.meetingId}>{meetingId}</span>
      <div className={styles.right}>
        {connectionState === 'reconnecting' && (
          <span className={styles.statusPill}>
            <Icon name="spinner" size={14} />
            Reconnecting…
          </span>
        )}
        <span className={styles.participantCount}>
          <Icon name="users" size={16} />
          {participantIds.length}
        </span>
      </div>
    </header>
  );
}
