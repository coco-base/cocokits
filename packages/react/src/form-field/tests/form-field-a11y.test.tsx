// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { Field } from './fixtures';

afterEach(cleanup);

describe('FormField accessibility', () => {
  it('has no axe violations for the story markup', async () => {
    const { container } = render(<Field />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations without a label or a hint', async () => {
    const { container } = render(
      <FormField>
        <button type="button">Go</button>
      </FormField>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names the input by the label and describes it by both hints', () => {
    render(<Field />);
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input.getAttribute('aria-describedby')).toBe('email-hint email-hint-2');
    expect(input.getAttribute('aria-labelledby')).toBeNull();
  });

  it('moves focus to the input when the label is clicked', async () => {
    render(<Field />);
    await userEvent.click(screen.getByText('Email address'));
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('adds no role, aria-* or tabindex of its own, and is not focusable', async () => {
    const { container } = render(
      <FormField label={<Label htmlFor="a">Name</Label>} hint={<Hint>Help</Hint>}>
        <input id="a" />
      </FormField>,
    );
    for (const element of container.querySelectorAll('div, label')) {
      const names = element.getAttributeNames();
      expect(names.filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-'))).toEqual([]);
    }
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector('input'));
    await userEvent.tab();
    expect(document.activeElement).toBe(document.body);
  });
});
