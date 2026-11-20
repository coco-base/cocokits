// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import type { RadioGroupProps } from '../index';
import { Example } from './fixtures';

afterEach(cleanup);

const group = (): HTMLElement => screen.getByRole('radiogroup');
const invalid = (): boolean => group().getAttribute('aria-invalid') === 'true' && group().hasAttribute('data-invalid');
const consistent = (): boolean => group().hasAttribute('aria-invalid') === group().hasAttribute('data-invalid');

interface Row {
  readonly name: string;
  readonly props: RadioGroupProps;
  readonly invalid: boolean;
}

const rows: readonly Row[] = [
  { name: 'required, no value, not touched', props: { required: true }, invalid: false },
  { name: 'required, no value, touched', props: { required: true, touched: true }, invalid: true },
  {
    name: 'required, a value, touched',
    props: { required: true, touched: true, defaultValue: 'free' },
    invalid: false,
  },
  { name: 'not required, no value, touched', props: { touched: true }, invalid: false },
  { name: 'touched false is not touched', props: { required: true, touched: false }, invalid: false },
];

describe('RadioGroup touched and the invalid state', () => {
  it.each(rows)('is invalid: $invalid when $name', ({ props, invalid: expected }) => {
    render(<Example {...props} />);
    expect(invalid()).toBe(expected);
    expect(consistent()).toBe(true);
  });

  it('is invalid on the server for a touched required group with no value', () => {
    const html = renderToString(<Example required touched />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('data-invalid=""');
  });

  it('becomes touched when the focus leaves the group, and a value clears the invalid state', async () => {
    const user = userEvent.setup();
    render(<Example required />);
    // before, the radio group, after
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    expect(invalid()).toBe(true);
    await user.click(screen.getByRole('radio', { name: 'Free' }));
    expect(invalid()).toBe(false);
  });

  it('stays untouched while the focus moves inside the group', async () => {
    const user = userEvent.setup();
    render(<Example required />);
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(invalid()).toBe(false);
  });

  it('clears touched on a form reset', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Example required />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.tab();
    await user.tab();
    await user.tab();
    expect(invalid()).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await act(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        }),
    );
    expect(invalid()).toBe(false);
  });
});
