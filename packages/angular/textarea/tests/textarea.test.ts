import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { textareaAnatomy, textareaMeta } from '@cocokits/machines/textarea';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it, vi } from 'vitest';
import { CckTextarea, CckTextareaImports } from '../index';
import type { TextareaChangeReason } from '../index';
import { isSet, textarea } from './fixtures';

const imports = [...CckTextareaImports];

describe('CckTextarea', () => {
  it('renders a native textarea with the anatomy class, no type, and no id or name outside a field', async () => {
    await render(`<textarea cckTextarea aria-label="Message"></textarea>`, { imports });
    expect(textarea().tagName).toBe('TEXTAREA');
    expect(textarea().className).toBe(textareaAnatomy.classes.root);
    expect(isSet(textarea(), 'type')).toBe(false);
    for (const name of ['id', 'name', 'aria-describedby', 'aria-invalid', 'disabled', 'required', 'hidden', 'rows']) {
      expect(isSet(textarea(), name), name).toBe(false);
    }
    expect(textarea().rows).toBe(2);
  });

  it('declares the ten facts of the Input and no role', () => {
    expect(textareaMeta.dataAttrs.root).toHaveLength(10);
    expect(textareaMeta.roles.root).toBeNull();
  });

  it('passes the native textarea attributes through', async () => {
    await render(
      `<textarea cckTextarea rows="5" cols="30" wrap="hard" placeholder="Say" maxlength="40" minlength="2" autocomplete="off" aria-label="Message"></textarea>`,
      { imports },
    );
    expect(textarea().rows).toBe(5);
    expect(textarea().cols).toBe(30);
    expect(textarea().wrap).toBe('hard');
    expect(textarea().placeholder).toBe('Say');
    expect(textarea().maxLength).toBe(40);
    expect(textarea().minLength).toBe(2);
    expect(textarea().getAttribute('autocomplete')).toBe('off');
  });

  it('keeps the facts of the machine over an author aria-invalid or data-* attribute', async () => {
    await render(
      `<textarea cckTextarea aria-label="A" aria-invalid="true" data-invalid="x" data-filled="x"></textarea>`,
      { imports },
    );
    for (const name of ['aria-invalid', 'data-invalid', 'data-filled'])
      expect(isSet(textarea(), name), name).toBe(false);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<textarea cckTextarea #t="cckTextarea" aria-label="Message"></textarea>`, {
      imports,
    });
    expect(fixture.debugElement.children[0]?.injector.get(CckTextarea)).toBeInstanceOf(CckTextarea);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [textareaAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(textareaAnatomy.parts) },
        },
      },
    });
    await render(`<textarea cckTextarea aria-label="Message"></textarea>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(textarea().getAttribute('data-probe')).toBe('on');
  });

  it('is found by its label through the native for', async () => {
    await render(`<label for="m">Message</label><textarea cckTextarea id="m"></textarea>`, { imports });
    expect(screen.getByLabelText('Message')).toBe(textarea());
  });

  describe('value', () => {
    it('renders the model, nullish as empty, and follows changes without echoing them', async () => {
      const value = signal<string | null | undefined>('hello');
      const onDetails = vi.fn();
      const { fixture } = await render(
        `<textarea cckTextarea aria-label="Message" [value]="value()" (valueChangeDetails)="onDetails($event)"></textarea>`,
        { imports, componentProperties: { value, onDetails } },
      );
      expect(textarea().value).toBe('hello');
      expect(isSet(textarea(), 'data-filled')).toBe(true);
      value.set(null);
      await fixture.whenStable();
      expect(textarea().value).toBe('');
      expect(isSet(textarea(), 'data-filled')).toBe(false);
      value.set('again');
      await fixture.whenStable();
      expect(textarea().value).toBe('again');
      expect(onDetails).not.toHaveBeenCalled();
    });

    it('fires the user reason with the InputEvent and updates the model', async () => {
      const value = signal('');
      const seen: { value: string; reason: TextareaChangeReason; event: Event }[] = [];
      await render(
        `<textarea cckTextarea aria-label="Message" [(value)]="value" (valueChangeDetails)="seen.push($event)"></textarea>`,
        { imports, componentProperties: { value, seen } },
      );
      await userEvent.setup().type(textarea(), 'ab');
      expect(value()).toBe('ab');
      expect(seen.map((item) => [item.value, item.reason])).toEqual([
        ['a', 'user'],
        ['ab', 'user'],
      ]);
      expect(seen[0]?.event.type).toBe('input');
      expect(isSet(textarea(), 'data-dirty')).toBe(true);
    });

    it('inserts a line break on Enter and never submits the form', async () => {
      const submit = vi.fn((event: Event) => {
        event.preventDefault();
      });
      const value = signal('');
      await render(
        `<form (submit)="submit($event)"><textarea cckTextarea aria-label="Message" [(value)]="value"></textarea><button type="submit">Go</button></form>`,
        { imports, componentProperties: { value, submit } },
      );
      await userEvent.setup().type(textarea(), 'a{Enter}b');
      expect(textarea().value).toBe('a\nb');
      expect(value()).toBe('a\nb');
      expect(submit).not.toHaveBeenCalled();
    });

    it('shows a CRLF model with LF, emits nothing and keeps the model', async () => {
      const value = signal<string | null | undefined>('a\r\nb');
      const onDetails = vi.fn();
      const { fixture } = await render(
        `<textarea cckTextarea aria-label="Message" [value]="value()" (valueChangeDetails)="onDetails($event)"></textarea>`,
        { imports, componentProperties: { value, onDetails } },
      );
      expect(textarea().value).toBe('a\nb');
      expect(value()).toBe('a\r\nb');
      expect(onDetails).not.toHaveBeenCalled();
      value.set('x\ry');
      await fixture.whenStable();
      expect(textarea().value).toBe('x\ny');
    });

    it('does not rewrite the DOM while the model differs only by line breaks', async () => {
      const value = signal<string | null | undefined>('a\r\nb');
      const { fixture } = await render(`<textarea cckTextarea aria-label="Message" [value]="value()"></textarea>`, {
        imports,
        componentProperties: { value },
      });
      const set = vi.spyOn(HTMLTextAreaElement.prototype, 'value', 'set');
      textarea().setSelectionRange(1, 1);
      value.set('a\nb'); // the same text for the DOM
      await fixture.whenStable();
      expect(set).not.toHaveBeenCalled();
      expect(textarea().selectionStart).toBe(1);
      set.mockRestore();
    });
  });
});
