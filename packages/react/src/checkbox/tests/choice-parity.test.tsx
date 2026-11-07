// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { checkboxMeta } from '@cocokits/machines/checkbox';
import { radioMeta } from '@cocokits/machines/radio';
import { switchMeta } from '@cocokits/machines/switch';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';
import { dataNames, expectDefaultElements, must } from '../../internal/tests/choice-fixtures';

afterEach(cleanup);

/** The facts that rise from the props and from a blur or a focus. */
const facts = {
  readOnly: true,
  required: true,
  invalid: true,
  pending: true,
  touched: true,
  dirty: true,
  submitted: true,
};

describe('Checkbox, Switch and Radio parts', () => {
  it.each([
    ['Checkbox', 'checkbox', checkboxMeta, <Checkbox key="c">Caption</Checkbox>],
    ['Switch', 'switch', switchMeta, <Switch key="s">Caption</Switch>],
    [
      'Radio',
      'radio',
      radioMeta,
      <Radio key="r" name="n">
        Caption
      </Radio>,
    ],
  ] as const)('renders the default element of every part of the %s', (_label, block, meta, ui) => {
    const { container } = render(ui);
    expectDefaultElements(must(container.querySelector(`.cck-${block}`)), block, meta.defaultElements);
  });

  it('renders exactly the root data attributes of the Checkbox and the Switch meta', async () => {
    const { container, rerender } = render(
      <>
        <Checkbox defaultChecked indeterminate {...facts}>
          Box
        </Checkbox>
        <Switch defaultChecked {...facts}>
          Toggle
        </Switch>
      </>,
    );
    const [box, toggle] = [...container.querySelectorAll('.cck-checkbox, .cck-switch')];
    const names = (root: Element | undefined): Set<string> => new Set(dataNames(must(root)));
    const first = [names(box), names(toggle)];
    await userEvent.click(screen.getByRole('checkbox'));
    screen.getByRole<HTMLInputElement>('checkbox').focus();
    const focusedBox = names(box);
    screen.getByRole<HTMLInputElement>('switch').focus();
    const focused = [focusedBox, names(toggle)];
    rerender(
      <>
        <Checkbox defaultChecked indeterminate disabled {...facts}>
          Box
        </Checkbox>
        <Switch defaultChecked disabled {...facts}>
          Toggle
        </Switch>
      </>,
    );
    const all = [names(box), names(toggle)];
    const union = (...sets: Set<string>[]): string[] => [...new Set(sets.flatMap((set) => [...set]))].sort();
    const [boxNames, toggleNames] = [
      union(...[first, focused, all].map(([names]) => names)),
      union(...[first, focused, all].map(([, names]) => names)),
    ];
    expect(boxNames).toEqual([...checkboxMeta.dataAttrs.root].sort());
    expect(toggleNames).toEqual([...switchMeta.dataAttrs.root].sort());
    expect(toggleNames).not.toContain('data-indeterminate');
  });

  it('renders exactly the root data attributes of the Radio meta', () => {
    const { container } = render(
      <Radio name="n" disabled required defaultChecked>
        Caption
      </Radio>,
    );
    expect(dataNames(must(container.querySelector('.cck-radio')))).toEqual([...radioMeta.dataAttrs.root].sort());
  });

  it('renders the types, the switch role and the decorative parts from the machine', () => {
    const { container } = render(
      <>
        <Checkbox>A</Checkbox>
        <Switch>B</Switch>
        <Radio name="n">C</Radio>
      </>,
    );
    const inputs = [...container.querySelectorAll('input')];
    expect(inputs.map((input) => input.getAttribute('type'))).toEqual(['checkbox', 'checkbox', 'radio']);
    expect(inputs.map((input) => input.getAttribute('role'))).toEqual([null, 'switch', null]);
    const hidden = [...container.querySelectorAll('[aria-hidden]')].map((element) => element.className);
    expect(hidden.sort()).toEqual(
      [
        'cck-checkbox__backdrop',
        'cck-checkbox__background',
        'cck-switch__thumb',
        'cck-switch__backdrop',
        'cck-radio__backdrop',
        'cck-radio__background',
      ].sort(),
    );
  });
});

describe('Keyboard', () => {
  describe.each([
    ['Checkbox', Checkbox, 'checkbox'],
    ['Switch', Switch, 'switch'],
  ] as const)('%s', (_label, Control, role) => {
    it('skips a disabled control with Tab and reaches a read-only one', async () => {
      render(
        <>
          <Control aria-label="A" />
          <Control aria-label="B" disabled />
          <Control aria-label="C" readOnly />
          <Control aria-label="D" />
        </>,
      );
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'A' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'C' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'D' }));
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'A' }));
    });
  });

  describe('Radio', () => {
    const input = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

    it('checks the focused radio with Space', async () => {
      render(
        <fieldset>
          <Radio name="plan">Free</Radio>
          <Radio name="plan">Pro</Radio>
        </fieldset>,
      );
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(input('Free'));
      expect(input('Free').checked).toBe(false);
      await user.keyboard(' ');
      expect(input('Free').checked).toBe(true);
    });

    it('enters a group at the checked radio', async () => {
      render(
        <fieldset>
          <Radio name="plan">Free</Radio>
          <Radio name="plan" defaultChecked>
            Pro
          </Radio>
          <Radio name="plan">Team</Radio>
        </fieldset>,
      );
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Pro'));
    });

    it('enters a group at the first radio when none is checked', async () => {
      render(
        <fieldset>
          <Radio name="plan">Free</Radio>
          <Radio name="plan">Pro</Radio>
          <Radio name="plan">Team</Radio>
        </fieldset>,
      );
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Free'));
    });

    it('tabs past a disabled radio', async () => {
      render(
        <fieldset>
          <Radio name="plan" disabled>
            Free
          </Radio>
          <Radio name="plan">Pro</Radio>
          <Radio name="plan">Team</Radio>
        </fieldset>,
      );
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Pro'));
    });

    it('moves with the arrow keys, wraps at both ends and skips a disabled radio', async () => {
      render(
        <fieldset>
          <Radio name="plan" defaultChecked>
            Free
          </Radio>
          <Radio name="plan" disabled>
            Pro
          </Radio>
          <Radio name="plan">Team</Radio>
        </fieldset>,
      );
      const user = userEvent.setup();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(input('Team').checked).toBe(true);
      await user.keyboard('{ArrowDown}');
      expect(input('Free').checked).toBe(true);
      await user.keyboard('{ArrowUp}');
      expect(input('Team').checked).toBe(true);
      await user.keyboard('{ArrowLeft}');
      expect(input('Free').checked).toBe(true);
      await user.keyboard('{ArrowRight}');
      expect(input('Team').checked).toBe(true);
    });
  });
});
