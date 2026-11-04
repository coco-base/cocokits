// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Textarea } from '../index';
import { MessageField } from './fixtures';

afterEach(cleanup);

const withLabel = (area: ReactElement, props: Record<string, boolean> = {}): ReactElement => (
  <FormField
    label={<Label>Message</Label>}
    hint={<Hint>Help</Hint>}
    error={<FieldError>Write something.</FieldError>}
    {...props}
  >
    {area}
  </FormField>
);

describe('Textarea accessibility', () => {
  it.each([
    ['alone, with a name', <Textarea key="a" aria-label="Message" />],
    ['in a field with every zone, hints and a shown FieldError', <MessageField key="b" />],
    ['required', withLabel(<Textarea required />)],
    ['invalid and touched, with the error shown', withLabel(<Textarea invalid touched />)],
    ['disabled', withLabel(<Textarea disabled />)],
    ['read-only', withLabel(<Textarea readOnly defaultValue="x" />)],
    [
      'with an aria-hidden icon and a named button',
      <FormField
        key="c"
        label={<Label>Message</Label>}
        prefix={
          <Prefix>
            <svg aria-hidden="true" width="12" height="12" />
          </Prefix>
        }
        suffix={
          <Suffix>
            <button type="button" aria-label="Clear">
              x
            </button>
          </Suffix>
        }
      >
        <Textarea />
      </FormField>,
    ],
  ])('has no axe violation %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the label and described by the feedback wrapper, which holds the hint and the shown error', () => {
    render(<MessageField id="msg" />);
    const area = screen.getByRole('textbox', { name: 'Message' });
    expect(area.getAttribute('aria-describedby')).toBe('msg-feedback');
    expect(document.getElementById('msg-feedback')?.textContent).toBe('Be kind.Be short.Write a message.');
  });

  it('adds nothing to the description while the FieldError is not shown, and announces it after blur', async () => {
    render(withLabel(<Textarea invalid />));
    const area = screen.getByRole('textbox', { name: 'Message' });
    const feedback = (): string =>
      document.getElementById(area.getAttribute('aria-describedby') ?? '')?.textContent ?? '';
    expect(feedback()).toBe('Help');
    await userEvent.click(area);
    await userEvent.tab();
    expect(area.getAttribute('aria-invalid')).toBe('true');
    expect(feedback()).toBe('HelpWrite something.');
  });

  it('takes focus on Tab, skips a disabled textarea, keeps a read-only one and steals no focus on mount', async () => {
    render(
      <>
        <Textarea aria-label="one" />
        <Textarea aria-label="off" disabled />
        <Textarea aria-label="read" readOnly />
      </>,
    );
    expect(document.activeElement).toBe(document.body);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('one'));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('read'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByLabelText('one'));
  });

  it('warns after mount when nothing names the Textarea in a field, and not when a Label or aria-label does', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const frame = (): Promise<void> =>
      new Promise((resolve) =>
        requestAnimationFrame(() => {
          resolve();
        }),
      );
    const warned = (): boolean =>
      warn.mock.calls.some(([text]) => String(text).includes('a Textarea in a FormField has no accessible name'));
    render(
      <FormField>
        <Textarea />
      </FormField>,
    );
    await frame();
    expect(warned()).toBe(true);
    warn.mockClear();
    cleanup();
    render(
      <>
        <FormField label={<Label>Message</Label>}>
          <Textarea />
        </FormField>
        <FormField>
          <Textarea aria-label="Other" />
        </FormField>
        <Textarea />
      </>,
    );
    await frame();
    expect(warned()).toBe(false);
    warn.mockRestore();
  });
});
