import { redirect } from 'next/navigation';
import { generateMeetingId } from '@/utils/meetingId';

export const dynamic = 'force-dynamic';

/** Mints a fresh meeting id server-side and redirects — no client JS needed for this route at all. */
export default function HomePage() {
  redirect(`/meeting/${generateMeetingId()}`);
}
