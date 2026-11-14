import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckBadgeImports } from '../index';

describe('Badge selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckBadge></div>`, { imports: [...CckBadgeImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
