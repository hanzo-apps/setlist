import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, ScrollView, Text } from '@hanzo/gui'
import { INK, ACID, MONO, Blast, PosterButton } from '../theme'
import type { Show } from '../model'
import { Shows } from './shows'
import { SetlistDetail } from './setlist'
import { Log } from './log'

type Tab = 'shows' | 'log'

function NavBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PosterButton
      label={label}
      size="$2"
      fontSize={13}
      bg={active ? ACID : 'transparent'}
      fg={active ? INK : ACID}
      line={ACID}
      onPress={onPress}
    />
  )
}

/**
 * Signed-in shell: the band console. A no-router state machine — SHOWS or LOG,
 * and opening a show swaps in its setlist detail. All three surfaces read/write
 * the org-scoped Base collections wired through the IAM token in providers.tsx.
 */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'
  const [tab, setTab] = useState<Tab>('shows')
  const [open, setOpen] = useState<Show | null>(null)

  function go(t: Tab) {
    setOpen(null)
    setTab(t)
  }

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={ACID}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={INK}
        paddingLeft={20}
        paddingRight={20}
        paddingTop={14}
        paddingBottom={14}
        flexWrap="wrap"
        gap={10}
      >
        <XStack alignItems="center" gap={12}>
          <Blast size={26} color={ACID}>Setlist</Blast>
          <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={1} color={ACID} opacity={0.7}>
            @{who}
          </Text>
        </XStack>
        <XStack alignItems="center" gap={8}>
          <NavBtn label="SHOWS" active={tab === 'shows' && !open} onPress={() => go('shows')} />
          <NavBtn label="LOG" active={tab === 'log' && !open} onPress={() => go('log')} />
          <PosterButton label="SIGN OUT" size="$2" fontSize={13} bg="transparent" fg={ACID} line={ACID} onPress={() => logout()} />
        </XStack>
      </XStack>

      <ScrollView flex={1}>
        <YStack padding={20} gap={16} maxWidth={860} width="100%" alignSelf="center">
          {open ? (
            <SetlistDetail show={open} onBack={() => setOpen(null)} />
          ) : tab === 'shows' ? (
            <Shows onOpen={setOpen} />
          ) : (
            <Log />
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
