import { render } from '@testing-library/angular';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabelImports } from '@cocokits/angular/label';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckSelectImports, ...CckFormFieldImports, ...CckLabelImports];
const TEXT =
  'CocoKits: a Select has no accessible name. Add a <label cckLabel> with text to its FormField, or an aria-label, or an aria-labelledby that points to an element with text, to the <cck-select>.';
const option = '<cck-select-option value="a">A</cck-select-option>';

describe('the accessible name warning of a Select', () => {
  const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['a dangling aria-labelledby', `<cck-select aria-labelledby="nowhere">${option}</cck-select>`],
    ['an empty aria-label', `<cck-select aria-label="">${option}</cck-select>`],
    ['an empty Label', `<cck-form-field><label cckLabel></label><cck-select>${option}</cck-select></cck-form-field>`],
  ])('warns with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(TEXT);
    });
  });

  it('does not warn for a Select with a Label inside a hidden div or a closed details', async () => {
    const spy = warn();
    const field = `<cck-form-field><label cckLabel>Dish</label><cck-select>${option}</cck-select></cck-form-field>`;
    await render(`<div hidden>${field}</div><details>${field}</details>`, { imports });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(spy).not.toHaveBeenCalled();
  });
});
