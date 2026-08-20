import { NextResponse, type NextRequest } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { serverEnv } from '@/lib/server/env';
import { logger } from '@/lib/logger';

const MEETING_ID_PATTERN = /^meeting-\d{10,}$/;
const MAX_NAME_LENGTH = 50;

interface TokenRequestBody {
  roomName?: unknown;
  participantName?: unknown;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as TokenRequestBody | null;

  const roomName = typeof body?.roomName === 'string' ? body.roomName : '';
  const participantName = typeof body?.participantName === 'string' ? body.participantName.trim() : '';

  if (!MEETING_ID_PATTERN.test(roomName)) {
    return NextResponse.json({ error: 'Invalid roomName.' }, { status: 400 });
  }

  if (participantName.length < 2 || participantName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: 'Invalid participantName.' }, { status: 400 });
  }

  try {
    // Identity is unique per connection (not just per name) so two tabs
    // with the same display name don't collide as the same participant.
    const identity = `${participantName}-${crypto.randomUUID().slice(0, 8)}`;

    const token = new AccessToken(serverEnv.livekitApiKey, serverEnv.livekitApiSecret, {
      identity,
      name: participantName,
    });
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();
    return NextResponse.json({ token: jwt, serverUrl: serverEnv.livekitUrl });
  } catch (cause) {
    logger.error('api/livekit/token', 'Failed to mint token', { cause });
    return NextResponse.json({ error: 'Could not create a meeting token.' }, { status: 500 });
  }
}
