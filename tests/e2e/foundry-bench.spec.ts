import { expect, test } from '@playwright/test';
test('keeps incomplete compilation visibly disabled on every viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Copper Lantern', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build JAR' })).toBeDisabled();
  await expect(page.getByText('Build service pending Phase 2')).toBeVisible();
});
test('updates the editor state on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Copper Lamp' }).click();
  await expect(page.getByRole('heading', { name: 'Copper Lamp', level: 1 })).toBeVisible();
  await page.getByLabel('Light Level').fill('8');
  await expect(page.getByText('✓ Saved')).toBeVisible();
});
