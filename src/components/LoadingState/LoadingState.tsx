import { Icon } from '../Icon/Icon';
import styles from './LoadingState.module.css';

export interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <Icon name="spinner" size={28} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
