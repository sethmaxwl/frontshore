import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const [kind, rawName, rawComponentName] = process.argv.slice(2)

if (!kind || !rawName || !['feature', 'page'].includes(kind)) {
  console.error(
    'Usage: yarn generate:page <name> | yarn generate:feature <name> [ComponentName]',
  )
  process.exit(1)
}

const words = splitWords(rawName)

if (words.length === 0) {
  console.error('Please provide a non-empty page or feature name.')
  process.exit(1)
}

const rootDir = process.cwd()
const slug = words.join('-')
const pascalName = words.map(capitalize).join('')
const displayName = words.map(capitalize).join(' ')

if (kind === 'page') {
  await scaffoldPage({ rootDir, slug, pascalName, displayName })
} else {
  const componentWords =
    rawComponentName && splitWords(rawComponentName).length > 0
      ? splitWords(rawComponentName)
      : [...words, 'section']

  await scaffoldFeature({
    rootDir,
    slug,
    featureName: pascalName,
    componentName: componentWords.map(capitalize).join(''),
  })
}

function splitWords(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase())
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toClassName(slugValue, suffix) {
  return `${slugValue}-${suffix}`
}

async function writeTextFile(rootDir, filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, contents, { flag: 'wx' })
  console.log(`Created ${path.relative(rootDir, filePath)}`)
}

async function scaffoldPage({ rootDir, slug, pascalName, displayName }) {
  const componentName = `${pascalName}Page`
  const pageDir = path.join(rootDir, 'src', 'pages', slug)
  const cssFileName = `${slug}-page.css`
  const block = toClassName(slug, 'page')

  await writeTextFile(
    rootDir,
    path.join(pageDir, `${componentName}.tsx`),
    `import { AppShell } from '@/components/layout/AppShell'\nimport './${cssFileName}'\n\nexport function ${componentName}() {\n  return (\n    <AppShell\n      eyebrow="New page"\n      title="${displayName} page"\n      description="Replace this starter copy with the actual page intent."\n    >\n      <section className="${block}">\n        <p>Start composing feature modules here.</p>\n      </section>\n    </AppShell>\n  )\n}\n`,
  )

  await writeTextFile(
    rootDir,
    path.join(pageDir, `${componentName}.test.tsx`),
    `import { render, screen } from '@testing-library/react'\nimport { MemoryRouter } from 'react-router-dom'\nimport { describe, expect, it } from 'vitest'\nimport { ${componentName} } from './${componentName}'\n\ndescribe('${componentName}', () => {\n  it('renders the page heading', () => {\n    render(\n      <MemoryRouter>\n        <${componentName} />\n      </MemoryRouter>,\n    )\n\n    expect(\n      screen.getByRole('heading', {\n        name: /${displayName} page/i,\n      }),\n    ).toBeInTheDocument()\n  })\n})\n`,
  )

  await writeTextFile(
    rootDir,
    path.join(pageDir, cssFileName),
    `.${block} {\n  padding: 2rem;\n  border: 1px solid var(--color-border);\n  border-radius: 24px;\n  background: var(--color-surface);\n  box-shadow: var(--shadow-card);\n}\n`,
  )

  console.log('Next step: register the page in src/app/routes/AppRoutes.tsx.')
}

async function scaffoldFeature({ rootDir, slug, featureName, componentName }) {
  const featureDir = path.join(rootDir, 'src', 'features', slug)
  const componentDir = path.join(featureDir, 'components')
  const cssFileName = `${slug}.css`
  const block = toClassName(slug, 'feature')

  await writeTextFile(
    rootDir,
    path.join(componentDir, `${componentName}.tsx`),
    `import '../${cssFileName}'\n\nexport function ${componentName}() {\n  return (\n    <section className="${block}">\n      <h2>${componentName}</h2>\n      <p>Replace this starter content with the new feature UI.</p>\n    </section>\n  )\n}\n`,
  )

  await writeTextFile(
    rootDir,
    path.join(componentDir, `${componentName}.stories.tsx`),
    `import type { Meta, StoryObj } from '@storybook/react-vite'\nimport { ${componentName} } from './${componentName}'\n\nconst meta = {\n  title: 'Features/${featureName}/${componentName}',\n  component: ${componentName},\n} satisfies Meta<typeof ${componentName}>\n\nexport default meta\n\ntype Story = StoryObj<typeof meta>\n\nexport const Default: Story = {}\n`,
  )

  await writeTextFile(
    rootDir,
    path.join(componentDir, `${componentName}.test.tsx`),
    `import { render, screen } from '@testing-library/react'\nimport { describe, expect, it } from 'vitest'\nimport { ${componentName} } from './${componentName}'\n\ndescribe('${componentName}', () => {\n  it('renders the feature heading', () => {\n    render(<${componentName} />)\n\n    expect(\n      screen.getByRole('heading', {\n        name: /${componentName}/i,\n      }),\n    ).toBeInTheDocument()\n  })\n})\n`,
  )

  await writeTextFile(
    rootDir,
    path.join(featureDir, cssFileName),
    `.${block} {\n  display: grid;\n  gap: 0.75rem;\n  padding: 1.5rem;\n  border: 1px solid var(--color-border);\n  border-radius: 24px;\n  background: var(--color-surface);\n  box-shadow: var(--shadow-card);\n}\n`,
  )

  console.log(
    `Next step: compose ${componentName} from a page or shared component.`,
  )
}
