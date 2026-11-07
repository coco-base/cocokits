import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckRadioImports } from '../index';

describe('Radio selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckRadio></div>`, { imports: [...CckRadioImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
