import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckTabNavImports } from '../index';

const imports = [...CckTabNavImports];
const TEXT =
  'CocoKits: a TabNav has no accessible name. Add an aria-label, or an aria-labelledby that points to an element with text, to the element with cckTabNav.';
const nav = (attrs: string): string => `<nav cckTabNav${attrs}><a cckTabNavLink href="#x">X</a></nav>`;

describe('the accessible name warning of a TabNav', () => {
  const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['a dangling aria-labelledby', nav(' aria-labelledby="nowhere"')],
    ['an empty aria-label', nav(' aria-label=""')],
    ['an aria-labelledby that points to an empty element', `<span id="e"></span>${nav(' aria-labelledby="e"')}`],
  ])('warns with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).toHaveBeenCalledWith(TEXT);
  });

  it.each([
    ['an aria-labelledby inside a hidden div', `<div hidden><span id="t">T</span>${nav(' aria-labelledby="t"')}</div>`],
    [
      'an aria-labelledby inside a closed details',
      `<details><span id="t">T</span>${nav(' aria-labelledby="t"')}</details>`,
    ],
  ])('does not warn with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).not.toHaveBeenCalled();
  });
});
