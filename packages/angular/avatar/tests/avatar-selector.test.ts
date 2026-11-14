import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckAvatarImports } from '../index';

describe('Avatar selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckAvatar></div><span cckAvatarFallback></span>`, {
      imports: [...CckAvatarImports],
    });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
