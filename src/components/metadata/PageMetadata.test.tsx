import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PageMetadata } from '@/components/metadata/PageMetadata'

describe('PageMetadata', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('updates the document title and existing description tag', () => {
    const descriptionTag = document.createElement('meta')
    descriptionTag.name = 'description'
    descriptionTag.content = 'Old description'
    document.head.append(descriptionTag)

    render(
      <PageMetadata
        title="Streamshore room"
        description="Watch together with synchronized playback."
      />,
    )

    expect(document.title).toBe('Streamshore room')
    expect(descriptionTag.content).toBe(
      'Watch together with synchronized playback.',
    )
  })

  it('creates the description tag when one is missing', () => {
    const { rerender } = render(
      <PageMetadata
        title="Create room"
        description="Start a new shared stream."
      />,
    )

    const descriptionTag = document.head.querySelector(
      'meta[name="description"]',
    )

    expect(descriptionTag).toHaveAttribute(
      'content',
      'Start a new shared stream.',
    )

    rerender(
      <PageMetadata
        title="Updated room"
        description="Tune the room details before going live."
      />,
    )

    expect(document.title).toBe('Updated room')
    expect(
      document.head.querySelectorAll('meta[name="description"]'),
    ).toHaveLength(1)
    expect(descriptionTag).toHaveAttribute(
      'content',
      'Tune the room details before going live.',
    )
  })
})
