import { css } from '@compiled/react'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { useSearchParams } from 'react-router-dom'

import { fieldStyles } from '../../components/primitives/styles.ts'

import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { RoomSection } from '@/features/rooms/components/RoomSection'
import { fetchRooms } from '@/lib/api/streamshore'
import { findMatchingRooms } from '@/lib/utils/rooms'

const formStyles = css({
  display: 'flex',
  gap: '0.75rem',
  maxWidth: '38rem',
  width: '100%',
  '@media (max-width: 640px)': {
    flexDirection: 'column',
  },
})

const buttonStyles = css({
  alignItems: 'center',
  appearance: 'none',
  background:
    'linear-gradient(135deg, rgba(34, 211, 238, 1), rgba(59, 130, 246, 0.88))',
  border: '1px solid rgba(125, 211, 252, 0.4)',
  borderRadius: '999px',
  color: '#04111f',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontWeight: 800,
  justifyContent: 'center',
  minHeight: '3.2rem',
  minWidth: '9rem',
  padding: '0 1.1rem',
})

export default function SearchRoomsPage(): JSX.Element {
  const [searchParameters, setSearchParameters] = useSearchParams()
  const query = searchParameters.get('q') ?? ''
  const [draftQuery, setDraftQuery] = useState(query)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    setDraftQuery(query)
  }, [query])

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
      <AppShell
        eyebrow="Room search"
        title="Find the next room faster."
        description="Search remains scoped to public rooms, but the React version keeps the input responsive and the results grid lightweight with deferred filtering."
      >
        <form css={formStyles} onSubmit={handleSubmit}>
          <input
            css={fieldStyles.input}
            onChange={(event) => {
              setDraftQuery(event.currentTarget.value)
            }}
            placeholder="Search public rooms by name"
            type="search"
            value={draftQuery}
          />
          <button css={buttonStyles} type="submit">
            Search
          </button>
        </form>

        {query.length > 0 ? (
          <RoomSection
            emptyDescription={`No public rooms matched "${query}".`}
            rooms={matchingRooms}
            title={`${matchingRooms.length} result${matchingRooms.length === 1 ? '' : 's'} for "${query}"`}
          />
        ) : null}
      </AppShell>
    </>
  )
}
