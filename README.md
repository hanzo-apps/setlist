# Setlist — Show &amp; Setlist Tracker

**Every gig. Every song.** A band's public gig log with per-show setlists, built
on Hanzo. Fans browse past and upcoming shows and open a show to read the exact
set played; band members sign in to log shows and build sets.

A real, buildable [Hanzo](https://hanzo.ai) app — fork it on
[hanzo.app](https://hanzo.app) and deploy it live on Hanzo Cloud.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. 100% gui primitives — no Tailwind, no
  second kit.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Shows, songs, and setlists are real Base
  collections provisioned from [`schema.sql`](./schema.sql).

## Design

Gig-poster brutalism — high-contrast black-on-acid, oversized all-caps venue
names, torn-ticket dividers, chunky monospaced dates, numbered setlist rows like
a stage sheet. Loud, DIY flyer energy.

## Views

| View | What it does |
| --- | --- |
| **Shows** | The gig board — upcoming and past shows as ticket-stub cards. Tap one to open its set. |
| **Setlist** | One show's ordered stage sheet, encore split out below a torn-ticket line, with total runtime. |
| **Log** | Log a show, keep the song book, and build a set — tap to add, move up/down to order, flag the encore. |

## Data model (`schema.sql` → Base collections)

| Collection | Fields |
| --- | --- |
| `shows` | `venue`, `city`, `date`, `is_upcoming` |
| `songs` | `title`, `duration` (`m:ss`) |
| `setlist` | `show_id`, `song_id`, `position`, `encore` |

Base manages `id`/`created`/`updated`/`owner`/`org` and scopes every row to the
band's org (rule `@request.auth.org_id = org`). `position` sequences a set —
`order` is a reserved SQL word, so the column is named `position`.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `react-native-web` | `^0.21.0` |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_IAM_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback`. A per-app client is provisioned at deploy. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base stamps `owner`+`org` from
the verified IAM principal and scopes every row to the caller's org. At runtime
the views read/write those collections through `@hanzo/base/react`
(`useQuery`/`useMutation`) carrying the IAM token.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  theme.tsx         gig-poster palette + shared atoms (TicketDivider, PosterButton)
  model.ts          Show / Song / SetEntry types + flag helpers
  lib/base.ts       BaseClient carrying the IAM bearer token
  auth/callback.tsx PKCE return leg
  views/            signed-out · home · shows · setlist · log
schema.sql          databaseSchema -> Base collections on publish
hanzo.yml           Hanzo Cloud build/deploy manifest
```
