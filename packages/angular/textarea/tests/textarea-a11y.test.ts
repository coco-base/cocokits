import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFieldErrorImports } from '@cocokits/angular/field-error';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckPrefixImports } from '@cocokits/angular/prefix';
import { CckTrailingImports } from '@cocokits/angular/trailing';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { axe } from 'vitest-axe';
import { CckTextareaImports } from '../index';

const imports = [
  ...CckTextareaImports,
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckHintImports,
  ...CckFieldErrorImports,
  ...CckPrefixImports,
  ...CckTrailingImports,
];

const field = (attrs: string, textarea: string, extra = ''): string =>
  `<cck-form-field ${attrs}><label cckLabel>Message</label>${extra}<textarea cckTextarea ${textarea}></textarea><cck-hint>Be kind.</cck-hint><cck-field-error force>Write a message.</cck-field-error></cck-form-field>`;

describe('Textarea accessibility', () => {
  it.each([
    ['alone', `<textarea cckTextarea aria-label="Message"></textarea>`],
    ['in a field with a label, a hint and a FieldError', field('', '')],
    ['required', field('', 'required')],
    ['invalid and touched', field('', 'invalid touched')],
    ['disabled', field('disabled', '')],
    ['read-only', field('readonly', '')],
    [
      'with zones: an aria-hidden icon and a named Button',
      field(
        '',
        '',
        '<span cckPrefix aria-hidden="true">$</span><button cckTrailing type="button" aria-label="Clear">x</button>',
      ),
    ],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the label and described by the hint and the shown FieldError', async () => {
    await render(field('', ''), { imports });
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(screen.getByRole('textbox', { description: 'Be kind.Write a message.' })).toBe(textarea);
  });

  it('marks invalid for assistive technology only after the user left the field', async () => {
    await render(field('', 'invalid'), { imports });
    const textarea = screen.getByRole('textbox');
    expect(textarea.hasAttribute('aria-invalid')).toBe(false);
    const user = userEvent.setup();
    await user.click(textarea);
    await user.tab();
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('takes no focus on mount and never traps Tab', async () => {
    await render(field('', ''), { imports });
    expect(document.activeElement).toBe(document.body);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
    await user.tab();
    expect(document.activeElement).not.toBe(screen.getByRole('textbox'));
  });

  it('skips a disabled Textarea with Tab and Shift+Tab, and reaches a read-only one', async () => {
    await render(
      `<button type="button">Before</button><textarea cckTextarea aria-label="Off" disabled></textarea><textarea cckTextarea aria-label="Read" readonly></textarea><button type="button">After</button>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Read'));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByLabelText('Read'));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
  });
});

describe('Textarea in a FormField: the accessible name warning', () => {
  const warned = (spy: MockInstance): boolean =>
    spy.mock.calls.some(([message]) => String(message).includes('a Textarea in a FormField has no accessible name'));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns after mount when nothing names the Textarea', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<cck-form-field><textarea cckTextarea></textarea></cck-form-field>`, { imports });
    expect(warned(warn)).toBe(true);
  });

  it.each([
    ['the Label', `<label cckLabel>A</label><textarea cckTextarea></textarea>`],
    ['aria-label', `<textarea cckTextarea aria-label="A"></textarea>`],
    ['aria-labelledby', `<span id="x">A</span><textarea cckTextarea aria-labelledby="x"></textarea>`],
  ])('does not warn when %s names it', async (_name, inner) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<cck-form-field>${inner}</cck-form-field>`, { imports });
    expect(warned(warn)).toBe(false);
  });
});
