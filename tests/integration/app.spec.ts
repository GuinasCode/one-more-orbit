import { expect, test } from '@playwright/test';

test('starts a sector run from the shell and shows live HUD state', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'One More Orbit' })).toBeVisible();
  await expect(page.getByText('Awaiting launch command. Sector 1 is calibrated and ready.')).toBeVisible();
  await expect(page.getByText('Amber core pulls inward hard')).toBeVisible();
  await expect(page.getByText('Red ring marks the drift-out fail line')).toBeVisible();
  await expect(page.getByText('Pink mines punish greedy boost lines')).toBeVisible();
  await expect(page.getByText('Flight coach: Launch, then hold boost only when gravity starts dragging you inward.')).toBeVisible();
  await expect(page.getByText('6 clean laps unlock the next sector pressure spike.')).toBeVisible();
  await expect(page.getByText('Clear 6 clean laps while dodging 4 rotating mines to unlock Sector 2.')).toBeVisible();
  await expect(page.locator('.goal-track-meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('.game-root canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Launch Sector 1' })).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(page.locator('.pitch')).toHaveText('Sector 1');
  await expect(page.locator('.shell')).toHaveAttribute('data-screen', 'running');
  await expect(page.locator('.goal-track-meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByText('6 clean laps left to clear this sector.')).toBeVisible();
  await expect(page.getByText('Clear 6 clean laps while dodging 4 rotating mines to unlock Sector 2.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restart Run' })).toBeVisible();
  await expect(page.getByText('Boost: Space / W / ↑ / Mouse / Touch · Restart: R')).toBeVisible();
});
