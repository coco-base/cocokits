// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

// The story markup: the association is made by hand, on a native input.
const field = () =>
  h(FormField, null, {
    label: () => h(Label, { for: 'email' }, () => 'Email address'),
    default: () => h('input', { id: 'email', type: 'email', 'aria-describedby': 'email-hint' }),
    hint: () => h(Hint, { id: 'email-hint' }, () => 'We only use it for the receipt.'),
  });

describe('FormField accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = mountView(field);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations without a label or a hint around a labelled control', async () => {
    const { container } = mountView(() =>
      h(FormField, null, () => h('input', { type: 'text', 'aria-label': 'Search' })),
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names the control by the label and describes it by the hint', () => {
    mountView(field);
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input.getAttribute('aria-describedby')).toBe('email-hint');
    expect(screen.getByRole('textbox', { description: 'We only use it for the receipt.' })).toBe(input);
  });

  it('adds no role, aria-* or tabindex of its own to any part', () => {
    const { container } = mountView(field);
    for (const element of container.querySelectorAll(
      '.cck-form-field, [class^="cck-form-field__"], .cck-hint, .cck-label',
    )) {
      const own = element
        .getAttributeNames()
        .filter((name) => name === 'role' || name === 'tabindex' || name.startsWith('aria-'));
      expect(own, element.className).toEqual([]);
    }
  });
});
