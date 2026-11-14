import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckButtonImports } from '../index';

const imports = [...CckButtonImports];

describe('Button accessibility (axe)', () => {
  it.each([
    ['text', `<button cckButton>Save</button>`],
    [
      'icon-only with aria-label',
      `<button cckButton aria-label="Close"><svg aria-hidden="true" width="8" height="8"></svg></button>`,
    ],
    ['disabled', `<button cckButton disabled>Save</button>`],
    ['link', `<a cckButton href="#go">Go</a>`],
    ['disabled link', `<a cckButton href="#go" disabled>Go</a>`],
  ])('has no violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
