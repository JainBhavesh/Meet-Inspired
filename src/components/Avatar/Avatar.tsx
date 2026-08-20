import { memo } from 'react';
import { getInitials } from '../../utils/validation';
import styles from './Avatar.module.css';

const PALETTE = ['#1a73e8', '#d93025', '#188038', '#e37400', '#9334e6', '#12847a'];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length] as string;
}

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

function AvatarComponent({ name, size = 'md' }: AvatarProps) {
  return (
    <div className={`${styles.avatar} ${styles[size]}`} style={{ background: colorForName(name) }} aria-hidden="true">
      {getInitials(name)}
    </div>
  );
}

export const Avatar = memo(AvatarComponent);
