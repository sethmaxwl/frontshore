import { Button, Group, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { useSearchParams } from 'react-router-dom'

import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { RoomSection } from '@/features/rooms/components/RoomSection'
import { fetchRooms } from '@/lib/api/streamshore'
import { findMatchingRooms } from '@/lib/utils/rooms'

export default function SearchRoomsPage(): JSX.Element {
  const [searchParameters, setSearchParameters] = useSearchParams()
  const query = searchParameters.get('q') ?? ''
  const [draftQuery, setDraftQuery] = useState(query)
  const [prevQuery, setPrevQuery] = useState(query)
  const deferredQuery = useDeferredValue(query)

  if (prevQuery !== query) {
    setPrevQuery(query)
    setDraftQuery(query)
  }

  const roomsQuery = useQuery({
    queryFn: fetchRooms,
    queryKey: ['rooms'],
  })

  const matchingRooms = findMatchingRooms(roomsQuery.data ?? [], deferredQuery)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const nextQuery = draftQuery.trim()

    if (nextQuery.length === 0) {
      setSearchParameters({})
      return
    }

    setSearchParameters({ q: nextQuery })
  }

  return (
    <>
      <PageMetadata
        description="Search the current list of public Streamshore rooms by name."
        title="Streamshore | Search"
      />
      <PageHero
        eyebrow="Room search"
        title="Find the next room faster."
        description="Search is scoped to public rooms. Type to filter instantly — results update as you go."
      >
        <form onSubmit={handleSubmit}>
          <Group gap="sm" align="flex-end" wrap="wrap">
            <TextInput
              aria-label="Search public rooms by name"
              onChange={(event) => {
                setDraftQuery(event.currentTarget.value)
              }}
              placeholder="Search public rooms by name"
              type="search"
              value={draftQuery}
              style={{ flex: 1, minWidth: 240 }}
              size="md"
            />
            <Button type="submit" size="md">
              Search
            </Button>
          </Group>
        </form>

        {query.length > 0 ? (
          <RoomSection
            emptyDescription={`No public rooms matched "${query}".`}
            rooms={matchingRooms}
            title={`${matchingRooms.length} result${matchingRooms.length === 1 ? '' : 's'} for "${query}"`}
          />
        ) : null}
      </PageHero>
    </>
  )
}
