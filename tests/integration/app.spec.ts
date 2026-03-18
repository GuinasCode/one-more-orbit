import { expect, test } from '@playwright/test';

test('starts the prototype run from the landing shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'One More Orbit' })).toBeVisible();
  await expect(page.getByText('Awaiting launch command.')).toBeVisible();
  await expect(page.locator('.game-root canvas')).toBeVisible();

  await page.getByRole('button', { name: 'Start Prototype Run' }).click();

  await expect(page.getByText('Prototype arena online. Survive the pull and chase the next orbit.')).toBeVisible();
  await expect(page.locator('.shell')).toHaveAttribute('data-screen', 'running');
  await expect(page.getByRole('button', { name: 'Run Active' })).toBeDisabled();
});
