import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckTabNavImports } from '../index';

describe('TabNav selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckTabNavPanel></div>`, { imports: [...CckTabNavImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
