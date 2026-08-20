import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  active?: boolean;
  danger?: boolean;
  size?: 'default' | 'small';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { active = false, danger = false, size = 'default', className, type = 'button', ...rest },
  ref,
) {
  const classes = [
    styles.button,
    danger ? styles.danger : active ? styles.active : '',
    size === 'small' ? styles.small : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button ref={ref} type={type} className={classes} {...rest} />;
});
