import { useState, type ReactNode } from 'react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Input, Spinner } from '@hanzo/gui'
import { INK, ACID, RED, MONO, PosterButton, prettyDate } from '../theme'
import { type Show, type Song, type SetEntry, isUpcoming, isEncore } from '../model'

const PAPER = '#FFFFFF'

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack borderWidth={4} borderColor={INK} backgroundColor={ACID}>
      <XStack backgroundColor={INK} paddingLeft={14} paddingRight={14} paddingTop={8} paddingBottom={8}>
        <Text fontFamily={MONO} fontSize={14} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={ACID}>
          {title}
        </Text>
      </XStack>
      <YStack padding={16} gap={12}>{children}</YStack>
    </YStack>
  )
}

function Field(props: { value: string; placeholder: string; onChangeText: (v: string) => void; flex?: number; width?: number }) {
  return (
    <Input
      theme="light"
      flex={props.flex}
      width={props.width}
      value={props.value}
      placeholder={props.placeholder}
      onChangeText={props.onChangeText}
      backgroundColor={PAPER}
      color={INK}
      borderColor={INK}
      borderWidth={3}
      borderRadius={0}
      fontFamily={MONO}
    />
  )
}

function Poke({ label, onPress, disabled, tone = 'dark' }: { label: string; onPress: () => void; disabled?: boolean; tone?: 'dark' | 'red' | 'ghost' }) {
  const bg = tone === 'dark' ? INK : tone === 'red' ? RED : 'transparent'
  const fg = tone === 'dark' ? ACID : INK
  return <PosterButton label={label} size="$3" fontSize={13} bg={bg} fg={fg} disabled={disabled} onPress={onPress} />
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <XStack
      cursor="pointer"
      hoverStyle={{ opacity: 0.85 }}
      pressStyle={{ opacity: 0.7 }}
      onPress={onPress}
      backgroundColor={active ? INK : 'transparent'}
      borderWidth={3}
      borderColor={INK}
      paddingLeft={12}
      paddingRight={12}
      paddingTop={7}
      paddingBottom={7}
    >
      <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={1} textTransform="uppercase" color={active ? ACID : INK}>
        {label}
      </Text>
    </XStack>
  )
}

/**
 * The band console — log shows, keep the song book, and build the ordered set
 * for a show. Every write lands in the org-scoped Base collections and the views
 * refetch. Ordering is by tap (append) plus move up/down; encore is a per-row
 * flag. No fake drag surface — the interaction is exactly what it says.
 */
export function Log() {
  const showsQ = useQuery<Show>('shows', { sort: 'date', realtime: false })
  const songsQ = useQuery<Song>('songs', { sort: 'title', realtime: false })
  const setQ = useQuery<SetEntry>('setlist', { sort: 'position', realtime: false })

  const addShow = useMutation('shows', 'create')
  const addSong = useMutation('songs', 'create')
  const delSong = useMutation('songs', 'delete')
  const addEntry = useMutation('setlist', 'create')
  const editEntry = useMutation('setlist', 'update')
  const delEntry = useMutation('setlist', 'delete')

  const [venue, setVenue] = useState('')
  const [city, setCity] = useState('')
  const [date, setDate] = useState('')
  const [up, setUp] = useState(true)

  const [title, setTitle] = useState('')
  const [dur, setDur] = useState('')

  const [pick, setPick] = useState<string | null>(null)

  async function saveShow() {
    if (!venue.trim() || !city.trim() || !date.trim() || addShow.isLoading) return
    await addShow.mutate({ venue: venue.trim(), city: city.trim(), date: date.trim(), is_upcoming: up })
    setVenue(''); setCity(''); setDate(''); setUp(true)
    await showsQ.refetch()
  }

  async function saveSong() {
    if (!title.trim() || addSong.isLoading) return
    await addSong.mutate({ title: title.trim(), duration: dur.trim() || '0:00' })
    setTitle(''); setDur('')
    await songsQ.refetch()
  }

  async function removeSong(id: string) {
    await delSong.mutate({ id })
    await songsQ.refetch()
  }

  const set = pick ? setQ.data.filter((e) => e.show_id === pick).sort((a, b) => a.position - b.position) : []
  const songById = new Map(songsQ.data.map((s) => [s.id, s]))

  async function addToSet(songId: string) {
    if (!pick) return
    const next = set.reduce((m, e) => Math.max(m, e.position), 0) + 1
    await addEntry.mutate({ show_id: pick, song_id: songId, position: next, encore: false })
    await setQ.refetch()
  }

  async function toggleEncore(e: SetEntry) {
    await editEntry.mutate({ id: e.id, encore: !isEncore(e) })
    await setQ.refetch()
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir
    if (j < 0 || j >= set.length) return
    const a = set[idx]
    const b = set[j]
    await editEntry.mutate({ id: a.id, position: b.position })
    await editEntry.mutate({ id: b.id, position: a.position })
    await setQ.refetch()
  }

  async function removeEntry(id: string) {
    await delEntry.mutate({ id })
    await setQ.refetch()
  }

  const pickedShow = showsQ.data.find((s) => s.id === pick)

  return (
    <YStack gap={22}>
      {/* LOG A SHOW */}
      <Panel title="Log a Show">
        <XStack gap={10} flexWrap="wrap">
          <Field value={venue} placeholder="VENUE" onChangeText={setVenue} flex={1} />
          <Field value={city} placeholder="CITY" onChangeText={setCity} flex={1} />
        </XStack>
        <XStack gap={10} flexWrap="wrap" alignItems="center">
          <Field value={date} placeholder="YYYY-MM-DD" onChangeText={setDate} width={170} />
          <Chip label="Upcoming" active={up} onPress={() => setUp(true)} />
          <Chip label="Played" active={!up} onPress={() => setUp(false)} />
          <YStack flex={1} />
          <Poke label={addShow.isLoading ? 'SAVING…' : 'ADD SHOW'} onPress={saveShow} disabled={addShow.isLoading || !venue.trim() || !city.trim() || !date.trim()} />
        </XStack>
        {addShow.error ? <Text color={RED} fontFamily={MONO} fontSize={13}>{addShow.error.message}</Text> : null}
      </Panel>

      {/* SONG BOOK */}
      <Panel title="Song Book">
        <XStack gap={10} flexWrap="wrap" alignItems="center">
          <Field value={title} placeholder="SONG TITLE" onChangeText={setTitle} flex={1} />
          <Field value={dur} placeholder="3:45" onChangeText={setDur} width={110} />
          <Poke label={addSong.isLoading ? 'ADDING…' : 'ADD SONG'} onPress={saveSong} disabled={addSong.isLoading || !title.trim()} />
        </XStack>

        {songsQ.isLoading ? (
          <XStack gap={8} alignItems="center"><Spinner color={INK} /> <Text fontFamily={MONO} color={INK}>Loading…</Text></XStack>
        ) : songsQ.data.length === 0 ? (
          <Text fontFamily={MONO} fontSize={13} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.6}>Book is empty — add songs above.</Text>
        ) : (
          <YStack>
            {songsQ.data.map((s: Song) => (
              <XStack key={s.id} alignItems="center" gap={12} paddingTop={8} paddingBottom={8} borderBottomWidth={2} borderColor={INK}>
                <Text flex={1} fontSize={16} fontWeight="800" textTransform="uppercase" color={INK}>{s.title}</Text>
                <Text fontFamily={MONO} fontSize={14} fontWeight="900" color={INK} opacity={0.7}>{s.duration}</Text>
                <Poke label="✕" tone="ghost" onPress={() => removeSong(s.id)} disabled={delSong.isLoading} />
              </XStack>
            ))}
          </YStack>
        )}
      </Panel>

      {/* BUILD A SET */}
      <Panel title="Build a Set">
        {showsQ.data.length === 0 ? (
          <Text fontFamily={MONO} fontSize={13} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.6}>Log a show first.</Text>
        ) : (
          <>
            <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK} opacity={0.7}>Pick a show</Text>
            <XStack gap={8} flexWrap="wrap">
              {showsQ.data.map((s: Show) => (
                <Chip key={s.id} label={`${s.venue} · ${prettyDate(s.date).date}${isUpcoming(s) ? '' : ' ✓'}`} active={pick === s.id} onPress={() => setPick(s.id)} />
              ))}
            </XStack>

            {pickedShow ? (
              <YStack gap={12} marginTop={4}>
                {/* current set */}
                <YStack>
                  <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK} opacity={0.7} marginBottom={2}>
                    Set for {pickedShow.venue}
                  </Text>
                  {set.length === 0 ? (
                    <Text fontFamily={MONO} fontSize={13} textTransform="uppercase" color={INK} opacity={0.6} paddingTop={6}>Empty — add songs below.</Text>
                  ) : (
                    set.map((e, i) => (
                      <XStack key={e.id} alignItems="center" gap={10} paddingTop={8} paddingBottom={8} borderBottomWidth={2} borderColor={INK}>
                        <XStack minWidth={30} height={26} backgroundColor={isEncore(e) ? RED : INK} alignItems="center" justifyContent="center">
                          <Text fontFamily={MONO} fontSize={13} fontWeight="900" color={isEncore(e) ? INK : ACID}>{String(i + 1).padStart(2, '0')}</Text>
                        </XStack>
                        <Text flex={1} fontSize={16} fontWeight="800" textTransform="uppercase" color={INK}>{songById.get(e.song_id)?.title ?? '—'}</Text>
                        <Poke label="↑" tone="ghost" onPress={() => move(i, -1)} disabled={i === 0 || editEntry.isLoading} />
                        <Poke label="↓" tone="ghost" onPress={() => move(i, 1)} disabled={i === set.length - 1 || editEntry.isLoading} />
                        <Poke label={isEncore(e) ? 'ENC' : 'SET'} tone={isEncore(e) ? 'red' : 'ghost'} onPress={() => toggleEncore(e)} disabled={editEntry.isLoading} />
                        <Poke label="✕" tone="ghost" onPress={() => removeEntry(e.id)} disabled={delEntry.isLoading} />
                      </XStack>
                    ))
                  )}
                </YStack>

                {/* add from book */}
                <YStack>
                  <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK} opacity={0.7} marginBottom={6}>
                    Add from book
                  </Text>
                  {songsQ.data.length === 0 ? (
                    <Text fontFamily={MONO} fontSize={13} textTransform="uppercase" color={INK} opacity={0.6}>No songs yet.</Text>
                  ) : (
                    <XStack gap={8} flexWrap="wrap">
                      {songsQ.data.map((s: Song) => (
                        <Chip key={s.id} label={`+ ${s.title}`} active={false} onPress={() => addToSet(s.id)} />
                      ))}
                    </XStack>
                  )}
                </YStack>
              </YStack>
            ) : (
              <Text fontFamily={MONO} fontSize={13} textTransform="uppercase" color={INK} opacity={0.6} marginTop={4}>Select a show to build its set.</Text>
            )}
          </>
        )}
      </Panel>
    </YStack>
  )
}
