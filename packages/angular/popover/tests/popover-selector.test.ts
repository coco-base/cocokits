import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckPopoverImports } from '../index';

describe('Popover selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(
      `<div cckPopoverContent></div><div cckPopoverDescription></div><div cckPopoverArrow></div>`,
      { imports: [...CckPopoverImports] },
    );
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
