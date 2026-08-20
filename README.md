# Meet Inspired

A Google Meet–inspired video meeting app built with React, Next.js, TypeScript, and [LiveKit](https://livekit.io). Built as a portfolio piece to demonstrate production-grade React architecture, rendering-performance discipline, and real WebRTC integration — not a tutorial demo.

Not affiliated with or endorsed by Google. No Google branding, logos, or proprietary assets are used.

## Project overview

Two screens:

1. **Pre-join** — enter your name, preview your camera, toggle mic/camera, pick devices.
2. **Meeting room** — a live participant grid with mic/camera/screen-share controls, backed by LiveKit.

Opening the app mints a meeting id (`meeting-<timestamp>`) and redirects to `/meeting/:meetingId`. That URL is shareable — anyone who opens it lands on the same pre-join flow for the same room, and the id is never regenerated for an existing link.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **livekit-client** for the WebRTC room connection, plus **livekit-server-sdk** for token minting — used directly, not through `@livekit/components-react` (see [Why not `@livekit/components-react`](#why-not-livekitcomponents-react) below)
- CSS Modules, no CSS framework
- **ESLint 9** (flat config, `eslint-config-next`) + **Prettier**
- **Vitest** + **React Testing Library**

One app, one process, one `.env` file. There's no separate backend — the token endpoint is a Next.js Route Handler in the same project (see [Why one app, not a separate backend](#why-one-app-not-a-separate-backend) below). Dependency count is otherwise deliberately small: no state-management library, no UI kit, no data-fetching library. React state and LiveKit's own event model are enough for what this app does.

## Folder structure

```
src/
├── app/                              # Next.js App Router: routes, layout, the token API route
│   ├── layout.tsx                     # Root layout — imports global CSS, wraps children in providers
│   ├── page.tsx                        # "/" — Server Component, mints a meeting id, redirects
│   ├── providers.tsx                   # Client Component: app-wide ErrorBoundary
│   ├── meeting/[meetingId]/
│   │   ├── page.tsx                     # Client Component wrapper (see "ssr: false" in PERFORMANCE.md)
│   │   └── MeetingPageClient.tsx        # Pre-join <-> meeting-room state machine
│   └── api/livekit/token/route.ts       # POST handler — the only file that imports livekit-server-sdk
├── features/
│   ├── prejoin/                       # Pre-join screen: name, local media preview, device selection
│   ├── meeting/                       # Meeting room shell: header, controls, sidebar, layout
│   └── participants/                  # Participant tiles and the hooks that drive them
├── components/                        # Generic, feature-agnostic UI (Button, Modal, Avatar, ErrorMessage, ...)
├── hooks/                              # Cross-cutting hooks (device enumeration, permissions, track attach)
├── lib/
│   ├── livekit/                       # RoomManager — the only file that imports livekit-client directly
│   ├── media/                         # getUserMedia/enumerateDevices wrappers, error mapping
│   └── server/env.ts                   # `server-only` — the only place LIVEKIT_API_SECRET is read
├── utils/                             # Pure functions: meeting id, name validation
├── types/                             # Shared domain types
└── styles/                            # Design tokens + global reset

docs/                                  # ARCHITECTURE.md, PERFORMANCE.md, LIVEKIT.md
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how these layers depend on each other.

## Local development

One process:

```bash
npm install
cp .env.example .env
# edit .env with real LiveKit credentials (see "LiveKit setup" below)
npm run dev
```

Open `http://localhost:3000`.

### Running against a local LiveKit server

You don't need LiveKit Cloud to develop against this app. [LiveKit's OSS server](https://github.com/livekit/livekit) has a `--dev` mode that runs with fixed placeholder credentials:

```bash
livekit-server --dev   # brew install livekit, or see LiveKit's install docs
```

Then point `.env` at it:

```
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
```

This is how the app was exercised end-to-end during development (two browser contexts, real screen share, real mute propagation) without needing a hosted LiveKit project.

### Scripts

| Command                           | Runs                                  |
| --------------------------------- | ------------------------------------- |
| `npm run dev`                     | Next.js dev server (Turbopack)        |
| `npm run build`                   | Production build (typechecks + lints) |
| `npm start`                       | Run the production build              |
| `npm run lint`                    | ESLint                                |
| `npm run typecheck`               | `tsc --noEmit`                        |
| `npm run format` / `format:check` | Prettier write / check                |
| `npm test`                        | Vitest (single run)                   |
| `npm run test:watch`              | Vitest (watch mode)                   |

### Why one app, not a separate backend

Earlier iterations of this project split the token-minting endpoint into a standalone Express server, specifically so `LIVEKIT_API_SECRET` could never be bundled into client-shipped code — Vite inlines `.env` values by explicit opt-in prefix (`VITE_`), and keeping the secret in a wholly separate process removed any chance of that boundary being misconfigured.

Next.js draws the same line differently: **only variables prefixed `NEXT_PUBLIC_` are ever inlined into the client bundle.** Everything else in `.env` — `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` — is available in Server Components and Route Handlers but is never sent to the browser, without needing a second process or a dev-time proxy to enforce it. `src/lib/server/env.ts` additionally imports the `server-only` package, which turns an accidental import of that module from client code into a **build error** rather than a runtime leak. One `.env` file, one `npm install`, one `npm run dev` — the security property is the same, enforced by the framework instead of by process boundaries.

## Environment variables

One file, `.env`, at the project root:

```
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=wss://your-project.livekit.cloud
```

There's currently no `NEXT_PUBLIC_`-prefixed variable in this app at all — the client never needs to know the LiveKit URL directly, it gets `serverUrl` back in the token API's JSON response.

## LiveKit setup

You need three values, all of which go in the root `.env`:

| Variable             | What it is                                                                                               | Where it comes from                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `LIVEKIT_API_KEY`    | Identifies which credential pair minted a token                                                          | LiveKit Cloud project settings, or the `keys:` block of your self-hosted server's config |
| `LIVEKIT_API_SECRET` | Signs the JWT — this is the value that must never reach the browser                                      | Same place as the key, paired with it                                                    |
| `LIVEKIT_URL`        | The **WebSocket** URL the browser connects to (`wss://…` or `ws://…`), not an `http(s)://` dashboard URL | LiveKit Cloud project settings, or your self-hosted server's public address              |

### Option A — LiveKit Cloud

1. Create a project at [cloud.livekit.io](https://cloud.livekit.io).
2. Copy its API key, secret, and WebSocket URL (already `wss://…`) into `.env`.
3. That's it — Cloud handles TLS, TURN, and scaling for you.

### Option B — self-hosted (your own server / VPS)

1. Stand up `livekit-server` (Docker Compose is the easiest path — see the docs and video below). The server's own config file defines the API key/secret pair (a `keys:` map, or a `LIVEKIT_KEYS` env var depending on how you deploy it) — **those are the values that go in `.env`**, not ones you invent independently. If they don't match exactly, the room connection fails with an "invalid token" / `401` error — the token was signed correctly by this app, but the LiveKit server doesn't recognize the key that signed it. (If that happens, verify by checking the deployed server's own config directly — `cat livekit.yaml` or `docker exec <container> cat /etc/livekit.yaml` — rather than assuming either side's code is wrong.)
2. Set `LIVEKIT_URL` to that server's WebSocket address, e.g. `ws://your-vps-ip:7880` for a quick local test, or `wss://your-domain.com` once it's behind TLS.
3. **Plain `ws://` is fine for local development but not for anything real.** LiveKit's own deployment guidance is explicit that a secure deployment needs a domain with a CA-signed TLS certificate (self-signed doesn't work) — without it you also don't get TURN/TLS, which is what lets participants connect from behind restrictive corporate/hotel networks. Once this app itself is served over `https://` (e.g. on Vercel), browsers will additionally block a plain `ws://` connection outright as mixed content.

References (third-party, not maintained by this project — cross-check against LiveKit's own docs if anything looks out of date):

- [LiveKit self-hosting overview](https://docs.livekit.io/transport/self-hosting/) and the [VM/VPS deployment guide](https://docs.livekit.io/home/self-hosting/vm/) — official docs.
- ["How to Self-Host LiveKit on a VPS (Step-by-Step)"](https://www.youtube.com/watch?v=qdh7WkrL3iM) — a walkthrough of the same VPS setup covered above.

### What happens when these values change

`src/lib/server/env.ts` reads `process.env` inside a Route Handler — Next.js loads `.env` once at process startup. Editing `.env` while `npm run dev` is already running does **not** take effect until you restart that process. If you rotate a secret, move to a different LiveKit project, or switch from a self-hosted server to Cloud: edit `.env`, then stop and re-run `npm run dev` (or redeploy, in production).

The client never needs to know any of this changed — it only ever calls `POST /api/livekit/token` with a room name and display name, and gets back a short-lived JWT plus whatever `LIVEKIT_URL` currently is. See [docs/LIVEKIT.md](docs/LIVEKIT.md) for the full token/connect/publish flow.

## Permission handling

Camera/microphone access goes through two independent signals:

- `navigator.permissions.query()` (`useMediaPermissions`) — read-only, best-effort. Safari and Firefox don't implement it for `camera`/`microphone`, so it reports `'unsupported'` there.
- The actual `getUserMedia()` call (`useLocalMedia`) — the ground truth. Its rejection is mapped to a typed `MeetingError` (`lib/media/errors.ts`) that distinguishes "permission denied" (recoverable — user can fix it in browser settings and retry) from "device unavailable" (camera unplugged, or in use by another app).

The UI always trusts the `getUserMedia()` outcome over the Permissions API, since the latter isn't universally supported.

## Performance decisions

Full writeup in [docs/PERFORMANCE.md](docs/PERFORMANCE.md). Short version:

- **`React.memo`** on components that render once per participant (`ParticipantTile`, `ParticipantVideo`, `MicStatus`, ...) or per icon/avatar instance — anywhere the same component type mounts many times and most instances don't change on a given update.
- **`useMemo`** for exactly one thing: the participant-count → grid-column-count mapping (`useMeetingLayout`). Everything else that looks like layout is CSS Grid, not JS.
- **`useCallback`** wherever a callback is a prop into one of the memoized components above, or a dependency of `useSyncExternalStore`.
- **No global state library.** `RoomManager` (see below) is the single source of truth for meeting state; components read from it via `useSyncExternalStore`-based hooks scoped to exactly the slice they need — a participant tile subscribes to _that one participant's_ mic/camera/speaking state, not the whole roster, so a mic toggle from participant A never re-renders participant B's tile.
- **`next/dynamic(..., { ssr: false })`** on the entire `/meeting/[meetingId]` route content — see [Why `ssr: false`](#why-ssr-false-on-the-meeting-route) below.

## React optimization decisions, explained

**Why `React.memo`:** LiveKit fires frequent, high-cardinality events (`ActiveSpeakersChanged`, `ConnectionQualityChanged`) in a room with many participants. Without memoization, any state change touching the room would re-render every tile. `React.memo` combined with narrow, primitive-only props (`participantId: string`, not the whole participant object) means each tile only re-renders when its own subscribed slice changes.

**Why `useMemo` only once:** the spec principle here is "memoize expensive derived values," and there's exactly one meaningfully expensive derivation in this app — mapping participant count to a grid column count. Everything else either is O(1)/trivial (not worth the memoization overhead) or is genuinely a CSS problem (`repeat(var(--grid-columns), minmax(0,1fr))`), and reaching for `useMemo` there would just be indirection around what CSS already does natively.

**Why `useCallback`:** almost exclusively to keep prop references stable into memoized children, and to satisfy `useSyncExternalStore`'s `subscribe`/`getSnapshot` contract (a new function identity every render there means resubscribing every render).

**Why lazy loading:** `MeetingRoom` (LiveKit, the participant grid, all meeting controls) is `React.lazy`-loaded from `MeetingPageClient` — someone who's still deciding whether to join a call never downloads that code. This sits on top of the route-level `next/dynamic({ ssr: false })` split described below — two different jobs (SSR exclusion vs. bundle splitting), same underlying idea.

**Why feature-based architecture:** `prejoin`, `meeting`, and `participants` each own their components/hooks/services. This is what makes "which state re-renders what" traceable — state lives next to the feature that owns it instead of in one shared blob.

**Why local state instead of global state:** the two screens don't need to share reactive state — `MeetingPageClient` holds one plain `session` value handed from pre-join to the meeting room once, at join time. Everything reactive _within_ the meeting room comes from `RoomManager`'s own event stream, which already behaves like an external store — adding Redux/Zustand on top would just be a second source of truth to keep in sync with the first.

**Why LiveKit hooks (custom, not `@livekit/components-react`'s):** see below.

**Why CSS Grid:** the responsive participant layout (1 → large tile, 2 → two columns, 3–9 → auto grid, 10+ → dense grid) is a `grid-template-columns` change driven by one memoized integer, not JavaScript measuring boxes.

### Why `ssr: false` on the meeting route

Every hook that touches the camera/microphone/room connection (`useLocalMedia`, `useMeeting`, `RoomManager`) only calls browser APIs from inside `useEffect` — effects never run during server rendering, so that part is already SSR-safe on its own. The real constraint is `livekit-client` itself: several files under `src/lib/livekit/` and `src/features/*/hooks` import from it at module scope (`import { createLocalVideoTrack } from 'livekit-client'`), and there's no way to guarantee, framework-version to framework-version, that merely _evaluating_ that module is side-effect-free under Node with no `window`/`navigator`/`RTCPeerConnection`. Rather than relying on that being true, `/meeting/[meetingId]/page.tsx` uses `next/dynamic(() => import('./MeetingPageClient'), { ssr: false })`, which excludes that entire module graph from the server bundle and prerendering pass outright — the safest, most explicit way to say "this route is client-only," matching how the app behaved as a Vite SPA before this route existed at all. Next.js only allows `ssr: false` inside a Client Component, which is why `page.tsx` itself is marked `'use client'` rather than being left as the default Server Component.

### Why not `@livekit/components-react`?

The brief allows it "where appropriate." It was evaluated and deliberately not used for the core room/participant rendering: this app's central architectural point is demonstrating direct control over LiveKit's event stream and exactly which React state depends on which event — `@livekit/components-react`'s hooks are a good product choice for shipping fast, but they'd hide the exact re-render boundaries this project exists to show. `livekit-client` is used directly, wrapped in one class (`RoomManager`) that the rest of the app never bypasses.

## Testing

`npm test` runs Vitest against:

- Meeting id generation/parsing (`utils/meetingId.test.ts`)
- Display name validation (`utils/validation.test.ts`, plus a component-level test of `NameInput`'s touched/blur validation UX)
- Device grouping logic (`lib/media/devices.test.ts`)
- getUserMedia error → `MeetingError` mapping (`lib/media/errors.test.ts`)
- Permission-state reporting (`hooks/useMediaPermissions.test.ts`)
- `RoomManager`'s connection lifecycle and event-driven state transitions, including the specific claim this whole architecture rests on — that a mic-mute event notifies only that one participant's subscribers (`lib/livekit/roomManager.test.ts`)

`RoomManager`'s tests mock `livekit-client` itself (it touches real WebRTC APIs that don't exist under jsdom) rather than attempting a real signaling round-trip — consistent with "don't fully automate real WebRTC integration tests unless practical." Vitest runs independently of Next.js's own build pipeline (it uses `@vitejs/plugin-react` purely as a test transform), so this works the same as it did before the Next.js migration. The app was instead verified against a real local LiveKit server (two browser contexts, `livekit-server --dev`) during development; that's a manual/E2E check, not part of `npm test`.

## Accessibility

Every control is a real `<button>` with an `aria-label`, has a visible focus ring, and is reachable by keyboard. Tooltips are supplementary (`role="tooltip"` + `aria-describedby`), never the only label. The settings dialog uses the native `<dialog>` element for built-in focus trapping and Escape-to-close instead of a hand-rolled implementation.

## Known limitations

- Chat and "More" controls are intentionally not implemented (the brief asks for the required set: mic, camera, screen share, participants, leave) — `MeetingControls` is structured so adding them doesn't require reshaping anything.
- No recording/transcription.
- Speaker (audio output) device selection is exposed in the UI but depends on `HTMLMediaElement.setSinkId()`, which not all browsers support; it degrades to a no-op there rather than erroring.
- The `/meeting/[meetingId]` route is entirely client-rendered (see "Why `ssr: false`" above) — there's no server-rendered content or metadata specific to a given meeting, by design, since a video call has nothing meaningful to show a crawler or a pre-hydration user anyway.
