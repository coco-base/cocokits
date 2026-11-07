import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckFieldErrorImports } from '../../field-error';
import { CckHintImports } from '../../hint';
import { CckInputImports } from '../../input';
import { CckLabelImports } from '../../label';
import { CckLeadingImports } from '../../leading';
import { CckPrefixImports } from '../../prefix';
import { CckSuffixImports } from '../../suffix';
import { CckTextareaImports } from '../../textarea';
import { CckTrailingImports } from '../../trailing';
import { CckFormFieldImports } from '../index';
import { must } from './queries';

const imports = [
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckHintImports,
  ...CckFieldErrorImports,
  ...CckInputImports,
  ...CckTextareaImports,
  ...CckPrefixImports,
  ...CckSuffixImports,
  ...CckLeadingImports,
  ...CckTrailingImports,
];

const classesOf = (parent: Element | null | undefined): string[] =>
  Array.from(parent?.children ?? [], (child) => child.className.split(' ')[0] ?? '');
const part = (container: HTMLElement, name: string): HTMLElement =>
  container.querySelector<HTMLElement>(`.cck-form-field__${name}`) ?? document.body;
const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FormField zones', () => {
  const scrambled = `
    <div cckFormField>
      <div cckFieldError force>Too short</div>
      <div cckTrailing>trail</div>
      <div cckSuffix>suf</div>
      <div cckHint>Help</div>
      <textarea cckTextarea></textarea>
      <div cckPrefix>pre</div>
      <label cckLabel>Message</label>
      <div cckLeading>lead</div>
    </div>`;

  it.each([
    ['Textarea', scrambled],
    ['Input', scrambled.replace('<textarea cckTextarea></textarea>', '<input cckInput />')],
  ])('renders the Anatomy order whatever the source order: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    const field = container.querySelector('.cck-form-field');
    expect(classesOf(field)).toEqual(['cck-label', 'cck-form-field__wrapper', 'cck-form-field__feedback-wrapper']);
    expect(classesOf(part(container, 'wrapper'))).toEqual([
      'cck-leading',
      'cck-form-field__input-wrapper',
      'cck-trailing',
    ]);
    const control = _name === 'Input' ? 'cck-input' : 'cck-textarea';
    expect(classesOf(part(container, 'input-wrapper'))).toEqual(['cck-prefix', control, 'cck-suffix']);
    expect(classesOf(part(container, 'feedback-wrapper'))).toEqual(['cck-hint', 'cck-field-error']);
  });

  it('renders nothing for an empty zone', async () => {
    const { container } = await render(`<div cckFormField><input cckInput aria-label="A" /></div>`, { imports });
    expect(classesOf(part(container, 'wrapper'))).toEqual(['cck-form-field__input-wrapper']);
    expect(classesOf(part(container, 'input-wrapper'))).toEqual(['cck-input']);
    expect(classesOf(part(container, 'feedback-wrapper'))).toEqual([]);
  });

  it('renders the zones next to a native input, which gets no container focus', async () => {
    const { container } = await render(
      `<div cckFormField><div cckLeading>lead</div><input aria-label="A" /><div cckTrailing>trail</div></div>`,
      { imports },
    );
    expect(classesOf(part(container, 'wrapper'))).toEqual([
      'cck-leading',
      'cck-form-field__input-wrapper',
      'cck-trailing',
    ]);
    await userEvent.setup().click(part(container, 'input-wrapper'));
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps an author id and attributes on a zone', async () => {
    const { container } = await render(
      `<div cckFormField><input cckInput aria-label="A" /><div cckPrefix id="p" data-x="1">$</div></div>`,
      { imports },
    );
    const prefix = container.querySelector('.cck-prefix');
    expect(prefix?.id).toBe('p');
    expect(prefix?.getAttribute('data-x')).toBe('1');
    expect(prefix?.hasAttribute('role')).toBe(false);
  });
});

describe('FormField container click', () => {
  const box = (control: string): string => `
    <div cckFormField>
      <label cckLabel>Message</label>
      <div cckLeading id="lead">lead</div>
      <div cckPrefix id="pre">pre</div>
      ${control}
      <div cckSuffix id="suf">suf <button type="button">Go</button></div>
    </div>`;

  describe.each([
    ['Textarea', '<textarea cckTextarea></textarea>', 'textarea'],
    ['Input', '<input cckInput />', 'input'],
  ])('%s', (_name, control, tag) => {
    const controlOf = (): HTMLElement => document.querySelector<HTMLElement>(tag) ?? document.body;

    it('focuses the control on a click on the box padding, a Prefix and a Suffix', async () => {
      const { container } = await render(box(control), { imports });
      const user = userEvent.setup();
      await user.click(part(container, 'input-wrapper'));
      expect(document.activeElement).toBe(controlOf());
      controlOf().blur();
      await user.click(screen.getByText('pre'));
      expect(document.activeElement).toBe(controlOf());
      controlOf().blur();
      await user.click(screen.getByText('suf', { exact: false }));
      expect(document.activeElement).toBe(controlOf());
    });

    it('does not move focus for a Button or a Leading', async () => {
      await render(box(control), { imports });
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'Go' }));
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
      await user.click(screen.getByText('lead'));
      expect(document.activeElement).not.toBe(controlOf());
    });

    it('does not move focus for a disabled control', async () => {
      const { container } = await render(box(control.replace(/^<(\w+)/, '<$1 disabled')), { imports });
      await userEvent.setup().click(part(container, 'input-wrapper'));
      expect(document.activeElement).not.toBe(controlOf());
    });

    it('does not move focus after text was selected in a Prefix', async () => {
      const { container } = await render(box(control), { imports });
      const prefix = must(screen.getByText('pre'));
      const range = document.createRange();
      range.selectNodeContents(prefix);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      container
        .querySelector('.cck-form-field__input-wrapper')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(document.activeElement).not.toBe(controlOf());
      window.getSelection()?.removeAllRanges();
    });

    it('keeps a focused empty required untouched control focused on a mousedown on the padding', async () => {
      const onTouch = vi.fn();
      const { container } = await render(
        box(control.replace(control.includes('<input') ? '<input' : '<textarea', `$& required (touch)="onTouch()"`)),
        { imports, componentProperties: { onTouch } },
      );
      const user = userEvent.setup();
      controlOf().focus();
      await user.pointer({ keys: '[MouseLeft>]', target: part(container, 'input-wrapper') });
      expect(document.activeElement).toBe(controlOf());
      expect(onTouch).not.toHaveBeenCalled();
      expect(controlOf().hasAttribute('data-touched')).toBe(false);
      await user.pointer({ keys: '[/MouseLeft]' });
      expect(document.activeElement).toBe(controlOf());
    });
  });

  it('focuses a read-only control', async () => {
    const { container } = await render(box('<textarea cckTextarea readonly></textarea>'), { imports });
    await userEvent.setup().click(part(container, 'input-wrapper'));
    expect(document.activeElement).toBe(container.querySelector('textarea'));
  });
});

describe('FormField with a Textarea', () => {
  const field = `
    <div cckFormField>
      <label cckLabel>Message</label>
      <textarea cckTextarea></textarea>
      <div cckHint>Help</div>
    </div>`;

  it('wires the id, the label for and the description like the Input', async () => {
    const { container } = await render(field, { imports });
    const feedback = part(container, 'feedback-wrapper');
    const fieldId = feedback.id.replace(/-feedback$/, '');
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(textarea.id).toBe(`${fieldId}-control`);
    expect(container.querySelector('label')?.htmlFor).toBe(textarea.id);
    expect(textarea.getAttribute('aria-describedby')).toBe(feedback.id);
    expect(part(container, 'input-wrapper').matches(':has(> .cck-textarea)')).toBe(true);
  });

  it('keeps an author id and puts it on the label', async () => {
    const { container } = await render(field.replace('<textarea cckTextarea>', '<textarea cckTextarea id="mine">'), {
      imports,
    });
    expect(screen.getByRole('textbox').id).toBe('mine');
    expect(container.querySelector('label')?.htmlFor).toBe('mine');
  });

  it('makes the first control of a mixed field the control and warns for the second', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(
      `<div cckFormField><label cckLabel>Message</label><textarea cckTextarea></textarea><input cckInput aria-label="Other" /></div>`,
      { imports },
    );
    const textarea = container.querySelector('textarea');
    expect(textarea?.id).toMatch(/-control$/);
    expect(container.querySelector('input')?.id).toBe('');
    expect(warn.mock.calls.some(([message]) => String(message).includes('holds one control'))).toBe(true);
  });
});

describe('FieldError', () => {
  const live = (container: HTMLElement): HTMLElement =>
    container.querySelector<HTMLElement>('.cck-field-error') ?? document.body;
  const field = (control: string, error = '<div cckFieldError>Enter a message.</div>'): string =>
    `<form><div cckFormField><label cckLabel>Message</label>${control}<div cckHint>Help</div>${error}</div></form>`;

  it('is an always rendered polite live region with no role and no content before touch', async () => {
    const { container } = await render(field('<textarea cckTextarea invalid></textarea>'), { imports });
    expect(live(container).getAttribute('aria-live')).toBe('polite');
    expect(live(container).hasAttribute('role')).toBe(false);
    expect(live(container).textContent.trim()).toBe('');
    expect(screen.getByRole('textbox', { description: 'Help' })).toBeTruthy();
  });

  it('shows the content after blur and describes the control with it', async () => {
    const { container } = await render(field('<textarea cckTextarea invalid></textarea>'), { imports });
    const user = userEvent.setup();
    await user.click(screen.getByRole('textbox'));
    await user.tab();
    expect(live(container).textContent.trim()).toBe('Enter a message.');
    expect(screen.getByRole('textbox', { description: 'Help Enter a message.' })).toBeTruthy();
  });

  it('shows the content after a submit event without blur, and a reset hides it again', async () => {
    const { container, fixture } = await render(field('<textarea cckTextarea invalid></textarea>'), { imports });
    container.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await fixture.whenStable();
    expect(live(container).textContent.trim()).toBe('Enter a message.');
    container.querySelector('form')?.reset();
    await nextTask();
    await fixture.whenStable();
    expect(live(container).textContent.trim()).toBe('');
  });

  it('renders no content for a valid field, even touched', async () => {
    const { container } = await render(field('<textarea cckTextarea></textarea>'), { imports });
    const user = userEvent.setup();
    await user.click(screen.getByRole('textbox'));
    await user.tab();
    expect(live(container).textContent.trim()).toBe('');
  });

  it('shows the content with force, also in a valid untouched field', async () => {
    const { container } = await render(
      field('<textarea cckTextarea></textarea>', '<div cckFieldError force>Always</div>'),
      {
        imports,
      },
    );
    expect(live(container).textContent.trim()).toBe('Always');
  });

  it('shows the content outside a field and keeps the root', async () => {
    const { container } = await render(`<div cckFieldError>Standalone</div>`, { imports });
    expect(live(container).textContent).toBe('Standalone');
    expect(live(container).getAttribute('aria-live')).toBe('polite');
  });

  it('keeps an author id and renders several errors in source order, each with its own force', async () => {
    const { container } = await render(
      field(
        '<textarea cckTextarea></textarea>',
        '<div cckFieldError id="e1" force>One</div><div cckFieldError>Two</div><div cckFieldError force>Three</div>',
      ),
      { imports },
    );
    const errors = Array.from(container.querySelectorAll('.cck-field-error'));
    expect(errors.map((error) => error.textContent.trim())).toEqual(['One', '', 'Three']);
    expect(errors[0]?.id).toBe('e1');
  });

  it('adds no text to the description while not shown', async () => {
    await render(field('<input cckInput invalid />'), { imports });
    expect(screen.getByRole('textbox', { description: 'Help' })).toBeTruthy();
  });
});
