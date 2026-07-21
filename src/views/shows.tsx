import type { ReactNode } from 'react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Spinner, Paragraph } from '@hanzo/gui'
import { INK, ACID, MONO, Blast, Stamp, prettyDate } from '../theme'
import { type Show, isUpcoming } from '../model'

/** A ticket-stub gig card. Upcoming = black flyer; past = acid flyer. */
function ShowCard({ show, onOpen }: { show: Show; onOpen: (s: Show) => void }) {
  const dark = isUpcoming(show)
  const bg = dark ? INK : ACID
  const fg = dark ? ACID : INK
  const d = prettyDate(show.date)

  return (
    <XStack
      borderWidth={4}
      borderColor={INK}
      backgroundColor={bg}
      cursor="pointer"
      hoverStyle={{ opacity: 0.9 }}
      pressStyle={{ opacity: 0.8 }}
      onPress={() => onOpen(show)}
    >
      <YStack
        minWidth={118}
        paddingLeft={16}
        paddingRight={16}
        paddingTop={16}
        paddingBottom={16}
        borderRightWidth={4}
        borderStyle="dashed"
        borderColor={fg}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={2} color={fg}>
          {d.day}
        </Text>
        <Text fontFamily={MONO} fontSize={26} fontWeight="900" letterSpacing={-1} color={fg}>
          {d.date}
        </Text>
        <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={2} color={fg} opacity={0.75}>
          {d.year}
        </Text>
      </YStack>

      <YStack flex={1} paddingLeft={18} paddingRight={18} paddingTop={16} paddingBottom={16} gap={4} justifyContent="center">
        <Blast size={30} color={fg}>{show.venue}</Blast>
        <Text fontFamily={MONO} fontSize={14} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={fg} opacity={0.85}>
          {show.city}
        </Text>
      </YStack>

      <YStack paddingLeft={14} paddingRight={16} paddingTop={16} paddingBottom={16} alignItems="flex-end" justifyContent="space-between" gap={12}>
        {dark
          ? <Stamp label="Upcoming" line={ACID} fill={ACID} ink={INK} />
          : <Stamp label="Played" line={INK} fill={INK} ink={ACID} />}
        <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={1} textTransform="uppercase" color={fg}>
          View set →
        </Text>
      </YStack>
    </XStack>
  )
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <YStack gap={12}>
      <XStack alignItems="center" gap={12}>
        <Blast size={30} color={INK}>{title}</Blast>
        <XStack backgroundColor={INK} paddingLeft={8} paddingRight={8} paddingTop={1} paddingBottom={1}>
          <Text fontFamily={MONO} fontSize={15} fontWeight="900" color={ACID}>{count}</Text>
        </XStack>
      </XStack>
      {children}
    </YStack>
  )
}

/**
 * The show board — every gig, split upcoming vs. played, newest-relevant first.
 * Tap a card to open its setlist. Reads the org-scoped `shows` collection.
 */
export function Shows({ onOpen }: { onOpen: (s: Show) => void }) {
  const { data, isLoading, error } = useQuery<Show>('shows', { sort: 'date', realtime: false })

  if (isLoading) {
    return (
      <XStack gap={10} alignItems="center">
        <Spinner color={INK} /> <Text fontFamily={MONO} color={INK} textTransform="uppercase" letterSpacing={1}>Loading the log…</Text>
      </XStack>
    )
  }
  if (error) {
    return (
      <Paragraph color={INK}>
        Couldn&rsquo;t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you&rsquo;re signed in.
      </Paragraph>
    )
  }

  const upcoming = data.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date))
  const past = data.filter((s) => !isUpcoming(s)).sort((a, b) => b.date.localeCompare(a.date))

  if (data.length === 0) {
    return (
      <YStack borderWidth={4} borderColor={INK} borderStyle="dashed" padding={28} alignItems="center" gap={8}>
        <Blast size={26} color={INK}>No shows yet</Blast>
        <Text fontFamily={MONO} fontSize={14} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.7}>
          Head to LOG to add your first gig
        </Text>
      </YStack>
    )
  }

  return (
    <YStack gap={26}>
      <Section title="Upcoming" count={upcoming.length}>
        {upcoming.length === 0 ? (
          <Text fontFamily={MONO} fontSize={14} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.6}>
            Nothing booked — yet.
          </Text>
        ) : (
          <YStack gap={12}>{upcoming.map((s) => <ShowCard key={s.id} show={s} onOpen={onOpen} />)}</YStack>
        )}
      </Section>

      <Section title="Past Shows" count={past.length}>
        {past.length === 0 ? (
          <Text fontFamily={MONO} fontSize={14} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.6}>
            No played shows logged.
          </Text>
        ) : (
          <YStack gap={12}>{past.map((s) => <ShowCard key={s.id} show={s} onOpen={onOpen} />)}</YStack>
        )}
      </Section>
    </YStack>
  )
}
