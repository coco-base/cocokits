import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckTooltipImports } from '../index';

describe('Tooltip selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckTooltipContent></div><div cckTooltipArrow></div>`, {
      imports: [...CckTooltipImports],
    });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
