import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../src/app/appState';
import { renderShell } from '../../src/app/renderShell';

describe('renderShell', () => {
  it('renders the shell with launch controls and game root', () => {
    const html = renderShell(initialAppState());

    expect(html).toContain('One More Orbit');
    expect(html).toContain('data-action="start-run"');
    expect(html).toContain('id="game-root"');
  });
});
