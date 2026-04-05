import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'missing', path: '/missing' },
]

for (const route of routes) {
  test(`${route.name} page has no serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route.path)
    await expect(page.getByRole('main')).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()
    const impactfulViolations = results.violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    )

    expect(impactfulViolations, route.path).toEqual([])
  })
}
