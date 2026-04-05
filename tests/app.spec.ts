import { expect, test } from '@playwright/test'

test('navigates between starter routes', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: /a modern react frontend foundation/i,
    }),
  ).toBeVisible()

  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^about$/i })
    .click()

  await expect(
    page.getByRole('heading', {
      name: /react router is now part of the app shell/i,
    }),
  ).toBeVisible()

  await page.goto('/missing')

  await expect(
    page.getByRole('heading', {
      name: /that route does not exist/i,
    }),
  ).toBeVisible()
})
