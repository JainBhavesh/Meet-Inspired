import 'server-only';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-only LiveKit configuration. The `server-only` import above turns
 * an accidental import of this module from a Client Component into a build
 * error, instead of `LIVEKIT_API_SECRET` silently resolving to `undefined`
 * (or worse, ending up in the client bundle) at runtime.
 */
export const serverEnv = {
  livekitApiKey: requireEnv('LIVEKIT_API_KEY'),
  livekitApiSecret: requireEnv('LIVEKIT_API_SECRET'),
  livekitUrl: requireEnv('LIVEKIT_URL'),
};
