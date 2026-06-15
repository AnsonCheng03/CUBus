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
  await expect(page.getByTestId('route-result-0')).toBeVisible();
});
