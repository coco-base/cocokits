// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { drawnIconsIn, withPartIcons } from '../../internal/tests/part-icon-fixtures';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';

afterEach(cleanup);

const field = (control: ReactElement, props: Record<string, boolean> = {}): ReactElement => (
  <FormField label={<Label>Notifications</Label>} hint={<Hint>Weekly only.</Hint>} {...props}>
    {control}
  </FormField>
);

const kinds = [
  ['Checkbox', Checkbox],
  ['Switch', Switch],
] as const;

describe.each(kinds)('%s accessibility', (_label, Control) => {
  it.each([
    ['alone', <Control key="a">Email me</Control>],
    [
      'checked',
      <Control key="b" defaultChecked>
        Email me
      </Control>,
    ],
    [
      'disabled',
      <Control key="c" disabled>
        Email me
      </Control>,
    ],
    [
      'read-only',
      <Control key="d" readOnly defaultChecked>
        Email me
      </Control>,
    ],
    ['with an aria-label only', <Control key="e" aria-label="Email me" />],
    ['in a field', field(<Control>Email me</Control>)],
    ['required in a field', field(<Control>Email me</Control>, { required: true })],
    [
      'invalid and touched in a field',
      field(
        <Control invalid touched>
          Email me
        </Control>,
      ),
    ],
  ])('has no axe violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Checkbox accessibility', () => {
  it('has no axe violations while mixed, and the property is set', async () => {
    const { container } = render(<Checkbox indeterminate>All</Checkbox>);
    expect((await axe(container)).violations).toEqual([]);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'All' }).indeterminate).toBe(true);
  });
});

describe('Switch accessibility', () => {
  it('has the role switch, no aria-checked and a name without the decoration', () => {
    render(<Switch>Notify me</Switch>);
    const input = screen.getByRole('switch', { name: 'Notify me' });
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });

  it('toggles from the keyboard with Space', async () => {
    render(<Switch>Notify me</Switch>);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(true);
  });
});

describe('Radio accessibility', () => {
  it('has no axe violations alone', async () => {
    const { container } = render(<Radio name="x">Free</Radio>);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations: three same-name radios in a fieldset', async () => {
    const { container } = render(
      <fieldset>
        <legend>Plan</legend>
        <Radio name="plan" defaultChecked>
          Free
        </Radio>
        <Radio name="plan">Pro</Radio>
        <Radio name="plan" disabled>
          Team
        </Radio>
      </fieldset>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names each radio by its label and moves with the arrow keys', async () => {
    render(
      <fieldset>
        <legend>Plan</legend>
        <Radio name="plan" defaultChecked>
          Free
        </Radio>
        <Radio name="plan">Pro</Radio>
      </fieldset>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Free' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Pro' }).checked).toBe(true);
  });
});

describe('Checkbox accessibility with the theme icons', () => {
  it('has no violations with the tick of a checked Checkbox', async () => {
    const { container } = render(withPartIcons(<Checkbox defaultChecked>Accept the terms</Checkbox>));
    expect(drawnIconsIn(container)).toEqual(['check']);
    expect((await axe(container)).violations).toEqual([]);
  });
});
