import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckInputImports } from '../index';

const imports = [...CckInputImports, ...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const field = (attrs: string, input: string): string =>
  `<cck-form-field ${attrs}><label cckLabel>Email address</label><input cckInput ${input} /><cck-hint>We only use it for the receipt.</cck-hint><cck-hint>Second hint.</cck-hint></cck-form-field>`;

describe('Input accessibility', () => {
  it.each([
    ['alone', `<input cckInput aria-label="Email" />`],
    ['in a field with a label and hints', field('', 'type="email"')],
    ['required', field('', 'required')],
    ['required on the field', field('required', '')],
    ['invalid and touched', field('', 'invalid touched')],
    ['invalid and submitted', field('', 'invalid submitted')],
    ['disabled', field('disabled', '')],
    ['read-only', field('readonly', '')],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the label and described by the hints', async () => {
    await render(field('', 'type="email"'), { imports });
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByRole('textbox', { description: 'We only use it for the receipt.Second hint.' })).toBe(input);
  });

  it('keeps the name free of the required marker and announces required natively', async () => {
    await render(field('', 'required'), { imports });
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.hasAttribute('aria-required')).toBe(false);
  });

  it('marks invalid for assistive technology only after the user left the field', async () => {
    await render(field('', 'invalid'), { imports });
    const input = screen.getByRole('textbox');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    const user = userEvent.setup();
    await user.click(input);
    await user.tab();
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('focuses the control from a click on the label and takes no focus on mount', async () => {
    await render(field('', ''), { imports });
    expect(document.activeElement).toBe(document.body);
    await userEvent.setup().click(screen.getByText('Email address'));
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('shows the focus ring target: the focused fact is on the input and the field root', async () => {
    const { container } = await render(field('', ''), { imports });
    await userEvent.setup().tab();
    expect(screen.getByRole('textbox').hasAttribute('data-focused')).toBe(true);
    expect(container.querySelector('.cck-form-field')?.hasAttribute('data-focused')).toBe(true);
  });
});
