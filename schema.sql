-- Hanzo Base schema for Setlist (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped — a member of the band's org reads/writes it (rule:
-- `@request.auth.org_id = org`), other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes (src/model.ts +
-- src/views/*). `position` (not the reserved word `order`) sequences a set.

-- A gig: one row in the public show log.
CREATE TABLE IF NOT EXISTS shows (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  venue       TEXT    NOT NULL,
  city        TEXT    NOT NULL,
  date        TEXT    NOT NULL,           -- ISO YYYY-MM-DD
  is_upcoming INTEGER NOT NULL DEFAULT 1  -- 1 = upcoming, 0 = played
);

-- The band's song book.
CREATE TABLE IF NOT EXISTS songs (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  title    TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '0:00'   -- m:ss
);

-- One song's placement in one show's set (the stage sheet).
CREATE TABLE IF NOT EXISTS setlist (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id  TEXT    NOT NULL,
  song_id  TEXT    NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,     -- order within the set
  encore   INTEGER NOT NULL DEFAULT 0      -- 1 = played in the encore
);
