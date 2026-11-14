import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { inputAnatomy, inputMeta } from '@cocokits/machines/input';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it, vi } from 'vitest';
import { CckInput, CckInputImports } from '../index';
import type { InputChangeReason } from '../index';
import { isSet, textbox } from './fixtures';

const imports = [...CckInputImports];

describe('CckInput', () => {
  it('renders a native input with the anatomy class and type="text", and no id or name outside a field', async () => {
    await render(`<input cckInput aria-label="Name" />`, { imports });
    const input = textbox();
    expect(input.tagName).toBe('INPUT');
    expect(input.className).toBe(inputAnatomy.classes.root);
    expect(input.getAttribute('type')).toBe('text');
    for (const name of ['id', 'name', 'aria-describedby', 'aria-invalid', 'disabled', 'required', 'hidden']) {
      expect(isSet(input, name), name).toBe(false);
    }
  });

  it('replaces the type default with a static attribute or a binding, and passes native attributes through', async () => {
    await render(
      `<input cckInput type="email" placeholder="you@x.y" autocomplete="email" maxlength="20" aria-label="Email" />`,
      { imports },
    );
    const input = textbox();
    expect(input.getAttribute('type')).toBe('email');
    expect(input.getAttribute('placeholder')).toBe('you@x.y');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(input.maxLength).toBe(20);
  });

  it('keeps the facts of the machine over an author aria-invalid or data-* attribute', async () => {
    await render(`<input cckInput aria-label="A" aria-invalid="true" data-invalid="x" data-filled="x" />`, { imports });
    const input = textbox();
    expect(isSet(input, 'aria-invalid')).toBe(false);
    expect(isSet(input, 'data-invalid')).toBe(false);
    expect(isSet(input, 'data-filled')).toBe(false);
  });

  it('follows a bound type', async () => {
    const type = signal('search');
    const { fixture } = await render(`<input cckInput [type]="type()" aria-label="Find" />`, {
      imports,
      componentProperties: { type },
    });
    const input = screen.getByLabelText<HTMLInputElement>('Find');
    expect(input.type).toBe('search');
    type.set('tel');
    await fixture.whenStable();
    expect(input.type).toBe('tel');
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<input cckInput #i="cckInput" aria-label="Name" />`, { imports });
    expect(fixture.debugElement.children[0]?.references.i).toBeInstanceOf(CckInput);
  });

  it('renders exactly the data attributes of the meta when every fact is true', async () => {
    await render(
      `<input cckInput aria-label="Name" disabled readonly required invalid pending touched dirty submitted value="a" />`,
      { imports },
    );
    const input = textbox();
    const rendered = Array.from(input.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
    // `focused` needs focus; the other nine are on.
    expect(rendered.sort()).toEqual(inputMeta.dataAttrs.root.filter((n) => n !== 'data-focused').sort());
    input.focus();
    expect(isSet(input, 'data-focused')).toBe(false); // disabled controls take no focus
  });

  it('renders the native attributes of the facts', async () => {
    await render(`<input cckInput aria-label="Name" readonly required hidden />`, { imports });
    const input = screen.getByLabelText<HTMLInputElement>('Name', { selector: 'input' });
    expect(input.readOnly).toBe(true);
    expect(input.required).toBe(true);
    expect(input.hidden).toBe(true);
  });

  describe('value', () => {
    it('emits valueChangeDetails with the user reason and the InputEvent, and updates a two-way model', async () => {
      const value = signal('');
      const seen: { value: string; reason: InputChangeReason; event: Event | null }[] = [];
      await render(`<input cckInput aria-label="Name" [(value)]="value" (valueChangeDetails)="seen.push($event)" />`, {
        imports,
        componentProperties: { value, seen },
      });
      await userEvent.setup().type(textbox(), 'ab');
      expect(value()).toBe('ab');
      expect(seen.map((d) => [d.value, d.reason])).toEqual([
        ['a', 'user'],
        ['ab', 'user'],
      ]);
      expect(seen[0]?.event).toBeInstanceOf(InputEvent);
      expect(isSet(textbox(), 'data-filled')).toBe(true);
      expect(isSet(textbox(), 'data-dirty')).toBe(true);
    });

    it('shows a parent write with no emit, and renders a nullish value empty without echoing it', async () => {
      const value = signal<string | null | undefined>('first');
      const onDetails = vi.fn();
      const { fixture } = await render(
        `<input cckInput aria-label="Name" [value]="value()" (valueChangeDetails)="onDetails($event)" />`,
        { imports, componentProperties: { value, onDetails } },
      );
      expect(textbox().value).toBe('first');
      expect(isSet(textbox(), 'data-filled')).toBe(true);
      value.set('second');
      await fixture.whenStable();
      expect(textbox().value).toBe('second');
      value.set(null);
      await fixture.whenStable();
      expect(textbox().value).toBe('');
      expect(isSet(textbox(), 'data-filled')).toBe(false);
      value.set(undefined);
      await fixture.whenStable();
      expect(textbox().value).toBe('');
      expect(onDetails).not.toHaveBeenCalled();
    });

    it('with a one-way [value] typing diverges from the parent until the parent sets a new value', async () => {
      const seed = signal('start');
      const onDetails = vi.fn();
      const { fixture } = await render(
        `<input cckInput aria-label="Name" [value]="seed()" (valueChangeDetails)="onDetails($event)" />`,
        { imports, componentProperties: { seed, onDetails } },
      );
      await userEvent.setup().type(textbox(), '!');
      expect(textbox().value).toBe('start!');
      expect(onDetails).toHaveBeenCalledTimes(1);
      seed.set('replaced');
      await fixture.whenStable();
      expect(textbox().value).toBe('replaced');
      expect(onDetails).toHaveBeenCalledTimes(1);
    });

    it('works unbound: the typed text stays and the details emit', async () => {
      const onDetails = vi.fn();
      await render(`<input cckInput aria-label="Name" (valueChangeDetails)="onDetails($event)" />`, {
        imports,
        componentProperties: { onDetails },
      });
      await userEvent.setup().type(textbox(), 'x');
      expect(textbox().value).toBe('x');
      expect(onDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe('state', () => {
    it('sets focused on focus and touched after the first blur, and emits touch', async () => {
      const onTouch = vi.fn();
      await render(`<input cckInput aria-label="Name" (touch)="onTouch()" />`, {
        imports,
        componentProperties: { onTouch },
      });
      const user = userEvent.setup();
      await user.click(textbox());
      expect(isSet(textbox(), 'data-focused')).toBe(true);
      expect(isSet(textbox(), 'data-touched')).toBe(false);
      await user.tab();
      expect(isSet(textbox(), 'data-focused')).toBe(false);
      expect(isSet(textbox(), 'data-touched')).toBe(true);
      expect(onTouch).toHaveBeenCalledTimes(1);
    });

    it('lets a given touched, dirty or submitted value follow its source', async () => {
      const touched = signal(true);
      const { fixture } = await render(`<input cckInput aria-label="Name" [touched]="touched()" />`, {
        imports,
        componentProperties: { touched },
      });
      expect(isSet(textbox(), 'data-touched')).toBe(true);
      touched.set(false);
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-touched')).toBe(false);
    });

    it('writes aria-invalid="true" only while invalid and touched or submitted, and data-invalid always', async () => {
      const touched = signal(false);
      const submitted = signal(false);
      const invalid = signal(true);
      const { fixture } = await render(
        `<input cckInput aria-label="Name" [invalid]="invalid()" [touched]="touched()" [submitted]="submitted()" />`,
        { imports, componentProperties: { touched, submitted, invalid } },
      );
      const input = textbox();
      expect(isSet(input, 'data-invalid')).toBe(true);
      expect(isSet(input, 'aria-invalid')).toBe(false);
      touched.set(true);
      await fixture.whenStable();
      expect(input.getAttribute('aria-invalid')).toBe('true');
      touched.set(false);
      submitted.set(true);
      await fixture.whenStable();
      expect(input.getAttribute('aria-invalid')).toBe('true');
      invalid.set(false);
      await fixture.whenStable();
      expect(isSet(input, 'aria-invalid')).toBe(false);
      expect(isSet(input, 'data-invalid')).toBe(false);
    });

    it('keeps a read-only control focusable and takes no focus when disabled', async () => {
      await render(`<input cckInput aria-label="Read" readonly /><input cckInput aria-label="Off" disabled />`, {
        imports,
      });
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('Read'));
      await user.tab();
      expect(document.activeElement).not.toBe(screen.getByLabelText('Off'));
    });

    it('accepts the Angular-only errors and disabledReasons and renders nothing for them', async () => {
      const { container } = await render(
        `<input cckInput aria-label="Name" [errors]="[{ kind: 'required' }]" [disabledReasons]="[{ message: 'no' }]" />`,
        { imports },
      );
      expect(container.querySelector('input')?.getAttribute('class')).toBe(inputAnatomy.classes.root);
      expect(container.textContent).toBe('');
    });

    it('reset() clears the touched and dirty facts the control keeps itself', async () => {
      const { fixture } = await render(`<input cckInput #i="cckInput" aria-label="Name" />`, { imports });
      const user = userEvent.setup();
      await user.type(textbox(), 'a');
      await user.tab();
      expect(isSet(textbox(), 'data-touched') && isSet(textbox(), 'data-dirty')).toBe(true);
      (fixture.debugElement.children[0]?.references.i as CckInput).reset();
      await fixture.whenStable();
      expect(isSet(textbox(), 'data-touched')).toBe(false);
      expect(isSet(textbox(), 'data-dirty')).toBe(false);
    });

    it('focus() focuses the host', async () => {
      const { fixture } = await render(`<input cckInput #i="cckInput" aria-label="Name" />`, { imports });
      (fixture.debugElement.children[0]?.references.i as CckInput).focus();
      expect(document.activeElement).toBe(textbox());
    });
  });

  describe('name and id', () => {
    it('renders an author name and id', async () => {
      await render(`<input cckInput aria-label="Name" id="n" name="full" />`, { imports });
      expect(textbox().id).toBe('n');
      expect(textbox().name).toBe('full');
    });

    it('follows a bound name and id', async () => {
      const name = signal('a');
      const id = signal('one');
      const { fixture } = await render(`<input cckInput aria-label="Name" [name]="name()" [id]="id()" />`, {
        imports,
        componentProperties: { name, id },
      });
      name.set('b');
      id.set('two');
      await fixture.whenStable();
      expect(textbox().name).toBe('b');
      expect(textbox().id).toBe('two');
    });

    it('merges an author aria-describedby (static and bound)', async () => {
      const ids = signal('x y');
      const { fixture } = await render(
        `<input cckInput aria-label="A" aria-describedby="a b b" /><input cckInput aria-label="B" [aria-describedby]="ids()" />`,
        { imports, componentProperties: { ids } },
      );
      const [first, second] = screen.getAllByRole('textbox');
      expect(first.getAttribute('aria-describedby')).toBe('a b');
      expect(second.getAttribute('aria-describedby')).toBe('x y');
      ids.set('z');
      await fixture.whenStable();
      expect(second.getAttribute('aria-describedby')).toBe('z');
    });
  });

  it('emits a user change for every input event of an IME composition', async () => {
    const seen: { value: string; reason: string; event: Event | null }[] = [];
    await render(`<input cckInput aria-label="Name" (valueChangeDetails)="seen.push($event)" />`, {
      imports,
      componentProperties: { seen },
    });
    const input = textbox();
    input.dispatchEvent(new CompositionEvent('compositionstart'));
    input.value = 'に';
    const first = new InputEvent('input', { bubbles: true, isComposing: true, data: 'に' });
    input.dispatchEvent(first);
    input.value = '日本';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true, data: '日本' }));
    input.dispatchEvent(new CompositionEvent('compositionend'));
    input.value = '日本語';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, data: '日本語' }));
    expect(seen.map((details) => [details.value, details.reason])).toEqual([
      ['に', 'user'],
      ['日本', 'user'],
      ['日本語', 'user'],
    ]);
    expect(seen[0]?.event).toBe(first);
  });

  it('renders text for a type outside the six text types and keeps the six', async () => {
    await render(
      `<input cckInput aria-label="A" type="number" /><input cckInput aria-label="B" type="url" /><input cckInput aria-label="C" />`,
      { imports },
    );
    expect(screen.getByLabelText<HTMLInputElement>('A').getAttribute('type')).toBe('text');
    expect(screen.getByLabelText<HTMLInputElement>('B').getAttribute('type')).toBe('url');
    expect(screen.getByLabelText<HTMLInputElement>('C').getAttribute('type')).toBe('text');
  });

  it('lets a given submitted value win, also false, over the submit the form reported', async () => {
    const submitted = signal<boolean | undefined>(undefined);
    const { container, fixture } = await render(
      `<form (submit)="$event.preventDefault()"><input cckInput aria-label="Name" [submitted]="submitted()" /></form>`,
      { imports, componentProperties: { submitted } },
    );
    container.querySelector('form')?.requestSubmit();
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-submitted')).toBe(true);
    submitted.set(false);
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-submitted')).toBe(false);
    submitted.set(true);
    await fixture.whenStable();
    expect(isSet(textbox(), 'data-submitted')).toBe(true);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [inputAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(inputAnatomy.parts) },
        },
      },
    });
    await render(`<input cckInput aria-label="Name" />`, { imports, providers: [provideCckTheme(themeConfig)] });
    expect(textbox().getAttribute('data-probe')).toBe('on');
  });
});
