import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text, Spinner } from '@hanzo/gui'
import { INK, ACID, RED, MONO, Blast, TicketDivider, PosterButton, prettyDate, secondsOf, clock } from '../theme'
import { type Show, type Song, type SetEntry, isEncore } from '../model'

/** One numbered line of the stage sheet. */
function Line({ label, title, duration, accent }: { label: string; title: string; duration: string; accent: string }) {
  return (
    <XStack alignItems="center" gap={14} paddingTop={11} paddingBottom={11} borderBottomWidth={3} borderColor={INK}>
      <XStack minWidth={38} height={30} backgroundColor={accent} alignItems="center" justifyContent="center" paddingLeft={6} paddingRight={6}>
        <Text fontFamily={MONO} fontSize={15} fontWeight="900" color={accent === RED ? INK : ACID}>{label}</Text>
      </XStack>
      <Text flex={1} fontSize={20} fontWeight="800" letterSpacing={-0.5} textTransform="uppercase" color={INK}>
        {title}
      </Text>
      <Text fontFamily={MONO} fontSize={15} fontWeight="900" color={INK} opacity={0.75}>
        {duration}
      </Text>
    </XStack>
  )
}

/**
 * One show's setlist — the ordered stage sheet, with the encore split out below
 * a torn-ticket line and a running total. Reads `setlist` + `songs` (org-scoped)
 * and joins them client-side by id.
 */
export function SetlistDetail({ show, onBack }: { show: Show; onBack: () => void }) {
  const setQ = useQuery<SetEntry>('setlist', { sort: 'position', realtime: false })
  const songsQ = useQuery<Song>('songs', { realtime: false })

  const d = prettyDate(show.date)
  const byId = new Map(songsQ.data.map((s) => [s.id, s]))
  const entries = setQ.data
    .filter((e) => e.show_id === show.id)
    .sort((a, b) => a.position - b.position)
  const main = entries.filter((e) => !isEncore(e))
  const encore = entries.filter(isEncore)
  const total = entries.reduce((sum, e) => sum + secondsOf(byId.get(e.song_id)?.duration ?? '0:00'), 0)
  const loading = setQ.isLoading || songsQ.isLoading

  const titleOf = (e: SetEntry) => (byId.get(e.song_id)?.title ?? '—')
  const durOf = (e: SetEntry) => (byId.get(e.song_id)?.duration ?? '0:00')

  return (
    <YStack gap={18}>
      <XStack>
        <PosterButton label="← ALL SHOWS" size="$3" fontSize={13} bg="transparent" fg={INK} line={INK} onPress={onBack} />
      </XStack>

      {/* Poster header */}
      <YStack backgroundColor={INK} padding={22} gap={8}>
        <XStack justifyContent="space-between" flexWrap="wrap" gap={8}>
          <Text fontFamily={MONO} fontSize={14} fontWeight="900" letterSpacing={2} color={ACID}>
            {d.day} · {d.date} · {d.year}
          </Text>
          <Text fontFamily={MONO} fontSize={14} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={ACID}>
            {show.city}
          </Text>
        </XStack>
        <Blast size={44} color={ACID}>{show.venue}</Blast>
      </YStack>

      {loading ? (
        <XStack gap={10} alignItems="center">
          <Spinner color={INK} /> <Text fontFamily={MONO} color={INK} textTransform="uppercase" letterSpacing={1}>Loading set…</Text>
        </XStack>
      ) : entries.length === 0 ? (
        <YStack borderWidth={4} borderColor={INK} borderStyle="dashed" padding={24} alignItems="center" gap={6}>
          <Blast size={22} color={INK}>No set logged</Blast>
          <Text fontFamily={MONO} fontSize={13} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.7}>
            Build one from the LOG view
          </Text>
        </YStack>
      ) : (
        <YStack>
          <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK} marginBottom={4}>
            The Set
          </Text>
          {main.map((e, i) => (
            <Line key={e.id} label={String(i + 1).padStart(2, '0')} title={titleOf(e)} duration={durOf(e)} accent={INK} />
          ))}

          {encore.length > 0 && (
            <YStack>
              <TicketDivider />
              <XStack alignItems="center" gap={10} marginBottom={4}>
                <XStack backgroundColor={RED} paddingLeft={8} paddingRight={8} paddingTop={2} paddingBottom={2}>
                  <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK}>
                    Encore
                  </Text>
                </XStack>
              </XStack>
              {encore.map((e, i) => (
                <Line key={e.id} label={`E${i + 1}`} title={titleOf(e)} duration={durOf(e)} accent={RED} />
              ))}
            </YStack>
          )}

          <XStack marginTop={16} backgroundColor={INK} padding={12} justifyContent="space-between" flexWrap="wrap" gap={8}>
            <Text fontFamily={MONO} fontSize={14} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={ACID}>
              Total · {entries.length} {entries.length === 1 ? 'Song' : 'Songs'}
            </Text>
            <Text fontFamily={MONO} fontSize={14} fontWeight="900" letterSpacing={2} color={ACID}>
              {clock(total)}
            </Text>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
