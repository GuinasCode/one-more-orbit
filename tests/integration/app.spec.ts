import { expect, test } from '@playwright/test';

test('starts a sector run from the shell and updates the safe-lane HUD', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'One More Orbit' })).toBeVisible();
  await expect(page.getByText('Hold anywhere to boost out. Release before the red ring.')).toBeVisible();
  await expect(page.getByText('Sector select')).toBeVisible();
  await expect(page.getByText('Sector 1 is the opener: 4 clean laps with a forgiving launch lane.')).toBeVisible();
  await expect(page.getByRole('button', { name: '← Prev' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next →' })).toBeDisabled();
  await expect(page.locator('.pill-list li').nth(0)).toHaveText('Hold anywhere to boost out');
  await expect(page.locator('.pill-list li').nth(1)).toHaveText('Release before the red ring');
  await expect(page.locator('.pill-list li').nth(2)).toHaveText('Avoid pink mines and finish the laps');
  await expect(page.getByText('Flight coach: Hold only when the ship starts falling inward. Release before the red ring.')).toBeVisible();
  await expect(page.locator('[data-field="arena-signal-label"]')).toHaveText('Stand by');
  await expect(page.locator('[data-field="arena-signal-helper"]')).toHaveText('Tap launch, then keep the ship between the core and red ring.');
  await expect(page.getByText('Clear 4 clean laps to finish your first sector.')).toBeVisible();
  await expect(page.locator('.score-chase')).toHaveAttribute('hidden', '');
  await expect(page.locator('.sector-briefing')).toHaveAttribute('hidden', '');
  await expect(page.locator('.next-pressure')).toHaveAttribute('hidden', '');
  await expect(page.locator('.outcome-guide')).toHaveAttribute('hidden', '');
  await expect(page.locator('.danger-legend')).toHaveAttribute('hidden', '');
  await expect(page.getByText('Safe radius window for Sector 1: launch at 172 and stay between the amber core and red drift ring.')).toBeVisible();
  await expect(page.locator('[data-field="lane-window-range"]')).toHaveText('62-272 radius');
  await expect(page.locator('[data-field="lane-window-current"]')).toHaveText('Current 172');
  await expect(page.locator('.lane-window-meter')).toHaveAttribute('aria-valuenow', '52');
  await expect(page.locator('.goal-track-meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('.game-root canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Launch Sector 1' })).toBeFocused();
  await expect(page.locator('.shell')).toHaveAttribute('data-first-run-intro', 'true');

  await page.keyboard.press('Enter');

  await expect(page.locator('.shell')).not.toHaveAttribute('data-screen', 'start');
  await expect(page.locator('.shell')).toHaveAttribute('data-first-run-intro', 'false');
  await expect(page.getByRole('button', { name: /Restart Run|Retry Sector 1|Launch Sector 2/ })).toBeVisible();
  await expect(page.locator('[data-field="lane-window-current"]')).not.toHaveText('Current 172');
  await expect(page.locator('.lane-window-meter')).not.toHaveAttribute('aria-valuenow', '52');
  await expect(page.getByText('Boost: Space / W / ↑ / Mouse / Touch · Restart: R')).toBeVisible();
  await expect(page.locator('.score-chase')).not.toHaveAttribute('hidden', '');
  await expect(page.locator('.outcome-guide')).not.toHaveAttribute('hidden', '');
});
