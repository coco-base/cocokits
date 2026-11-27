// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chip } from '../index';

afterEach(cleanup);

const toggle = (): HTMLElement => screen.getByRole('button', { name: 'Pizza' });

function Controlled({ onSelectedChange }: { readonly onSelectedChange?: (selected: boolean) => void }): ReactElement {
  const [selected, setSelected] = useState(false);
  return (
    <Chip
      selected={selected}
      onSelectedChange={(next) => {
        onSelectedChange?.(next);
        setSelected(next);
      }}
    >
      Pizza
    </Chip>
  );
}

describe('Chip selectable', () => {
  it.each<[string, ReactElement, 'span' | 'button']>([
    ['no selected prop', <Chip>Pizza</Chip>, 'span'],
    ['selected false', <Chip selected={false}>Pizza</Chip>, 'button'],
    ['defaultSelected true', <Chip defaultSelected>Pizza</Chip>, 'button'],
  ])('renders the content wrapper by selectability: %s', (_name, ui, tag) => {
    render(ui);
    const content = document.querySelector('.cck-chip__content-wrapper');
    expect(content?.tagName.toLowerCase()).toBe(tag);
    expect(document.querySelector('.cck-chip__check') !== null).toBe(tag === 'button');
  });

  it('toggles with a click, Enter and Space, reports the reason and keeps the name', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Controlled onSelectedChange={onSelectedChange} />);
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    await user.click(toggle());
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    expect(toggle().hasAttribute('data-selected')).toBe(true);
    expect(document.querySelector('.cck-chip__check')?.getAttribute('data-state')).toBe('checked');
    toggle().focus();
    await user.keyboard('{Enter}');
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    await user.keyboard(' ');
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    expect(onSelectedChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it('keeps the old state when the parent does not take the change', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <Chip selected={false} onSelectedChange={onSelectedChange}>
        Pizza
      </Chip>,
    );
    await user.click(toggle());
    expect(onSelectedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'user' }));
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
  });

  it('draws the check from the theme icon name, default check', () => {
    render(<Chip selected>Pizza</Chip>);
    expect(document.querySelector('.cck-chip__check .cck-svg-icon')?.getAttribute('data-icon')).toBe('check');
  });

  it('puts the remove button beside the toggle, never inside it', () => {
    render(
      <Chip selected removable>
        Pizza
      </Chip>,
    );
    const remove = screen.getByRole('button', { name: 'Remove Pizza' });
    expect(toggle().contains(remove)).toBe(false);
    expect(remove.parentElement).toBe(toggle().parentElement);
  });

  it('disables the toggle of a disabled selectable chip', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <Chip defaultSelected disabled onSelectedChange={onSelectedChange}>
        Pizza
      </Chip>,
    );
    expect(toggle().hasAttribute('disabled')).toBe(true);
    await user.click(toggle());
    expect(onSelectedChange).not.toHaveBeenCalled();
  });
});
