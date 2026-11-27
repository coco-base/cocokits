import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckSelectImports } from '../index';

describe('Select selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(
      `<div cckSelect></div><div cckSelectOption></div><div cckSelectOptionGroup></div><div cckSelectSeparator></div>`,
      { imports: [...CckSelectImports] },
    );
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
