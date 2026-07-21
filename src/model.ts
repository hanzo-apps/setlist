import type { BaseRecord } from '@hanzo/base/react'

/**
 * The three collections provisioned from schema.sql. Base stamps every row with
 * `id`/`created`/`updated`/`owner`/`org`; these are the app-owned fields.
 */

/** A gig — one line in the band's public show log. */
export interface Show extends BaseRecord {
  venue: string
  city: string
  /** ISO `YYYY-MM-DD`. */
  date: string
  /** Upcoming vs. already played. */
  is_upcoming: boolean
}

/** A song in the band's book. `duration` is `m:ss` text (e.g. "3:45"). */
export interface Song extends BaseRecord {
  title: string
  duration: string
}

/** One placement of a song in one show's set. `position` orders the stage sheet. */
export interface SetEntry extends BaseRecord {
  show_id: string
  song_id: string
  position: number
  encore: boolean
}

/** Coerce a Base boolean-ish flag (may arrive as 1/0 or "1"/"0") to a boolean. */
function flag(v: unknown): boolean {
  return v === true || v === 1 || v === '1'
}

/** Whether a show is upcoming (vs. already played). */
export function isUpcoming(s: Show): boolean {
  return flag(s.is_upcoming)
}

/** Whether a set entry is an encore song. */
export function isEncore(e: SetEntry): boolean {
  return flag(e.encore)
}
