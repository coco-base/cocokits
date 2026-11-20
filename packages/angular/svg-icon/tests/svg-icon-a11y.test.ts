import { render } from '@testing-library/angular';
import { provideCckIcons } from '@cocokits/angular-core';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckSvgIconImports } from '../index';
import { testIcons } from './fixtures';

const imports = [...CckSvgIconImports];
const providers = [provideCckIcons({ icons: testIcons })];

describe('SvgIcon accessibility (axe)', () => {
  it.each([
    ['decorative', `<cck-svg-icon iconName="heart" />`],
    ['labelled', `<cck-svg-icon iconName="heart" label="Favourite" />`],
    ['in text', `<p>Rated <cck-svg-icon iconName="heart" label="five stars" /> by readers</p>`],
    ['not found', `<cck-svg-icon iconName="missing" />`],
  ])('has no violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports, providers });
    expect((await axe(container)).violations).toEqual([]);
  });
});
