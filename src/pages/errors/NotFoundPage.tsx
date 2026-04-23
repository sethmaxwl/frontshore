import { Anchor, Button, Image, Stack } from '@mantine/core'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

import notFoundIllustrationUrl from '@/assets/404.svg'
import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { dispatchRoomSearchFocus } from '@/components/navigation/roomSearch'

export default function NotFoundPage(): JSX.Element {
  return (
    <>
      <PageMetadata
        description="The Streamshore room or route you requested could not be found."
        title="Streamshore | Not Found"
      />
      <PageHero
        eyebrow="404"
        title="That room drifted off the map."
        description="This link does not point to a room or route we can open."
      >
        <Stack align="center" gap="lg" pb="xl">
          <Image
            alt="A floating 404 illustration"
            src={notFoundIllustrationUrl}
            maw={416}
            w="100%"
          />
          <Button component={Link} to="/" size="md">
            Return to discovery
          </Button>
          <Anchor
            component="button"
            onClick={() => {
              dispatchRoomSearchFocus()
            }}
            type="button"
          >
            Or search from the navigation
          </Anchor>
        </Stack>
      </PageHero>
    </>
  )
}
