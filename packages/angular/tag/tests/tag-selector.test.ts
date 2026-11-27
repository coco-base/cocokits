import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckTagImports } from '../index';

describe('Tag selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<span cckTag>Paid</span>`, { imports: [...CckTagImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
