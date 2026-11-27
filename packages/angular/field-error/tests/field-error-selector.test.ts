import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckFieldErrorImports } from '../index';

describe('FieldError selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckFieldError></div>`, { imports: [...CckFieldErrorImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
