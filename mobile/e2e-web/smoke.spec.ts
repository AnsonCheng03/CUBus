import { expect, test } from '@playwright/test';

test('boots the app shell and navigates to settings', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('nav-home')).toBeVisible();

  await page.getByTestId('nav-settings').click();
  await expect(page.getByTestId('settings-change-language')).toBeVisible();
});

test('shows route-search results with seeded data', async ({ page }) => {
  await page.goto('/route');
  await expect(page.getByTestId('route-search-screen')).toBeVisible();
  await page.getByTestId('route-search-start-input').fill('MTR');
  await page.getByTestId('route-search-start-popup').getByText(/\(MTR\)$/).click();
  await page.getByTestId('route-search-dest-input').fill('NAC');
  await page.getByTestId('route-search-dest-popup').getByText(/\(NAC\)$/).click();
  await expect(page.getByTestId('route-result-0')).toBeVisible();
});
