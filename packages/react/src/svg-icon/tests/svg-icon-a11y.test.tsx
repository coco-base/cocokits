// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { SvgIcon } from '../index';
import { themed } from '../../internal/tests/icon-fixtures';

afterEach(cleanup);

describe('SvgIcon accessibility (axe)', () => {
  it.each<[string, ReactElement]>([
    ['decorative', <SvgIcon iconName="heart" />],
    ['labelled', <SvgIcon iconName="heart" label="Favourite" />],
    [
      'in text',
      <p>
        Press <SvgIcon iconName="dots" /> to save
      </p>,
    ],
  ])('has no violations: %s', async (_name, ui) => {
    const { container } = render(themed(ui));
    expect((await axe(container)).violations).toEqual([]);
  });
});
