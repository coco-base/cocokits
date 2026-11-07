import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckHintImports } from '../index';

describe('Hint selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckHint></div>`, { imports: [...CckHintImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
