# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Setlist — a band's public show & setlist tracker. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); `Button`
takes no top-level `color`, so the one `PosterButton` colors a `Text` child.
`schema.sql` (shows / songs / setlist) is the Base data contract. Prove changes
with `npm run build` (tsc + vite). Never build a container image locally — Hanzo
Cloud owns deploys.
