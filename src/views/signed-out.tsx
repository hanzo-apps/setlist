import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { INK, ACID, MONO, TicketDivider, Blast, PosterButton } from '../theme'

/** A faux ticket barcode — pure flyer decoration. */
function Barcode() {
  const bars = [3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1, 3]
  return (
    <XStack alignItems="flex-end" height={38}>
      {bars.map((w, i) => (
        <YStack key={i} width={w * 2} height={38} marginRight={2} backgroundColor={INK} />
      ))}
    </XStack>
  )
}

/** One blank line of the stage-sheet preview (decorative, no data). */
function SlotLine({ n, label }: { n: string; label: string }) {
  return (
    <XStack alignItems="center" gap={12} paddingTop={6} paddingBottom={6} borderBottomWidth={2} borderColor={INK}>
      <Text fontFamily={MONO} fontSize={16} fontWeight="900" color={INK} width={34}>
        {n}
      </Text>
      <Text fontFamily={MONO} fontSize={15} letterSpacing={1} textTransform="uppercase" color={INK} opacity={0.55}>
        {label}
      </Text>
    </XStack>
  )
}

/**
 * Signed-out landing — the public face of the gig log. One action: PKCE sign-in
 * with Hanzo (hanzo.id). No local credential form; Hanzo IAM owns every
 * credential interaction. This is the honest pre-auth view (real shows and sets
 * live behind sign-in).
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor={ACID} alignItems="center" justifyContent="center" padding={24}>
      <YStack width="100%" maxWidth={960} borderWidth={5} borderColor={INK} backgroundColor={ACID} padding={30} gap={6}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK}>
            Public Gig Log
          </Text>
          <Text fontFamily={MONO} fontSize={13} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK}>
            All Ages · Doors 8
          </Text>
        </XStack>

        <TicketDivider />

        <YStack gap={4}>
          <Blast size={104} color={INK}>Set</Blast>
          <XStack backgroundColor={INK} alignSelf="flex-start" paddingLeft={12} paddingRight={12} paddingTop={2} paddingBottom={4}>
            <Blast size={104} color={ACID}>List</Blast>
          </XStack>
        </YStack>

        <Text fontFamily={MONO} fontSize={22} fontWeight="900" letterSpacing={1} textTransform="uppercase" color={INK} marginTop={10}>
          Every gig. Every song.
        </Text>

        <Text fontSize={17} lineHeight={25} color={INK} maxWidth={620} marginTop={4}>
          A band&rsquo;s public show log with the exact set played at each gig. Fans browse
          past and upcoming shows and open one to read the setlist. Band members sign in
          to log shows and build sets — stored per-org in Hanzo Base.
        </Text>

        <XStack gap={30} marginTop={16} flexWrap="wrap">
          <YStack flex={1} minWidth={240} gap={2}>
            <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={2} textTransform="uppercase" color={INK} marginBottom={4}>
              The Set · Stage Sheet
            </Text>
            <SlotLine n="01" label="Opener" />
            <SlotLine n="02" label="Single" />
            <SlotLine n="03" label="Deep Cut" />
            <SlotLine n="E1" label="Encore" />
          </YStack>

          <YStack alignItems="flex-end" justifyContent="flex-end" gap={10}>
            <Barcode />
            <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={2} color={INK}>
              NO · 001
            </Text>
          </YStack>
        </XStack>

        <TicketDivider />

        <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={12}>
          <PosterButton
            label={isLoading ? 'LOADING…' : 'SIGN IN TO LOG A SHOW'}
            size="$5"
            fontSize={16}
            disabled={isLoading}
            onPress={() => login()}
          />
          <Text fontFamily={MONO} fontSize={12} fontWeight="900" letterSpacing={1} textTransform="uppercase" color={INK}>
            UI @hanzo/gui · Auth @hanzo/iam · Data @hanzo/base
          </Text>
        </XStack>
      </YStack>
    </YStack>
  )
}
