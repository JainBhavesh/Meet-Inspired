import { useEffect, useRef, useState } from 'react';
import { IconButton } from '../../../components/IconButton/IconButton';
import { Tooltip } from '../../../components/Tooltip/Tooltip';
import { Icon } from '../../../components/Icon/Icon';
import { logger } from '../../../lib/logger';
import styles from './MeetingInfo.module.css';

export interface MeetingInfoProps {
  meetingId: string;
}

export function MeetingInfo({ meetingId }: MeetingInfoProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleCopy(): void {
    const url = `${window.location.origin}/meeting/${meetingId}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch((cause: unknown) => {
        logger.warn('MeetingInfo', 'Clipboard write failed', { cause });
      });
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Meeting ID</span>
      <div className={styles.row}>
        <span className={styles.id}>{meetingId}</span>
        <Tooltip label={copied ? 'Copied!' : 'Copy meeting link'}>
          <IconButton
            aria-label="Copy meeting link"
            size="small"
            onClick={handleCopy}
            className={copied ? styles.copied : ''}
          >
            <Icon name={copied ? 'check' : 'copy'} size={14} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
