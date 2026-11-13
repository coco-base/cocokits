import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckSvgIconImports } from '@cocokits/angular/svg-icon';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
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

describe('Icon button accessibility (axe)', () => {
  it.each([
    ['named by aria-label', `<button cckIconButton aria-label="Add item"><cck-svg-icon iconName="plus" /></button>`],
    ['named by a labelled icon', `<button cckIconButton><cck-svg-icon iconName="plus" label="Add item" /></button>`],
    ['disabled', `<button cckIconButton aria-label="Add item" disabled><cck-svg-icon iconName="plus" /></button>`],
    ['toggle', `<button cckIconButton aria-label="Mute" aria-pressed="true"><cck-svg-icon iconName="plus" /></button>`],
    ['link', `<a cckIconButton href="#go" aria-label="Open"><cck-svg-icon iconName="plus" /></a>`],
    ['disabled link', `<a cckIconButton href="#go" aria-label="Open" disabled><cck-svg-icon iconName="plus" /></a>`],
  ])('has no violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports, providers });
    expect((await axe(container)).violations).toEqual([]);
  });
});
