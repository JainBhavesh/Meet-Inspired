import moment from 'moment';

const MEETING_ID_PATTERN = /^meeting-\d{10,}$/;

export function generateMeetingId(): string {
  return `meeting-${moment().valueOf()}`;
}

export function isValidMeetingId(value: string | undefined | null): value is string {
  if (!value) return false;
  return MEETING_ID_PATTERN.test(value);
}
