import { describe, expect, it } from 'vitest';
import { defaultProgressionState } from '../../src/game/core/progression';
import { initialAppState } from '../../src/app/appState';
import { renderShell } from '../../src/app/renderShell';

describe('renderShell', () => {
  it('renders the shell with launch controls, stats, and game root', () => {
    const html = renderShell(initialAppState(defaultProgressionState()));

    expect(html).toContain('One More Orbit');
    expect(html).toContain('data-action="primary-run-action"');
    expect(html).toContain('data-field="best-score"');
    expect(html).toContain('id="game-root"');
    expect(html).toContain('Boost: Space / W / ↑ / Mouse / Touch');
  });
});
