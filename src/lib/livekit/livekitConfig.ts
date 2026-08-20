/**
 * All client-visible LiveKit configuration. The only values allowed here are
 * ones safe to ship to the browser — the API secret never enters this file
 * or any file under src/.
 *
 * The token endpoint is always same-origin now that the token API lives in
 * this same Next.js app (src/app/api/livekit/token) — no separate backend
 * URL to configure.
 */
export const livekitConfig = {
  tokenEndpoint: '/api/livekit/token',
} as const;
