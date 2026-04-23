import { expect, test } from '@playwright/test'

import { browserCheckSearchQuery } from './fixtures/browserChecks'

test('lets guests browse discovery and search flows', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: /watch together, in sync\./i,
    }),
  ).toBeVisible()

  const navigationSearch = page.getByRole('searchbox', {
    name: /search public rooms/i,
  })

  await navigationSearch.fill(browserCheckSearchQuery)
  await expect(
    page.getByRole('link', {
      name: /^Watch Party Central Hosted by casey 18 users$/,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', {
      name: /^Late Night Watch Club Hosted by morgan 7 users$/,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Green Room Ops Hosted by ops/i }),
  ).toHaveCount(0)
  await expect(
    page.getByText(/press enter to open the top match/i),
  ).toBeVisible()
})

test('redirects guests away from protected pages and shows the new 404 copy', async ({
  page,
}) => {
  await page.goto('/create-room')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: /^log in$/i })).toBeVisible()

  await page.goto('/missing')

  await expect(
    page.getByRole('heading', {
      name: /that room drifted off the map/i,
    }),
  ).toBeVisible()
})
