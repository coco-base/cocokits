import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckSvgIconImports } from '../index';
import { testThemeConfig } from './fixtures';

const imports = [...CckSvgIconImports];
const providers = [provideCckTheme(testThemeConfig)];

describe('SvgIcon accessibility (axe)', () => {
  it.each([
    ['decorative', `<cck-svg-icon iconName="star" />`],
    ['labelled', `<cck-svg-icon iconName="star" label="Favourite" />`],
    ['in text', `<p>Rated <cck-svg-icon iconName="star" label="five stars" /> by readers</p>`],
    ['not found', `<cck-svg-icon iconName="missing" />`],
  ])('has no violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports, providers });
    expect((await axe(container)).violations).toEqual([]);
  });
});
