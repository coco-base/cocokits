import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckBadgeContainerImports } from '../index';

describe('BadgeContainer selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckBadgeContainer></div>`, { imports: [...CckBadgeContainerImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
