import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckSwitchImports } from '../index';

describe('Switch selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckSwitch></div>`, { imports: [...CckSwitchImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
