// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Button } from '../index';

afterEach(cleanup);

describe('Button accessibility (axe)', () => {
  it.each([
    ['text', <Button>Save</Button>],
    [
      'icon-only with aria-label',
      <Button aria-label="Close">
        <svg aria-hidden="true" width="8" height="8" />
      </Button>,
    ],
    ['disabled', <Button disabled>Save</Button>],
    [
      'link',
      <Button nativeButton={false} render={<a href="#go" />}>
        Go
      </Button>,
    ],
    [
      'disabled link',
      <Button nativeButton={false} disabled render={<a href="#go" />}>
        Go
      </Button>,
    ],
  ])('has no violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
