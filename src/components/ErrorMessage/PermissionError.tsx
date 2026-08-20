import { ErrorMessage } from './ErrorMessage';
import type { MeetingError } from '../../types';

export interface PermissionErrorProps {
  error: MeetingError;
  onRetry: () => void;
}

/** Renders a camera/microphone MeetingError with copy tailored to whether the user can self-recover. */
export function PermissionError({ error, onRetry }: PermissionErrorProps) {
  return (
    <ErrorMessage
      icon="alert"
      title={error.message}
      description={
        error.recoverable
          ? 'Once access is allowed, click retry to continue.'
          : 'Connect a device and refresh the page to continue.'
      }
      actionLabel={error.recoverable ? 'Retry' : undefined}
      onAction={error.recoverable ? onRetry : undefined}
    />
  );
}
