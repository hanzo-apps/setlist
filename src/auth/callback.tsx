import { useEffect, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { YStack, Spinner, Text } from '@hanzo/gui'
import { INK, ACID, RED, MONO, PosterButton } from '../theme'

/**
 * The PKCE return leg. hanzo.id redirects here with `?code=&state=`; the SDK
 * exchanges the code for tokens, then we land on the app root. On failure we
 * show the error and a way back rather than a blank spinner.
 */
export function Callback() {
  const { handleCallback } = useIam()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
      .then(() => window.location.replace('/'))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Sign-in failed'))
  }, [handleCallback])

  return (
    <YStack flex={1} minHeight="100vh" alignItems="center" justifyContent="center" gap={16} backgroundColor={ACID} padding={24}>
      {error ? (
        <>
          <Text color={RED} fontFamily={MONO} fontWeight="900" textTransform="uppercase" letterSpacing={1}>{error}</Text>
          <PosterButton label="BACK TO SIGN IN" onPress={() => window.location.replace('/')} />
        </>
      ) : (
        <>
          <Spinner size="large" color={INK} />
          <Text color={INK} fontFamily={MONO} fontWeight="900" textTransform="uppercase" letterSpacing={2}>Completing sign-in…</Text>
        </>
      )}
    </YStack>
  )
}
