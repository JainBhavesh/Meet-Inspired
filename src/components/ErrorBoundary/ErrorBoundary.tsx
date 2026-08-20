import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../lib/logger';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last-resort UI boundary. React error boundaries must be class components —
 * there is no hook equivalent for getDerivedStateFromError/componentDidCatch.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary', error.message, { stack: info.componentStack });
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className={styles.wrapper} role="alert">
        <Icon name="alert" size={40} className={styles.icon} />
        <h2 className={styles.title}>{this.props.fallbackTitle ?? 'Something went wrong'}</h2>
        <p className={styles.message}>
          An unexpected error occurred. You can try again — if the problem persists, rejoining the meeting usually
          helps.
        </p>
        <Button onClick={this.handleReset}>Try again</Button>
      </div>
    );
  }
}
