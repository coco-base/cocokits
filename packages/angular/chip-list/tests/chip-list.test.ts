import { signal } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { chipAnatomy } from '@cocokits/machines/chip';
import { chipListAnatomy } from '@cocokits/machines/chip-list';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckChipListImports, type ChipListChangeDetails } from '../index';
import { must } from './fixtures';

const imports = [...CckChipListImports, ...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const textbox = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');
const removeButtons = (container: Element): HTMLButtonElement[] =>
  Array.from(container.querySelectorAll<HTMLButtonElement>(`.${chipAnatomy.classes.remove}`));
const chipTexts = (container: Element): (string | undefined)[] =>
  Array.from(container.querySelectorAll(`.${chipAnatomy.classes.contentWrapper}`)).map((el) => el.textContent.trim());

/** A list whose value, flags and change details the test controls. */
function host(attrs = '', value: string[] = ['Pizza']) {
  const state = signal(value);
  const readonly = signal(false);
  const disabled = signal(false);
  const seen: ChipListChangeDetails[] = [];
  const template = `<cck-chip-list aria-label="Dishes" [(value)]="state" [readonly]="readonly()" [disabled]="disabled()" ${attrs} (valueChangeDetails)="seen.push($event)" />`;
  return { template, properties: { state, readonly, disabled, seen }, state, readonly, disabled, seen };
}

/** Types the text and presses a key in the text box; true when nothing canceled the key. */
async function typeThen(text: string, key: Parameters<typeof fireEvent.keyDown>[1]): Promise<boolean> {
  if (text) await userEvent.setup().type(textbox(), text);
  return fireEvent.keyDown(textbox(), key);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Chip list render', () => {
  it('renders one removable chip per value in order, then the text box', async () => {
    const h = host('', ['Pizza', 'Salad']);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    const root = must(container.querySelector('cck-chip-list'));
    expect(root.classList.contains(chipListAnatomy.classes.root)).toBe(true);
    expect(chipTexts(container)).toEqual(['Pizza', 'Salad']);
    expect(removeButtons(container)).toHaveLength(2);
    expect(root.lastElementChild).toBe(textbox());
  });

  it('renders the text box with its class, no name and no native required', async () => {
    const h = host('name="dish" required placeholder="Add a dish"');
    await render(h.template, { imports, componentProperties: h.properties });
    expect(textbox().classList.contains(chipListAnatomy.classes.input)).toBe(true);
    expect(textbox().type).toBe('text');
    expect(textbox().getAttribute('autocomplete')).toBe('off');
    expect(textbox().placeholder).toBe('Add a dish');
    expect(textbox().hasAttribute('name')).toBe(false);
    expect(textbox().hasAttribute('required')).toBe(false);
    expect(textbox().getAttribute('aria-required')).toBe('true');
  });

  it('keeps the labelling attributes off the root and on the text box', async () => {
    const h = host('id="mine" aria-describedby="note" aria-labelledby="lbl" data-x="1"');
    const { container } = await render(`<p id="note">n</p><p id="lbl">l</p>${h.template}`, {
      imports,
      componentProperties: h.properties,
    });
    const root = must(container.querySelector('cck-chip-list'));
    for (const name of ['id', 'aria-label', 'aria-labelledby', 'aria-describedby', 'placeholder']) {
      expect(root.hasAttribute(name), name).toBe(false);
    }
    expect(root.getAttribute('data-x')).toBe('1');
    expect(textbox().id).toBe('mine');
    expect(textbox().getAttribute('aria-label')).toBe('Dishes');
    expect(textbox().getAttribute('aria-labelledby')).toBe('lbl');
    expect(textbox().getAttribute('aria-describedby')).toBe('note');
  });

  it('shows the facts on the root, and data-filled with chips or draft text', async () => {
    const h = host('required invalid', []);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    const root = must(container.querySelector('cck-chip-list'));
    expect(root.hasAttribute('data-required')).toBe(true);
    expect(root.hasAttribute('data-invalid')).toBe(true);
    expect(root.hasAttribute('data-filled')).toBe(false);
    await userEvent.setup().type(textbox(), 'x');
    expect(root.hasAttribute('data-filled')).toBe(true);
  });

  it('renders a parent value with duplicates and empty texts as given, with no development error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const h = host('', ['Pizza', 'Pizza', '']);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    expect(chipTexts(container)).toEqual(['Pizza', 'Pizza', '']);
    expect(error).not.toHaveBeenCalled();
  });
});

describe('Chip list adding', () => {
  it.each([
    { name: 'Enter with text', text: '  Salad ', key: { key: 'Enter' }, added: ['Pizza', 'Salad'], prevented: true },
    { name: 'Enter with only spaces', text: '   ', key: { key: 'Enter' }, added: ['Pizza'], prevented: false },
    { name: 'Enter with no text', text: '', key: { key: 'Enter' }, added: ['Pizza'], prevented: false },
    { name: 'a duplicate', text: 'Pizza', key: { key: 'Enter' }, added: ['Pizza'], prevented: true },
    {
      name: 'a composing Enter',
      text: 'Salad',
      key: { key: 'Enter', isComposing: true },
      added: ['Pizza'],
      prevented: false,
    },
    { name: 'an IME key code', text: 'Salad', key: { key: 'Enter', keyCode: 229 }, added: ['Pizza'], prevented: false },
    { name: 'Shift+Enter', text: 'Salad', key: { key: 'Enter', shiftKey: true }, added: ['Pizza'], prevented: false },
    { name: 'Ctrl+Enter', text: 'Salad', key: { key: 'Enter', ctrlKey: true }, added: ['Pizza'], prevented: false },
    { name: 'Alt+Enter', text: 'Salad', key: { key: 'Enter', altKey: true }, added: ['Pizza'], prevented: false },
    { name: 'Meta+Enter', text: 'Salad', key: { key: 'Enter', metaKey: true }, added: ['Pizza'], prevented: false },
    { name: 'another key', text: 'Salad', key: { key: 'a' }, added: ['Pizza'], prevented: false },
  ])('$name: value $added, key canceled $prevented', async ({ text, key, added, prevented }) => {
    const h = host();
    await render(h.template, { imports, componentProperties: h.properties });
    const notCanceled = await typeThen(text, key);
    expect(notCanceled).toBe(!prevented);
    expect(h.state()).toEqual(added);
    const changed = added.length !== 1;
    expect(h.seen).toHaveLength(changed ? 1 : 0);
    if (changed) expect(h.seen[0]).toMatchObject({ value: added, reason: 'add' });
    const clears = text.trim() !== '' && key.key === 'Enter' && !Object.keys(key).some((k) => k !== 'key');
    if (clears) expect(textbox().value).toBe('');
  });

  it('reports the keydown event with an add', async () => {
    const h = host();
    await render(h.template, { imports, componentProperties: h.properties });
    await typeThen('Salad', { key: 'Enter' });
    expect(h.seen[0]?.event?.type).toBe('keydown');
  });

  it.each([
    { addOnBlur: false, added: ['Pizza'] },
    { addOnBlur: true, added: ['Pizza', 'Salad'] },
  ])('adds on blur only with addOnBlur ($addOnBlur)', async ({ addOnBlur, added }) => {
    const h = host(addOnBlur ? 'addOnBlur' : '');
    await render(h.template, { imports, componentProperties: h.properties });
    const user = userEvent.setup();
    await user.type(textbox(), 'Salad');
    await user.tab();
    expect(h.state()).toEqual(added);
    expect(textbox().value).toBe(addOnBlur ? '' : 'Salad');
  });
});

describe('Chip list removing', () => {
  it('removes the value at the position of the activated button, reports remove and focuses the text box', async () => {
    const h = host('', ['a', 'b', 'c']);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    await userEvent.setup().click(removeButtons(container)[1]);
    expect(h.state()).toEqual(['a', 'c']);
    expect(h.seen).toHaveLength(1);
    expect(h.seen[0]).toMatchObject({ value: ['a', 'c'], reason: 'remove' });
    expect(document.activeElement).toBe(textbox());
    expect(chipTexts(container)).toEqual(['a', 'c']);
  });

  it('removes only the second chip of a value with duplicates', async () => {
    const h = host('', ['Pizza', 'Pizza']);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    await userEvent.setup().click(removeButtons(container)[1]);
    expect(h.state()).toEqual(['Pizza']);
  });

  it.each([
    { disabled: true, readonly: false },
    { disabled: false, readonly: true },
  ])('adds and removes nothing while disabled=$disabled readonly=$readonly', async (flags) => {
    const h = host();
    h.disabled.set(flags.disabled);
    h.readonly.set(flags.readonly);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    expect(removeButtons(container)[0]?.disabled).toBe(true);
    expect(textbox().disabled).toBe(flags.disabled);
    expect(textbox().readOnly).toBe(flags.readonly);
    textbox().value = 'Salad';
    textbox().dispatchEvent(new Event('input'));
    fireEvent.keyDown(textbox(), { key: 'Enter' });
    await userEvent.setup().click(removeButtons(container)[0]);
    expect(h.state()).toEqual(['Pizza']);
    expect(h.seen).toEqual([]);
    expect(container.querySelector('.cck-chip')?.hasAttribute('data-disabled')).toBe(true);
  });
});

describe('Chip list value', () => {
  it('never reports a change the parent made', async () => {
    const h = host();
    await render(h.template, { imports, componentProperties: h.properties });
    h.state.set(['x', 'y']);
    h.disabled.set(true);
    h.disabled.set(false);
    await Promise.resolve();
    expect(h.seen).toEqual([]);
  });

  it('works uncontrolled, with a one-way value and with no binding', async () => {
    const { container } = await render(`<cck-chip-list aria-label="Dishes" [value]="['Pizza']" />`, { imports });
    await typeThen('Salad', { key: 'Enter' });
    expect(chipTexts(container)).toEqual(['Pizza', 'Salad']);
  });
});

describe('Chip list focus', () => {
  const start = ['a', 'b', 'c'];
  const focusButton = (container: Element, index: number): void => {
    removeButtons(container)[index]?.focus();
    expect(document.activeElement).toBe(removeButtons(container)[index]);
  };

  it.each([
    { name: 'first, click', index: 0, how: 'click' },
    { name: 'middle, click', index: 1, how: 'click' },
    { name: 'last, click', index: 2, how: 'click' },
    { name: 'first, Enter', index: 0, how: 'Enter' },
    { name: 'middle, Space', index: 1, how: ' ' },
    { name: 'last, Enter', index: 2, how: 'Enter' },
  ])('moves the focus to the text box when the $name activates a remove button', async ({ index, how }) => {
    const h = host('', [...start]);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    const user = userEvent.setup();
    if (how === 'click') await user.click(removeButtons(container)[index]);
    else {
      focusButton(container, index);
      await user.keyboard(how === 'Enter' ? '{Enter}' : ' ');
    }
    expect(h.state()).toHaveLength(2);
    expect(document.activeElement).toBe(textbox());
  });

  it.each([0, 1, 2])('moves the focus to the text box when the parent drops the chip at position %s', async (index) => {
    const h = host('', [...start]);
    const { container, fixture } = await render(h.template, { imports, componentProperties: h.properties });
    focusButton(container, index);
    h.state.set(['only']);
    await fixture.whenStable();
    // Position 0 stays in the DOM (the first chip is tracked by position); the others are gone.
    expect(document.activeElement).toBe(index === 0 ? removeButtons(container)[0] : textbox());
  });

  it.each([0, 1, 2])('moves the focus to the text box when the list turns read-only on position %s', async (index) => {
    const h = host('', [...start]);
    const { container, fixture } = await render(h.template, { imports, componentProperties: h.properties });
    focusButton(container, index);
    h.readonly.set(true);
    await fixture.whenStable();
    expect(document.activeElement).toBe(textbox());
  });

  it('stays on a button whose position stays when the parent sets another value', async () => {
    const h = host('', [...start]);
    const { container, fixture } = await render(h.template, { imports, componentProperties: h.properties });
    focusButton(container, 1);
    h.state.set(['x', 'y', 'z']);
    await fixture.whenStable();
    expect(document.activeElement).toBe(removeButtons(container)[1]);
  });

  it.each(['adds', 'removes'])('stays on the text box when it %s a value', async (what) => {
    const h = host('', [...start]);
    const { container } = await render(h.template, { imports, componentProperties: h.properties });
    textbox().focus();
    if (what === 'adds') await typeThen('d', { key: 'Enter' });
    else h.state.set(['a']);
    expect(document.activeElement).toBe(textbox());
    expect(container.querySelector('cck-chip-list')).toBeTruthy();
  });

  it('does not move the focus when the whole list turns disabled', async () => {
    const h = host('', [...start]);
    const { container, fixture } = await render(h.template, { imports, componentProperties: h.properties });
    focusButton(container, 1);
    h.disabled.set(true);
    await fixture.whenStable();
    expect(document.activeElement).not.toBe(textbox());
  });
});

describe('Chip list in a FormField', () => {
  const field = (attrs = '', list = '') =>
    `<cck-form-field ${attrs}><label cckLabel>Dishes</label><cck-chip-list ${list} [value]="['Pizza']" /><cck-hint>One hint.</cck-hint></cck-form-field>`;

  it('is the control: the label points at the text box, the hint describes it, the field shows data-filled', async () => {
    const { container } = await render(field(), { imports });
    expect(textbox().id).toMatch(/-control$/);
    expect(container.querySelector('label')?.getAttribute('for')).toBe(textbox().id);
    expect(screen.getByRole('textbox', { name: 'Dishes', description: 'One hint.' })).toBe(textbox());
    expect(container.querySelector('.cck-form-field')?.hasAttribute('data-filled')).toBe(true);
  });

  it.each([
    ['disabled', 'disabled'],
    ['readonly', 'readonly'],
    ['required', 'required'],
  ])('passes the %s fact of the field to the list and its chips', async (_name, attr) => {
    const { container } = await render(field(attr), { imports });
    const root = must(container.querySelector('cck-chip-list'));
    expect(root.hasAttribute(`data-${attr}`)).toBe(true);
    if (attr === 'required') expect(textbox().getAttribute('aria-required')).toBe('true');
    else expect(removeButtons(container)[0]?.disabled).toBe(true);
  });

  it('shows aria-invalid once the user left the list', async () => {
    await render(field('invalid'), { imports });
    expect(textbox().hasAttribute('aria-invalid')).toBe(false);
    const user = userEvent.setup();
    await user.click(textbox());
    await user.tab();
    expect(textbox().getAttribute('aria-invalid')).toBe('true');
  });

  it('focuses the text box from a click on the input wrapper', async () => {
    const { container } = await render(field(), { imports });
    await userEvent.setup().click(must(container.querySelector('.cck-form-field__input-wrapper')));
    expect(document.activeElement).toBe(textbox());
  });

  it('is focused while a remove button has the focus, and touched once the focus left the list', async () => {
    const { container } = await render(field(), { imports });
    const root = must(container.querySelector('cck-chip-list'));
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(removeButtons(container)[0]);
    expect(root.hasAttribute('data-focused')).toBe(true);
    await user.tab();
    expect(root.hasAttribute('data-focused')).toBe(true);
    expect(root.hasAttribute('data-touched')).toBe(false);
    await user.tab();
    expect(root.hasAttribute('data-focused')).toBe(false);
    expect(root.hasAttribute('data-touched')).toBe(true);
  });
});

describe('Chip list accessible name', () => {
  it('logs one CocoKits message outside a field without a name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<cck-chip-list />`, { imports });
    const ours = warn.mock.calls.filter(([message]) => String(message).startsWith('CocoKits:'));
    expect(ours).toHaveLength(1);
    expect(String(ours[0]?.[0])).toContain('Chip list');
  });

  it.each([
    ['an aria-label', `<cck-chip-list aria-label="Dishes" />`],
    ['a field label', `<cck-form-field><label cckLabel>Dishes</label><cck-chip-list /></cck-form-field>`],
  ])('logs nothing with %s', async (_name, template) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(template, { imports });
    expect(warn).not.toHaveBeenCalled();
  });
});
