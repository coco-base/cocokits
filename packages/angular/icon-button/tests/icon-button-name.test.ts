import { signal } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckSvgIconImports } from '@cocokits/angular/svg-icon';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckIconButtonImports } from '../index';

const imports = [...CckIconButtonImports, ...CckSvgIconImports];
const providers = [
  provideCckTheme(
    defineThemeConfig({
      name: 'test',
      components: {},
      icons: { plus: { viewBox: '0 0 1 1', paths: [{ d: 'M0 0' }] } },
    }),
  ),
];

const WARNING =
  'CocoKits: an IconButton has no accessible name. Add an aria-label or an aria-labelledby that points to an element with text, or put a cck-svg-icon with a label inside.';

describe('Icon button accessible name (development)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['a button', `<button cckIconButton><cck-svg-icon iconName="plus" /></button>`],
    ['a link', `<a cckIconButton href="#go"><cck-svg-icon iconName="plus" /></a>`],
  ])('logs one CocoKits error for %s with no name', async (_name, template) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(template, { imports, providers });
    await waitFor(() => {
      expect(error).toHaveBeenCalledTimes(1);
    });
    expect(error).toHaveBeenCalledWith(WARNING);
  });

  it.each([
    ['aria-label', `<button cckIconButton aria-label="Add"><cck-svg-icon iconName="plus" /></button>`],
    [
      'aria-labelledby',
      `<span id="name">Add</span><button cckIconButton aria-labelledby="name"><cck-svg-icon iconName="plus" /></button>`,
    ],
    ['a title', `<button cckIconButton title="Add"><cck-svg-icon iconName="plus" /></button>`],
    ['a labelled SvgIcon inside', `<button cckIconButton><cck-svg-icon iconName="plus" label="Add" /></button>`],
    ['a link with aria-label', `<a cckIconButton href="#go" aria-label="Go"><cck-svg-icon iconName="plus" /></a>`],
  ])('does not warn with %s', async (_name, template) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(template, { imports, providers });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(error).not.toHaveBeenCalled();
  });

  it('does not warn when the name is bound with [attr.aria-label]', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const name = signal<string | null>('Add');
    await render(`<button cckIconButton [attr.aria-label]="name()"></button>`, {
      imports,
      providers,
      componentProperties: { name },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(error).not.toHaveBeenCalled();
  });
});
