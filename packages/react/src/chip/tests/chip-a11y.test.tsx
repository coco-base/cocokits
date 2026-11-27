// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Chip } from '../index';

afterEach(cleanup);

describe('Chip accessibility (axe)', () => {
  it.each<[string, ReactElement]>([
    ['plain', <Chip>Pizza</Chip>],
    ['removable', <Chip removable>Pizza</Chip>],
    [
      'disabled and removable',
      <Chip removable disabled>
        Pizza
      </Chip>,
    ],
  ])('has no violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });
});
