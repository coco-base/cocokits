import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckDialogImports } from '../index';

describe('Dialog selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckDialogDescription></div>`, { imports: [...CckDialogImports] });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
