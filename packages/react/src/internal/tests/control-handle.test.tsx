// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChipList, type ChipListElement } from '../../chip-list';
import { Input, type InputElement } from '../../input';
import { Textarea, type TextareaElement } from '../../textarea';

afterEach(cleanup);

describe('focus() and reset() through the ref', () => {
  it.each([
    ['Input', 'textbox'],
    ['Textarea', 'textbox'],
  ] as const)('%s: the ref is the element, focus() focuses it, reset() puts back the start text', async (name) => {
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
    const element = screen.getByRole('textbox');
    expect(handle).toBe(element);
    handle?.focus();
    expect(document.activeElement).toBe(element);
    await user.type(element, ' Lee');
    expect((element as HTMLInputElement).value).toBe('Ana Lee');
    onValueChange.mockClear();
    act(() => {
      handle?.reset();
    });
    expect((element as HTMLInputElement).value).toBe('Ana');
    expect(onValueChange).toHaveBeenCalledWith('Ana', expect.objectContaining({ reason: 'form-reset' }));
  });

  it('clears touched and dirty on reset', async () => {
    const user = userEvent.setup();
    const ref = createRef<InputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    await user.type(screen.getByRole('textbox'), 'x');
    await user.tab();
    expect(
      screen.getByRole('textbox').hasAttribute('data-touched') || document.querySelector('[data-touched]'),
    ).toBeTruthy();
    act(() => {
      ref.current?.reset();
    });
    expect(document.querySelector('[data-touched]')).toBeNull();
    expect(document.querySelector('[data-dirty]')).toBeNull();
  });

  it('lets a controlled Input follow reset through onValueChange', async () => {
    const user = userEvent.setup();
    const ref = createRef<InputElement>();
    function Controlled(): ReactElement {
      const [value, setValue] = useState('Ana');
      return (
        <Input
          ref={ref}
          aria-label="Name"
          value={value}
          onValueChange={(next) => {
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.type(screen.getByRole('textbox'), 'o');
    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('Anao');
    act(() => {
      ref.current?.reset();
    });
    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('Ana');
  });

  it('ChipList: focus() focuses the text box and reset() restores the start values and empties the text', async () => {
    const user = userEvent.setup();
    const ref = createRef<ChipListElement>();
    const onValueChange = vi.fn();
    render(<ChipList ref={ref} aria-label="Tags" defaultValue={['A']} onValueChange={onValueChange} />);
    ref.current?.focus();
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'B{Enter}C');
    expect(document.querySelectorAll('.cck-chip')).toHaveLength(2);
    onValueChange.mockClear();
    act(() => {
      ref.current?.reset();
    });
    expect(document.querySelectorAll('.cck-chip')).toHaveLength(1);
    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('');
    expect(onValueChange).toHaveBeenCalledWith(['A'], expect.objectContaining({ reason: 'form-reset' }));
  });
});
