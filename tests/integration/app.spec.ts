import { expect, test } from '@playwright/test';

test('starts a sector run from the shell and shows live HUD state', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'One More Orbit' })).toBeVisible();
  await expect(page.getByText('Awaiting launch command. Sector 1 is calibrated and ready.')).toBeVisible();
  await expect(page.locator('.game-root canvas')).toBeVisible();

  await page.getByRole('button', { name: 'Launch Sector 1' }).click();

  await expect(page.locator('.pitch')).toHaveText('Sector 1');
  await expect(page.getByText('Gravity is winning. Hold boost to widen the orbit.')).toBeVisible();
  await expect(page.locator('.shell')).toHaveAttribute('data-screen', 'running');
  await expect(page.getByRole('button', { name: 'Restart Run' })).toBeVisible();
  await expect(page.getByText('Boost: Space / W / ↑ / Mouse / Touch · Restart: R')).toBeVisible();
});
