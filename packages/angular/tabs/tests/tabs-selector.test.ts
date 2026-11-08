import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckTabsImports } from '../index';

describe('Tabs selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckTabs></div><div cckTab></div>`, { imports: [...CckTabsImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
