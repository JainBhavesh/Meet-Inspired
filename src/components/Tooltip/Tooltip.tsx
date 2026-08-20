import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  label: string;
  children: ReactNode;
}

/**
 * Wraps a single focusable child (typically an icon button) and exposes the
 * label both visually on hover/focus and via aria-describedby, so screen
 * reader users get the same information sighted mouse users do.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const tooltipId = useId();

  const describedChild = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': tooltipId,
      })
    : children;

  return (
    <span className={styles.wrapper}>
      {describedChild}
      <span role="tooltip" id={tooltipId} className={styles.bubble}>
        {label}
      </span>
    </span>
  );
}
