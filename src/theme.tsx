import type { ReactNode } from 'react'
import { XStack, YStack, Text, Button } from '@hanzo/gui'

/**
 * Setlist's visual language — gig-poster brutalism. High-contrast black-on-acid,
 * chunky monospaced numerals, torn-ticket dividers. These are literal colors on
 * @hanzo/gui primitives (not theme tokens) so the flyer look is exact and does
 * not shift with the ambient theme. One palette, in one place.
 */
export const INK = '#0B0B0B'
export const ACID = '#F4FF2E'
export const RED = '#FF2E20'
export const BONE = '#F5F1E6'

/** Monospace family — dates, durations, numerals read like a printed stage sheet. */
export const MONO = 'monospace'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** Split a `YYYY-MM-DD` string into flyer parts; tolerant of anything else. */
export function prettyDate(iso: string): { day: string; date: string; year: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return { day: '', date: iso.trim().toUpperCase(), year: '' }
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay()
  return { day: DAYS[wd] ?? '', date: `${MONTHS[mo - 1] ?? ''} ${String(d).padStart(2, '0')}`, year: String(y) }
}

/** Parse a `m:ss` duration to seconds (0 if it isn't clock-shaped). */
export function secondsOf(duration: string): number {
  const m = /^(\d+):(\d{1,2})$/.exec(duration.trim())
  if (!m) return 0
  return Number(m[1]) * 60 + Number(m[2])
}

/** Format a running total of seconds back to `m:ss`. */
export function clock(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * A torn-ticket perforation line: a dashed rule with a punch-hole at each end
 * (the negative margins overhang the card edge so it reads as a tear).
 */
export function TicketDivider({ color = INK }: { color?: string }) {
  return (
    <XStack width="100%" alignItems="center" marginTop={14} marginBottom={14}>
      <YStack width={18} height={18} borderRadius={999} backgroundColor={color} marginLeft={-9} />
      <YStack flex={1} height={0} borderTopWidth={4} borderStyle="dashed" borderColor={color} marginLeft={8} marginRight={8} />
      <YStack width={18} height={18} borderRadius={999} backgroundColor={color} marginRight={-9} />
    </XStack>
  )
}

/** A hard-edged rubber-stamp label — LIVE / PAST / ENCORE / SOLD OUT. */
export function Stamp({ label, line = INK, fill = 'transparent', ink = INK }: { label: string; line?: string; fill?: string; ink?: string }) {
  return (
    <XStack borderWidth={3} borderColor={line} backgroundColor={fill} paddingLeft={8} paddingRight={8} paddingTop={2} paddingBottom={2} alignSelf="flex-start">
      <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={1} textTransform="uppercase" color={ink}>
        {label}
      </Text>
    </XStack>
  )
}

/** Oversized all-caps flyer type — the loud venue names and section heads. */
export function Blast({ children, size = 34, color = INK }: { children: ReactNode; size?: number; color?: string }) {
  return (
    <Text fontSize={size} lineHeight={size} fontWeight="900" letterSpacing={-1.5} textTransform="uppercase" color={color}>
      {children}
    </Text>
  )
}

type PosterSize = '$2' | '$3' | '$4' | '$5'

/**
 * A chunky poster button. Tamagui's Button takes no top-level `color`, so the
 * label is a `Text` child that carries every text style — the one way we style
 * buttons across the app.
 */
export function PosterButton({
  label,
  onPress,
  disabled,
  bg = INK,
  fg = ACID,
  line = INK,
  size = '$4',
  fontSize = 14,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  bg?: string
  fg?: string
  line?: string
  size?: PosterSize
  fontSize?: number
}) {
  return (
    <Button size={size} backgroundColor={bg} borderRadius={0} borderWidth={3} borderColor={line} disabled={disabled} onPress={onPress}>
      <Text fontFamily={MONO} fontWeight="900" letterSpacing={1} fontSize={fontSize} textTransform="uppercase" color={fg}>
        {label}
      </Text>
    </Button>
  )
}
