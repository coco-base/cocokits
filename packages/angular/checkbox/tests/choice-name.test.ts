import { render } from '@testing-library/angular';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckSwitchImports } from '@cocokits/angular/switch';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';

const imports = [...CckCheckboxImports, ...CckSwitchImports, ...CckRadioImports];
const FIX =
  'Put the caption text inside it, or add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.';
const TEXT: Record<string, string> = {
  'cck-checkbox': `CocoKits: a Checkbox or Switch has no accessible name. ${FIX}`,
  'cck-switch': `CocoKits: a Checkbox or Switch has no accessible name. ${FIX}`,
  'cck-radio': `CocoKits: a Radio has no accessible name. ${FIX}`,
};

describe.each(['cck-checkbox', 'cck-switch', 'cck-radio'])('the accessible name warning of %s', (tag) => {
  const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const attrs = tag === 'cck-radio' ? ' name="g"' : '';
  const open = (inner: string, extra = ''): string => `<${tag}${attrs}${extra}>${inner}</${tag}>`;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['a dangling aria-labelledby', open('', ' aria-labelledby="nowhere"')],
    ['an empty aria-label', open('', ' aria-label=""')],
    ['an empty aria-labelledby target', `<span id="e"></span>${open('', ' aria-labelledby="e"')}`],
    ['only an aria-hidden icon', open('<svg aria-hidden="true"></svg>')],
    ['only an empty span', open('<span></span>')],
  ])('warns with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).toHaveBeenCalledWith(TEXT[tag]);
  });

  it.each([
    ['a caption', open('Caption')],
    ['an aria-label', open('', ' aria-label="Name"')],
    ['a caption in a hidden div', `<div hidden>${open('Caption')}</div>`],
    ['a caption in a closed details', `<details>${open('Caption')}</details>`],
  ])('does not warn with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).not.toHaveBeenCalled();
  });
});
