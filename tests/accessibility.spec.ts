import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { browserCheckSearchQuery } from './fixtures/browserChecks'

const routes = [
  {
    heading: /watch together without the old frontend drag/i,
    name: 'discover',
    path: '/',
  },
  {
    heading: /find the next room faster/i,
    name: 'search',
    path: `/search?q=${browserCheckSearchQuery}`,
  },
  {
    heading: /^log in$/i,
    name: 'login',
    path: '/login',
  },
  {
    heading: /that room drifted off the map/i,
    name: 'missing',
    path: '/missing',
  },
]

for (const route of routes) {
  test(`${route.name} page has no serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route.path)
    await expect(
      page.getByRole('heading', { name: route.heading }),
    ).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    const impactfulViolations = results.violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    )

    expect(impactfulViolations, route.path).toEqual([])
  })
}
