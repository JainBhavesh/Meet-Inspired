import { useRoomSummary } from './useRoomSummary';
import type { ConnectionState } from '../../../types';

export interface UseConnectionStateResult {
  connectionState: ConnectionState;
  error: string | null;
}

export function useConnectionState(): UseConnectionStateResult {
  const { connectionState, error } = useRoomSummary();
  return { connectionState, error };
}
