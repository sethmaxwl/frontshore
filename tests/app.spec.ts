import { expect, test } from '@playwright/test'

import {
  browserCheckRooms,
  browserCheckSearchQuery,
} from './fixtures/browserChecks'

test('lets guests browse discovery and search flows', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: /watch together without the old frontend drag/i,
    }),
  ).toBeVisible()

  await page.getByRole('link', { name: /search rooms/i }).click()

  await expect(
    page.getByRole('heading', {
      name: /find the next room faster/i,
    }),
  ).toBeVisible()
  await expect(page).toHaveURL(
    new RegExp(String.raw`/search\?q=${browserCheckSearchQuery}$`),
  )
  await expect(
    page.getByRole('heading', { name: /^2 results for "watch"$/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: browserCheckRooms[0].name }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: browserCheckRooms[1].name }),
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
