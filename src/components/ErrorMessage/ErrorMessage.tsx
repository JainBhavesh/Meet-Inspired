import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { Button } from '../Button/Button';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

/** Generic "something needs the user's attention" panel — the shared base for PermissionError and ConnectionError. */
export function ErrorMessage({
  icon = 'alert',
  title,
  description,
  actionLabel,
  onAction,
  children,
}: ErrorMessageProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <Icon name={icon} size={32} className={styles.icon} />
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {children}
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
