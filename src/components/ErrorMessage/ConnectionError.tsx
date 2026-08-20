import { ErrorMessage } from './ErrorMessage';

export interface ConnectionErrorProps {
  message?: string;
  onRetry: () => void;
}

/** Shown when the room connection fails outright (as opposed to a transient reconnect). */
export function ConnectionError({ message, onRetry }: ConnectionErrorProps) {
  return (
    <ErrorMessage
      icon="alert"
      title="Unable to connect to the meeting"
      description={message ?? 'Check your network connection and try again.'}
      actionLabel="Try again"
      onAction={onRetry}
    />
  );
}
