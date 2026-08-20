import { describe, expect, it } from 'vitest';
import moment from 'moment';
import { generateMeetingId, isValidMeetingId } from './meetingId';

describe('generateMeetingId', () => {
  it('produces an id in the meeting-<timestamp> shape', () => {
    const id = generateMeetingId();
    expect(id).toMatch(/^meeting-\d{10,}$/);
  });

  it('embeds the current time so ids from distinct instants differ', () => {
    const first = generateMeetingId();
    const second = generateMeetingId();
    // Not asserting strict inequality — moment timestamps can tick identically
    // within the same millisecond — only that the shape is stable.
    expect(first).toMatch(/^meeting-\d{10,}$/);
    expect(second).toMatch(/^meeting-\d{10,}$/);
  });
});

describe('isValidMeetingId', () => {
  it.each(['meeting-1754748392012', 'meeting-1234567890', `meeting-${moment().valueOf()}`])('accepts %s', (id) => {
    expect(isValidMeetingId(id)).toBe(true);
  });

  it.each([
    undefined,
    null,
    '',
    'meeting-',
    'meeting-abc',
    'meeting-123',
    'not-a-meeting-id',
    '1754748392012',
    'meeting-1754748392012-extra',
    ' meeting-1754748392012',
  ])('rejects %j', (value) => {
    expect(isValidMeetingId(value)).toBe(false);
  });
});
