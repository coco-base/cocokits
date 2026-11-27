import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { CckChipListImports } from '@cocokits/angular/chip-list';
import { CckInputImports } from '@cocokits/angular/input';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckSelectImports } from '@cocokits/angular/select';
import { CckTabsImports } from '@cocokits/angular/tabs';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { CckAccordionImports } from '../index';

const imports = [
  ...CckAccordionImports,
  ...CckTabsImports,
  ...CckCheckboxImports,
  ...CckRadioImports,
  ...CckInputImports,
  ...CckSelectImports,
  ...CckChipListImports,
];
const option = '<cck-select-option value="a">A</cck-select-option>';

/**
 * Each control named by text outside its container, and without a name; the warning it gives starts with the last
 * text. While the control is detached its `aria-labelledby` cannot reach that text, so a check then would warn.
 */
const by = 'aria-labelledby="caption"';
const controls: [string, string, string, string][] = [
  ['a Checkbox', `<cck-checkbox ${by}></cck-checkbox>`, '<cck-checkbox></cck-checkbox>', 'a Checkbox or Switch'],
  ['a Radio', `<cck-radio name="g" ${by}></cck-radio>`, '<cck-radio name="g"></cck-radio>', 'a Radio'],
  ['an Input', `<input cckInput ${by} />`, '<input cckInput />', 'an Input'],
  ['a Select', `<cck-select ${by}>${option}</cck-select>`, `<cck-select>${option}</cck-select>`, 'a Select'],
  ['a Chip list', `<cck-chip-list ${by} />`, '<cck-chip-list />', 'a Chip list'],
];

/** A closed accordion item and an unselected tab, each holding `control`, and the trigger that shows each. */
const containers: [string, (control: string) => string, () => HTMLElement][] = [
  [
    'a closed accordion item',
    (control) =>
      `<span id="caption">Caption</span><cck-accordion><cck-accordion-item label="Shown">Text</cck-accordion-item><cck-accordion-item label="Privacy">${control}</cck-accordion-item></cck-accordion>`,
    () => screen.getByRole('button', { name: 'Privacy' }),
  ],
  [
    'an unselected tab',
    (control) =>
      `<span id="caption">Caption</span><cck-tabs aria-label="Settings"><cck-tab label="Shown">Text</cck-tab><cck-tab label="Privacy">${control}</cck-tab></cck-tabs>`,
    () => screen.getByRole('tab', { name: 'Privacy' }),
  ],
];

const nameWarnings = (spy: MockInstance<typeof console.warn>): string[] =>
  spy.mock.calls.map(([text]) => String(text)).filter((text) => text.includes('has no accessible name'));

describe.each(containers)('the name check of a control in %s', (_container, wrap, trigger) => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(controls)('logs nothing for %s with a name, before and after it is shown', async (_name, named) => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(wrap(named), { imports });
    await userEvent.click(trigger());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(spy).not.toHaveBeenCalled();
  });

  it.each(controls)('warns once for %s without a name when it is shown', async (_name, _named, unnamed, kind) => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture } = await render(wrap(unnamed), { imports });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(nameWarnings(spy)).toEqual([]);

    await userEvent.click(trigger());
    await fixture.whenStable();
    await vi.waitFor(() => {
      expect(nameWarnings(spy)).toHaveLength(1);
    });
    expect(nameWarnings(spy)[0]).toMatch(new RegExp(`^CocoKits: ${kind} has no accessible name\\.`));
  });
});
