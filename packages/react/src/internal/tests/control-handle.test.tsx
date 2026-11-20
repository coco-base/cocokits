// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChipList, type ChipListElement } from '../../chip-list';
import { Input, type InputElement } from '../../input';
import { Textarea, type TextareaElement } from '../../textarea';

afterEach(cleanup);

describe('focus() and reset() through the ref', () => {
  it.each(['Input', 'Textarea'] as const)(
    '%s: the ref is the element, focus() focuses it, reset() keeps the text and tells nobody',
    async (name) => {
      const user = userEvent.setup();
      const input = createRef<InputElement>();
      const area = createRef<TextareaElement>();
      const onValueChange = vi.fn();
      render(
        name === 'Input' ? (
          <Input ref={input} aria-label="Name" defaultValue="Ana" onValueChange={onValueChange} />
        ) : (
          <Textarea ref={area} aria-label="Name" defaultValue="Ana" onValueChange={onValueChange} />
        ),
      );
      const handle = name === 'Input' ? input.current : area.current;
      const element = screen.getByRole<HTMLInputElement>('textbox');
      expect(handle).toBe(element);
      handle?.focus();
      expect(document.activeElement).toBe(element);
      await user.type(element, ' Lee');
      onValueChange.mockClear();
      act(() => {
        handle?.reset();
      });
      expect(element.value).toBe('Ana Lee');
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  it('clears touched and dirty on reset', async () => {
    const user = userEvent.setup();
    const ref = createRef<InputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    await user.type(screen.getByRole('textbox'), 'x');
    await user.tab();
    expect(document.querySelector('[data-touched]')).not.toBeNull();
    expect(document.querySelector('[data-dirty]')).not.toBeNull();
    act(() => {
      ref.current?.reset();
    });
    expect(document.querySelector('[data-touched]')).toBeNull();
    expect(document.querySelector('[data-dirty]')).toBeNull();
  });

  it.each(['Input', 'Textarea', 'ChipList'] as const)('%s: reset() clears submitted', (name) => {
    const ref = createRef<InputElement & TextareaElement & ChipListElement>();
    const control =
      name === 'Input' ? (
        <Input ref={ref} aria-label="Name" />
      ) : name === 'Textarea' ? (
        <Textarea ref={ref} aria-label="Name" />
      ) : (
        <ChipList ref={ref} aria-label="Name" />
      );
    const { container } = render(<form>{control}</form>);
    const form = container.querySelector('form');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    act(() => {
      form?.requestSubmit();
    });
    expect(container.querySelector('[data-submitted]')).not.toBeNull();
    act(() => {
      ref.current?.reset();
    });
    expect(container.querySelector('[data-submitted]')).toBeNull();
  });

  it('ChipList: focus() focuses the text box and reset() keeps values and text', async () => {
    const user = userEvent.setup();
    const ref = createRef<ChipListElement>();
    const onValueChange = vi.fn();
    render(<ChipList ref={ref} aria-label="Tags" defaultValue={['A']} onValueChange={onValueChange} />);
    ref.current?.focus();
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'B{Enter}C');
    onValueChange.mockClear();
    act(() => {
      ref.current?.reset();
    });
    expect(document.querySelectorAll('.cck-chip')).toHaveLength(2);
    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('C');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
