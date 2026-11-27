// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { SvgIcon } from '../../svg-icon';
import { themed } from '../../internal/tests/icon-fixtures';
import { IconButton } from '../index';

afterEach(cleanup);

const icon = <SvgIcon iconName="heart" />;

describe('IconButton accessibility (axe)', () => {
  it.each<[string, ReactElement]>([
    ['aria-label', <IconButton aria-label="Add">{icon}</IconButton>],
    [
      'disabled',
      <IconButton aria-label="Add" disabled>
        {icon}
      </IconButton>,
    ],
    [
      'link',
      <IconButton aria-label="Go" nativeButton={false} render={<a href="#go" />}>
        {icon}
      </IconButton>,
    ],
    [
      'disabled link',
      <IconButton aria-label="Go" nativeButton={false} disabled render={<a href="#go" />}>
        {icon}
      </IconButton>,
    ],
    [
      'toggle',
      <IconButton aria-label="Mute" aria-pressed="true">
        {icon}
      </IconButton>,
    ],
    [
      'labelled icon inside',
      <IconButton>
        <SvgIcon iconName="heart" label="Add" />
      </IconButton>,
    ],
  ])('has no violations: %s', async (_name, ui) => {
    const { container } = render(themed(ui));
    expect((await axe(container)).violations).toEqual([]);
  });
});
