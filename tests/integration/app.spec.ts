import { expect, test } from '@playwright/test';

test('starts a sector run from the shell and shows live HUD state', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'One More Orbit' })).toBeVisible();
  await expect(page.getByText('Awaiting launch command. Sector 1 is calibrated and ready.')).toBeVisible();
  await expect(page.getByText('Sector select')).toBeVisible();
  await expect(page.getByText('Browsing unlocked sectors 1-1. Sector 1 asks for 6 clean laps through 4 rotating mines.')).toBeVisible();
  await expect(page.getByRole('button', { name: '← Prev' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next →' })).toBeDisabled();
  await expect(page.getByText('Amber core pulls inward hard')).toBeVisible();
  await expect(page.getByText('Red ring marks the drift-out fail line')).toBeVisible();
  await expect(page.getByText('Pink mines punish greedy boost lines')).toBeVisible();
  await expect(page.getByText('Flight coach: Launch, then hold boost only when gravity starts dragging you inward.')).toBeVisible();
  await expect(page.locator('[data-field="arena-signal-label"]')).toHaveText('Stand by');
  await expect(page.locator('[data-field="arena-signal-helper"]')).toHaveText('Launch Sector 1 to establish a safe lane between the core and red ring.');
  await expect(page.getByText('No benchmark yet. Finish a run to set the first score target.')).toBeVisible();
  await expect(page.getByText('6 clean laps unlock the next sector pressure spike.')).toBeVisible();
  await expect(page.getByText('Clear 6 clean laps while dodging 4 rotating mines to unlock Sector 2.')).toBeVisible();
  await expect(page.getByText('Next unlock is Sector 2: 7 clean laps, 5 rotating mines.')).toBeVisible();
  await expect(page.getByText('Sector 1 win / fail rules')).toBeVisible();
  await expect(page.getByText('Win: bank 6 clean laps to clear the sector.')).toBeVisible();
  await expect(page.getByText('Fail: crossing the red ring at radius 252 counts as a drift-out.')).toBeVisible();
  await expect(page.getByText('+1 mine · +1 lap')).toBeVisible();
  await expect(page.locator('.goal-track-meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('.game-root canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Launch Sector 1' })).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(page.locator('.pitch')).toHaveText('Sector 1');
  await expect(page.locator('.shell')).toHaveAttribute('data-screen', 'running');
  await expect(page.locator('.goal-track-meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByText('Sector 1 is live. Finish or fail this run before switching sectors.')).toBeVisible();
  await expect(page.getByText('6 clean laps left to clear this sector.')).toBeVisible();
  await expect(page.getByText('Clear 6 clean laps while dodging 4 rotating mines to unlock Sector 2.')).toBeVisible();
  await expect(page.getByText('Next unlock is Sector 2: 7 clean laps, 5 rotating mines.')).toBeVisible();
  await expect(page.locator('[data-field="arena-signal-label"]')).toHaveText('Stable lane');
  await expect(page.locator('[data-field="arena-signal-helper"]')).toHaveText('You are centered in the safe lane. Feather boost only when gravity starts winning.');
  await expect(page.getByRole('button', { name: 'Restart Run' })).toBeVisible();
  await expect(page.getByText('Boost: Space / W / ↑ / Mouse / Touch · Restart: R')).toBeVisible();
});
