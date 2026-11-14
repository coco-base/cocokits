import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckFormFieldImports } from '../index';

describe('FormField selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckFormField></div>`, { imports: [...CckFormFieldImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
