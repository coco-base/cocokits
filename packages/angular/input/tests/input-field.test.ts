import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { formFieldMeta } from '@cocokits/machines/form-field';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { CckInputImports } from '../index';
import { isSet, must, textbox } from './fixtures';

const imports = [...CckInputImports, ...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const fieldOf = (container: HTMLElement): HTMLElement =>
  container.querySelector<HTMLElement>('.cck-form-field') ?? document.body;
const feedbackOf = (container: HTMLElement): HTMLElement =>
  container.querySelector<HTMLElement>('.cck-form-field__feedback-wrapper') ?? document.body;
const label = (container: HTMLElement): HTMLLabelElement =>
  container.querySelector<HTMLLabelElement>('label') ?? document.createElement('label');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Input in a FormField: ids and descriptions', () => {
  it.each([
    ['Label before the Input', `<label cckLabel>Email</label><input cckInput />`],
    ['Label after the Input', `<input cckInput /><label cckLabel>Email</label>`],
  ])('wires the id, the label for and the description with nothing written: %s', async (_name, inner) => {
    const { container } = await render(`<cck-form-field>${inner}<cck-hint>Help</cck-hint></cck-form-field>`, {
      imports,
    });
    const feedback = feedbackOf(container);
    expect(feedback.id).toMatch(/^cck-form-field-.+-feedback$/);
    const fieldId = feedback.id.replace(/-feedback$/, '');
    expect(textbox().id).toBe(`${fieldId}-control`);
    expect(label(container).htmlFor).toBe(`${fieldId}-control`);
    expect(textbox().getAttribute('aria-describedby')).toBe(`${fieldId}-hint-1`);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBe(textbox());
    expect(fieldOf(container).hasAttribute('id')).toBe(false);
  });

  it('keeps the generated ids apart for two fields', async () => {
    const { container } = await render(
      `<cck-form-field><label cckLabel>A</label><input cckInput /></cck-form-field><cck-form-field><label cckLabel>B</label><input cckInput /></cck-form-field>`,
      { imports },
    );
    const ids = Array.from(container.querySelectorAll('input'), (input) => input.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('derives the ids from the id of the field, static or bound, and follows a change', async () => {
    const id = signal('email');
    const { container, fixture } = await render(
      `<cck-form-field [id]="id()"><label cckLabel>Email</label><input cckInput /><cck-hint>Help</cck-hint></cck-form-field>`,
      { imports, componentProperties: { id } },
    );
    expect(fieldOf(container).id).toBe('email');
    expect(textbox().id).toBe('email-control');
    expect(label(container).htmlFor).toBe('email-control');
    expect(textbox().getAttribute('aria-describedby')).toBe('email-hint-1');
    expect(feedbackOf(container).id).toBe('email-feedback');
    id.set('mail');
    await fixture.whenStable();
    expect(fieldOf(container).id).toBe('mail');
    expect(textbox().id).toBe('mail-control');
    expect(label(container).htmlFor).toBe('mail-control');
    expect(textbox().getAttribute('aria-describedby')).toBe('mail-hint-1');
    expect(feedbackOf(container).id).toBe('mail-feedback');
  });

  it('reflects a static id on the field root', async () => {
    const { container } = await render(
      `<cck-form-field id="static"><input cckInput aria-label="A" /></cck-form-field>`,
      {
        imports,
      },
    );
    expect(fieldOf(container).id).toBe('static');
    expect(textbox().id).toBe('static-control');
  });

  it('renders no id attribute on the root for an empty id, and generates the field id', async () => {
    const { container } = await render(
      `<cck-form-field id=""><label cckLabel>Email</label><input cckInput /><cck-hint>Help</cck-hint></cck-form-field>`,
      { imports },
    );
    expect(fieldOf(container).hasAttribute('id')).toBe(false);
    expect(textbox().id).toMatch(/^cck-form-field-.+-control$/);
    expect(textbox().getAttribute('aria-describedby')).toBe(
      `${feedbackOf(container).id.replace(/-feedback$/, '')}-hint-1`,
    );
    expect(feedbackOf(container).id).toMatch(/-feedback$/);
  });

  it('keeps the facts of the machine over an author data-* attribute on the root', async () => {
    const { container } = await render(
      `<cck-form-field data-invalid="x" data-filled="x" class="mine" title="T"><label cckLabel>Email</label><input cckInput /></cck-form-field>`,
      { imports },
    );
    const root = fieldOf(container);
    expect(isSet(root, 'data-invalid')).toBe(false);
    expect(isSet(root, 'data-filled')).toBe(false);
    expect([...root.classList].sort()).toEqual(['cck-form-field', 'mine']);
    expect(root.title).toBe('T');
  });

  it('lets an author id win and the label follow it, and puts the author description first', async () => {
    const { container } = await render(
      `<cck-form-field id="f"><label cckLabel>Email</label><input cckInput id="mine" aria-describedby="note" /><cck-hint>H</cck-hint></cck-form-field><p id="note">n</p>`,
      { imports },
    );
    expect(textbox().id).toBe('mine');
    expect(label(container).htmlFor).toBe('mine');
    expect(textbox().getAttribute('aria-describedby')).toBe('note f-hint-1');
  });

  it('never repeats a hint id when the author already lists it', async () => {
    await render(
      `<cck-form-field id="f"><input cckInput aria-label="A" aria-describedby="f-hint-1 x" /><cck-hint>H</cck-hint></cck-form-field>`,
      {
        imports,
      },
    );
    expect(textbox().getAttribute('aria-describedby')).toBe('f-hint-1 x');
  });

  it('lets an explicit for win over the control id', async () => {
    const { container } = await render(
      `<cck-form-field><label cckLabel for="other">Email</label><input cckInput /></cck-form-field>`,
      { imports },
    );
    expect(label(container).htmlFor).toBe('other');
  });

  it('keeps every hint inside the feedback wrapper, in order, and describes the control by each', async () => {
    const { container } = await render(
      `<cck-form-field id="f"><label cckLabel>A</label><input cckInput /><cck-hint>One</cck-hint><cck-hint>Two</cck-hint><cck-hint>Three</cck-hint></cck-form-field>`,
      { imports },
    );
    const hints = Array.from(feedbackOf(container).querySelectorAll('.cck-hint'), (el) => el.textContent);
    expect(hints).toEqual(['One', 'Two', 'Three']);
    expect(textbox().getAttribute('aria-describedby')).toBe('f-hint-1 f-hint-2 f-hint-3');
  });

  it('works without a label, a hint or any attribute', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(`<cck-form-field><input cckInput aria-label="A" /></cck-form-field>`, {
      imports,
    });
    expect(label(container).textContent).toBe('');
    expect(textbox().id).toMatch(/-control$/);
    expect(warn).not.toHaveBeenCalled();
  });

  it('adds nothing outside a field', async () => {
    await render(`<label cckLabel>Email</label><input cckInput aria-label="A" />`, { imports });
    expect(isSet(textbox(), 'id')).toBe(false);
    expect(isSet(textbox(), 'aria-describedby')).toBe(false);
  });

  it('gives a native input in the field no default and keeps an explicit for', async () => {
    const { container } = await render(
      `<cck-form-field><label cckLabel>A</label><input id="n" /></cck-form-field><cck-form-field><label cckLabel for="m">B</label><input id="m" /></cck-form-field>`,
      { imports },
    );
    const [first, second] = Array.from(container.querySelectorAll('label'));
    expect(first.hasAttribute('for')).toBe(false);
    expect(second.htmlFor).toBe('m');
  });

  it('follows an Input that appears and disappears with @if', async () => {
    const show = signal(false);
    const { container, fixture } = await render(
      `<cck-form-field id="f"><label cckLabel>A</label>@if (show()) {<input cckInput />}</cck-form-field>`,
      { imports, componentProperties: { show } },
    );
    expect(label(container).hasAttribute('for')).toBe(false);
    show.set(true);
    await fixture.whenStable();
    expect(label(container).htmlFor).toBe('f-control');
    show.set(false);
    await fixture.whenStable();
    expect(label(container).hasAttribute('for')).toBe(false);
  });
});

describe('Input in a FormField: the accessible name warning', () => {
  const warned = (spy: MockInstance): boolean =>
    spy.mock.calls.some(([message]) => String(message).includes('accessible name'));

  it('warns after mount when nothing names the Input', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<cck-form-field><input cckInput /></cck-form-field>`, { imports });
    expect(warned(warn)).toBe(true);
  });

  it.each([
    ['the Label', `<label cckLabel>A</label><input cckInput />`],
    ['aria-label', `<input cckInput aria-label="A" />`],
    ['aria-labelledby', `<span id="x">A</span><input cckInput aria-labelledby="x" />`],
    ['title', `<input cckInput title="A" />`],
    ['a wrapping label', `<label>A <input cckInput /></label>`],
  ])('does not warn when %s names it', async (_name, inner) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<cck-form-field>${inner}</cck-form-field>`, { imports });
    expect(warned(warn)).toBe(false);
  });

  it('does not warn outside a field', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<input cckInput />`, { imports });
    expect(warned(warn)).toBe(false);
  });
});

describe('Input in a FormField: one control per field', () => {
  const second = `<cck-form-field id="f"><label cckLabel>A</label><input cckInput aria-label="First" /><input cckInput aria-label="Second" required aria-describedby="mine" id="own" /></cck-form-field>`;

  it('gives a second control no generated id, only its own description, and a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(second, { imports });
    const [first, other] = Array.from(container.querySelectorAll('input'));
    expect(first.id).toBe('f-control');
    expect(first.getAttribute('aria-describedby')).toBeNull();
    expect(other.id).toBe('own');
    expect(other.getAttribute('aria-describedby')).toBe('mine');
    expect(warn.mock.calls.some(([message]) => String(message).includes('holds one control'))).toBe(true);
  });

  it('gets no id at all without an author id, and its facts do not reach the field or the label', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(
      `<cck-form-field id="f"><label cckLabel>A</label><input cckInput aria-label="First" /><input cckInput aria-label="Second" required /></cck-form-field>`,
      { imports },
    );
    const other = container.querySelectorAll('input')[1];
    expect(other.hasAttribute('id')).toBe(false);
    expect(other.hasAttribute('aria-describedby')).toBe(false);
    expect(fieldOf(container).hasAttribute('data-required')).toBe(false);
    expect(container.querySelector('.cck-label__required-marker')).toBeNull();
  });

  it('does not let the second control take over when the first is removed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const first = signal(true);
    const { container, fixture } = await render(
      `<cck-form-field id="f"><label cckLabel>A</label>@if (first()) {<input cckInput aria-label="First" />}@if (true) {<input cckInput aria-label="Second" required />}</cck-form-field>`,
      { imports, componentProperties: { first } },
    );
    first.set(false);
    await fixture.whenStable();
    const other = must(container.querySelector('input'));
    expect(other.hasAttribute('id')).toBe(false);
    expect(label(container).hasAttribute('for')).toBe(false);
    expect(fieldOf(container).hasAttribute('data-required')).toBe(false);
    first.set(true);
    await fixture.whenStable();
    expect(container.querySelector('input')?.id).toBe('f-control');
  });
});

describe('Input in a FormField: state both ways', () => {
  it('shows the label marker and the root fact when only the Input is required', async () => {
    const { container } = await render(
      `<cck-form-field><label cckLabel>A</label><input cckInput required /></cck-form-field>`,
      {
        imports,
      },
    );
    expect(isSet(fieldOf(container), 'data-required')).toBe(true);
    const marker = label(container).lastElementChild;
    expect(marker?.className).toBe('cck-label__required-marker');
    expect(marker?.textContent).toBe('*');
    expect(marker?.getAttribute('aria-hidden')).toBe('true');
    expect(label(container).textContent).toBe('A*');
  });

  it('hides the marker with hideRequiredMarker without changing required', async () => {
    const { container } = await render(
      `<cck-form-field hideRequiredMarker><label cckLabel>A</label><input cckInput required /></cck-form-field>`,
      { imports },
    );
    expect(container.querySelector('.cck-label__required-marker')).toBeNull();
    expect(textbox().required).toBe(true);
    expect(isSet(fieldOf(container), 'data-required')).toBe(true);
  });

  it('reaches the native input from the field props, and ORs them with the control', async () => {
    const { container } = await render(
      `<cck-form-field required disabled readonly invalid><label cckLabel>A</label><input cckInput /></cck-form-field>`,
      { imports },
    );
    const input = container.querySelector('input');
    expect(input?.required && input.disabled && input.readOnly).toBe(true);
    for (const name of ['data-required', 'data-disabled', 'data-readonly', 'data-invalid']) {
      expect(isSet(fieldOf(container), name), name).toBe(true);
      expect(isSet(input as Element, name), name).toBe(true);
    }
    expect(container.querySelector('.cck-label__required-marker')).not.toBeNull();
  });

  it('cannot be turned off from the other side', async () => {
    const { container } = await render(
      `<cck-form-field [required]="false"><label cckLabel>A</label><input cckInput required /></cck-form-field>`,
      { imports },
    );
    expect(textbox().required).toBe(true);
    expect(container.querySelector('.cck-label__required-marker')).not.toBeNull();
  });

  it('puts the control facts on the field root as they change', async () => {
    const { container, fixture } = await render(
      `<cck-form-field><label cckLabel>A</label><input cckInput [invalid]="invalid()" /></cck-form-field>`,
      { imports, componentProperties: { invalid: signal(false) } },
    );
    const user = userEvent.setup();
    const field = fieldOf(container);
    expect(isSet(field, 'data-filled')).toBe(false);
    await user.type(textbox(), 'a');
    expect(isSet(field, 'data-filled') && isSet(field, 'data-dirty') && isSet(field, 'data-focused')).toBe(true);
    await user.tab();
    await fixture.whenStable();
    expect(isSet(field, 'data-touched')).toBe(true);
    expect(isSet(field, 'data-focused')).toBe(false);
  });

  it('hides the field root while the control is hidden', async () => {
    const { container } = await render(`<cck-form-field><input cckInput aria-label="A" hidden /></cck-form-field>`, {
      imports,
    });
    expect(fieldOf(container).hidden).toBe(true);
    expect(container.querySelector('input')?.hidden).toBe(true);
  });

  it('renders exactly the data attributes of the meta on the field root when every fact is true', async () => {
    const { container } = await render(
      `<cck-form-field><input cckInput aria-label="Name" disabled readonly required invalid pending touched dirty submitted value="a" /></cck-form-field>`,
      { imports },
    );
    const input = textbox();
    const root = fieldOf(container);
    const dataOf = (el: Element): string[] =>
      Array.from(el.attributes, (a) => a.name)
        .filter((n) => n.startsWith('data-'))
        .sort();
    expect(dataOf(root)).toEqual(formFieldMeta.dataAttrs.root.filter((n) => n !== 'data-focused').sort());
    expect(isSet(root, 'data-pending') && isSet(root, 'data-submitted')).toBe(true);
    expect(dataOf(root)).toEqual(dataOf(input));
  });

  it('keeps an author hidden attribute on the field root, static or bound', async () => {
    const hidden = signal(true);
    const { container, fixture } = await render(
      `<cck-form-field hidden><input cckInput aria-label="A" /></cck-form-field><cck-form-field [hidden]="hidden()"><input cckInput aria-label="B" /></cck-form-field>`,
      { imports, componentProperties: { hidden } },
    );
    const [first, second] = Array.from(container.querySelectorAll<HTMLElement>('.cck-form-field'));
    expect(first.hidden).toBe(true);
    expect(second.hidden).toBe(true);
    hidden.set(false);
    await fixture.whenStable();
    expect(second.hidden).toBe(false);
    expect(first.hidden).toBe(true);
  });
});
