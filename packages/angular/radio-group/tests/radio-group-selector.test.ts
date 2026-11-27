import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckRadioGroupImports } from '../index';

describe('RadioGroup selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckRadioGroup></div>`, { imports: [...CckRadioGroupImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
