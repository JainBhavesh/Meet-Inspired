import { useMemo } from 'react';

export interface MeetingLayout {
  columns: number;
  isSpotlight: boolean;
}

/**
 * Maps participant count to a column count; CSS Grid (minmax + the computed
 * column count as a custom property) does the actual sizing and reflow, so
 * this is the one small piece of arithmetic JS needs to contribute.
 */
function calculateLayout(participantCount: number): MeetingLayout {
  if (participantCount <= 1) return { columns: 1, isSpotlight: true };
  if (participantCount === 2) return { columns: 2, isSpotlight: false };
  if (participantCount <= 4) return { columns: 2, isSpotlight: false };
  if (participantCount <= 6) return { columns: 3, isSpotlight: false };
  if (participantCount <= 9) return { columns: 3, isSpotlight: false };
  return { columns: 4, isSpotlight: false };
}

export function useMeetingLayout(participantCount: number): MeetingLayout {
  return useMemo(() => calculateLayout(participantCount), [participantCount]);
}
