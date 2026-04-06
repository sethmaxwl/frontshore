import { useEffect } from 'react'

type PageMetadataProps = {
  title: string
  description: string
}

const descriptionSelector = 'meta[name="description"]'

function getOrCreateDescriptionTag(): HTMLMetaElement {
  const existingTag =
    document.head.querySelector<HTMLMetaElement>(descriptionSelector)

  if (existingTag) {
    return existingTag
  }

  const descriptionTag = document.createElement('meta')
  descriptionTag.name = 'description'
  document.head.append(descriptionTag)

  return descriptionTag
}

export function PageMetadata({ title, description }: PageMetadataProps): null {
  useEffect(() => {
    document.title = title
    getOrCreateDescriptionTag().content = description
  }, [description, title])

  return null
}
