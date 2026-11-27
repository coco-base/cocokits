import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckCheckboxImports } from '../index';

describe('Checkbox selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckCheckbox></div>`, { imports: [...CckCheckboxImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
