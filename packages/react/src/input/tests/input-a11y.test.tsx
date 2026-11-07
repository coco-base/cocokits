// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Input } from '../index';
import { EmailField } from './fixtures';

afterEach(cleanup);

const withLabel = (input: ReactElement, props: Record<string, boolean> = {}): ReactElement => (
  <FormField label={<Label>Name</Label>} hint={<Hint>Help</Hint>} {...props}>
    {input}
  </FormField>
);

describe('Input accessibility', () => {
  it.each([
    ['alone, with a name', <Input key="a" aria-label="Name" />],
    ['in a field with a label and hints', <EmailField key="b" />],
    ['required', withLabel(<Input required />)],
    ['required on the field', withLabel(<Input />, { required: true })],
    ['invalid and touched', withLabel(<Input invalid touched />)],
    ['invalid and submitted', withLabel(<Input invalid submitted />)],
    ['disabled', withLabel(<Input disabled />)],
    ['read-only', withLabel(<Input readOnly defaultValue="x" />)],
  ])('has no axe violation %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the label, described by both hints and marked invalid after blur', async () => {
    render(
      <FormField
        label={<Label>Email address</Label>}
        hint={
          <>
            <Hint>One</Hint>
            <Hint>Two</Hint>
          </>
        }
      >
        <Input invalid />
      </FormField>,
    );
    const input = screen.getByRole('textbox', { name: 'Email address' });
    const described = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(described).toHaveLength(1);
    expect(document.getElementById(described[0] ?? '')?.textContent).toBe('OneTwo');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(input);
    await userEvent.tab();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('takes focus on Tab, skips a disabled input, keeps a read-only one and steals no focus on mount', async () => {
    render(
      <>
        <Input aria-label="one" />
        <Input aria-label="off" disabled />
        <Input aria-label="read" readOnly />
      </>,
    );
    expect(document.activeElement).toBe(document.body);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('one'));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('read'));
  });

  it('hides the required marker from assistive technology and relies on native required', () => {
    render(withLabel(<Input required />));
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' }).required).toBe(true);
    expect(screen.getByRole('textbox').hasAttribute('aria-required')).toBe(false);
  });
});
