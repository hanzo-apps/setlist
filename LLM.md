# band-setlist — agent notes

A real Hanzo app: a band's public show & setlist tracker. Forked from the
canonical `hanzo-starter`. Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam`
(auth) + `@hanzo/base` (data). Keep it minimal and REAL — every surface must
build and run, no fabricated UI.

## The app

- **Design** — gig-poster brutalism: black-on-acid, oversized all-caps venue
  names, torn-ticket dividers, chunky monospaced dates/numerals. Colors are
  literal (`src/theme.tsx`), not theme tokens, so the flyer look is exact.
- **Views** (`src/views/`):
  - `shows.tsx` — the gig board, upcoming vs. played, ticket-stub cards.
  - `setlist.tsx` — one show's ordered stage sheet + encore + total runtime.
  - `log.tsx` — log a show, keep the song book, build/order a set.
  - `signed-out.tsx` — the public pre-auth landing (the honest thumbnail).
- **Data** (`schema.sql` → Base collections): `shows` (venue, city, date,
  is_upcoming), `songs` (title, duration), `setlist` (show_id, song_id,
  position, encore). `position` (not the reserved word `order`) sequences a set.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in band.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `import.meta.env.VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). Every button is the one `PosterButton` in `src/theme.tsx`.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
- **`Button` takes no top-level `color`.** Put the label in a `Text` child and
  color that (this is exactly why `PosterButton` exists). `Button` uses
  `onPress`; `Input` uses `value`/`onChangeText` and wants a `theme` (we set
  `theme="light"`) rather than a raw `placeholderTextColor` hex.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `src/model.ts` + `src/views/*`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native). Runtime read/write is browser → `VITE_HANZO_BASE_URL`
  with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production needs a `https://*.hanzo.app/auth/callback`
  wildcard on the shared client (or a per-app `hanzo-<app>` client).

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
