import { useEffect, useRef, type ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Built on the native <dialog> element rather than a hand-rolled overlay —
 * it gives us focus trapping, Escape-to-close, and backdrop semantics for
 * free instead of reimplementing them.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Routed through dialog.close() rather than calling onClose() directly,
    // same as the header button — the 'close' listener below is the single
    // path that ever calls onClose(), so every dismissal (button, Escape)
    // invokes it exactly once instead of racing a second call through here.
    const handleCancel = (event: Event): void => {
      event.preventDefault();
      dialog.close();
    };
    const handleClose = (): void => onClose();

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="modal-title">
      <div className={styles.header}>
        <h2 id="modal-title" className={styles.title}>
          {title}
        </h2>
        <IconButton aria-label="Close" size="small" onClick={() => dialogRef.current?.close()}>
          <Icon name="close" size={16} />
        </IconButton>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
