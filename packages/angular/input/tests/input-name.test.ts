import { render } from '@testing-library/angular';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckTextareaImports } from '@cocokits/angular/textarea';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckInputImports } from '../index';

const imports = [...CckInputImports, ...CckTextareaImports, ...CckFormFieldImports, ...CckLabelImports];
const OUTSIDE =
  'Add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.';
const INSIDE =
  'Add a <label cckLabel> with text to the FormField, or an aria-label, a title, or an aria-labelledby that points to an element with text.';

describe.each([
  ['an', 'Input', '<input cckInput', '/>'],
  ['a', 'Textarea', '<textarea cckTextarea', '></textarea>'],
])('the accessible name warning of %s %s', (article, name, open, close) => {
  const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const control = (attrs = ''): string => `${open}${attrs}${close}`;
  const outsideText = `CocoKits: ${article} ${name} has no accessible name. ${OUTSIDE}`;
  const insideText = `CocoKits: ${article} ${name} in a FormField has no accessible name. ${INSIDE}`;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['nothing names it', control()],
    ['an aria-labelledby is dangling', control(' aria-labelledby="nowhere"')],
    ['the aria-label is empty', control(' aria-label=""')],
  ])('warns outside a FormField when %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).toHaveBeenCalledWith(outsideText);
  });

  it.each([
    ['an aria-label', control(' aria-label="A"')],
    ['a label for', `<label for="f">A</label>${control(' id="f"')}`],
    ['a placeholder', control(' placeholder="A"')],
  ])('does not warn outside a FormField with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).not.toHaveBeenCalled();
  });

  it.each([
    ['an empty Label', `<cck-form-field><label cckLabel></label>${control()}</cck-form-field>`],
    ['a dangling aria-labelledby', `<cck-form-field>${control(' aria-labelledby="nowhere"')}</cck-form-field>`],
    ['an empty aria-label', `<cck-form-field>${control(' aria-label=""')}</cck-form-field>`],
  ])('warns in a FormField with %s', async (_name, template) => {
    const spy = warn();
    await render(template, { imports });
    expect(spy).toHaveBeenCalledWith(insideText);
  });

  it.each([
    ['a hidden div', 'div hidden', 'div'],
    ['a closed details', 'details', 'details'],
  ])('does not warn for a Label in a FormField inside %s', async (_name, start, end) => {
    const spy = warn();
    await render(`<${start}><cck-form-field><label cckLabel>A</label>${control()}</cck-form-field></${end}>`, {
      imports,
    });
    expect(spy).not.toHaveBeenCalled();
  });
});
