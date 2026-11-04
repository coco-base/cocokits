// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inputMeta } from '@cocokits/machines/input';
import { ThemeProvider } from '@cocokits/react-core';
import { Input, type InputChangeDetails } from '../index';
import { inputThemeConfig, strict } from './fixtures';

afterEach(cleanup);

const input = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

describe('Input rendering', () => {
  it('renders a native text input with the class and the type text, and nothing else', () => {
    render(strict(<Input data-testid="i" />));
    const element = screen.getByTestId('i');
    expect(element.tagName.toLowerCase()).toBe(inputMeta.defaultElements?.root);
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid', 'type']);
    expect(element.getAttribute('type')).toBe('text');
  });

  it.each(['text', 'email', 'password', 'search', 'tel', 'url'] as const)('renders type %s', (type) => {
    render(<Input data-testid="i" type={type} />);
    expect(screen.getByTestId('i').getAttribute('type')).toBe(type);
  });

  it('renders type text for a type outside the six text types', () => {
    // @ts-expect-error an untyped caller can pass any string
    render(<Input data-testid="i" type="checkbox" />);
    expect(screen.getByTestId('i').getAttribute('type')).toBe('text');
  });

  it('forwards ref to the input, joins className, merges style and passes native attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        data-testid="i"
        className="mine"
        style={{ color: 'red' }}
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={20}
      />,
    );
    const element = screen.getByTestId('i');
    expect(ref.current).toBe(element);
    expect(element.className).toBe('cck-input mine');
    expect(element.style.color).toBe('red');
    expect(element.getAttribute('placeholder')).toBe('you@example.com');
    expect(element.getAttribute('autocomplete')).toBe('email');
    expect(element.getAttribute('maxlength')).toBe('20');
  });

  it('puts the theme attribute of the input anatomy on the input', () => {
    render(
      <ThemeProvider themeConfig={inputThemeConfig}>
        <Input data-testid="i" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('i').getAttribute('data-probe')).toBe('on');
  });

  it('renders the state facts as native attributes and data-*', () => {
    render(<Input data-testid="i" disabled readOnly required pending />);
    const element = screen.getByTestId('i');
    expect(element.hasAttribute('disabled')).toBe(true);
    expect(element.hasAttribute('readonly')).toBe(true);
    expect(element.hasAttribute('required')).toBe(true);
    expect(element.hasAttribute('data-disabled')).toBe(true);
    expect(element.hasAttribute('data-readonly')).toBe(true);
    expect(element.hasAttribute('data-required')).toBe(true);
    expect(element.hasAttribute('data-pending')).toBe(true);
    expect(element.hasAttribute('data-invalid')).toBe(false);
  });

  it('renders native hidden', () => {
    render(<Input data-testid="i" hidden />);
    expect(screen.getByTestId('i').hidden).toBe(true);
  });

  it('writes aria-invalid only while invalid and touched or submitted, and data-invalid always', async () => {
    const { rerender } = render(<Input data-testid="i" invalid />);
    const element = screen.getByTestId('i');
    expect(element.hasAttribute('data-invalid')).toBe(true);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(element);
    await userEvent.tab();
    expect(element.getAttribute('aria-invalid')).toBe('true');
    expect(element.hasAttribute('data-touched')).toBe(true);
    rerender(<Input data-testid="i" invalid={false} />);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
  });

  it('keeps the facts of the machine over an author aria-invalid or data-* attribute', () => {
    render(<Input data-testid="i" aria-invalid data-invalid="x" data-filled="x" />);
    const element = screen.getByTestId('i');
    for (const name of ['aria-invalid', 'data-invalid', 'data-filled'])
      expect(element.hasAttribute(name), name).toBe(false);
  });

  it('lets touched, dirty and submitted given as props win over the internal facts', async () => {
    render(<Input data-testid="i" touched={false} dirty />);
    const element = screen.getByTestId('i');
    expect(element.hasAttribute('data-dirty')).toBe(true);
    await userEvent.click(element);
    await userEvent.tab();
    expect(element.hasAttribute('data-touched')).toBe(false);
  });

  it('tracks focus, touched, dirty and filled from the user', async () => {
    render(strict(<Input data-testid="i" />));
    const element = screen.getByTestId('i');
    await userEvent.click(element);
    expect(element.hasAttribute('data-focused')).toBe(true);
    await userEvent.keyboard('a');
    expect(element.hasAttribute('data-dirty')).toBe(true);
    expect(element.hasAttribute('data-filled')).toBe(true);
    await userEvent.tab();
    expect(element.hasAttribute('data-focused')).toBe(false);
    expect(element.hasAttribute('data-touched')).toBe(true);
    await userEvent.click(element);
    await userEvent.keyboard('{Backspace}');
    expect(element.hasAttribute('data-filled')).toBe(false);
  });
});

describe('Input value', () => {
  it('uncontrolled: starts from defaultValue, changes with typing and reports the user reason and the InputEvent', async () => {
    const calls: [string, InputChangeDetails][] = [];
    render(strict(<Input defaultValue="ab" onValueChange={(value, details) => calls.push([value, details])} />));
    expect(input().value).toBe('ab');
    expect(input().hasAttribute('data-filled')).toBe(true);
    await userEvent.type(input(), 'c');
    expect(input().value).toBe('abc');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.[0]).toBe('abc');
    expect(calls[0]?.[1].reason).toBe('user');
    expect(calls[0]?.[1].event).toBeInstanceOf(InputEvent);
  });

  it('fires the callback on every input event, composition included', () => {
    const onValueChange = vi.fn<(value: string) => void>();
    render(<Input onValueChange={onValueChange} />);
    fireEvent.compositionStart(input());
    fireEvent.input(input(), { target: { value: 'k' }, isComposing: true });
    fireEvent.input(input(), { target: { value: 'ki' }, isComposing: true });
    fireEvent.compositionEnd(input());
    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual(['k', 'ki']);
  });

  it('controlled: shows value, fires the callback and does not change itself', async () => {
    const onValueChange = vi.fn();
    render(strict(<Input value="fixed" onValueChange={onValueChange} />));
    await userEvent.type(input(), 'x');
    expect(onValueChange).toHaveBeenCalledWith('fixedx', expect.objectContaining({ reason: 'user' }));
    expect(input().value).toBe('fixed');
  });

  it('controlled: follows the parent and fires nothing when the parent writes', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Input value="a" onValueChange={onValueChange} />);
    rerender(<Input value="b" onValueChange={onValueChange} />);
    expect(input().value).toBe('b');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('controlled: a parent that accepts the change shows the typed text', async () => {
    function Parent(): ReactElement {
      const [text, setText] = useState('');
      return <Input value={text} onValueChange={setText} />;
    }
    render(strict(<Parent />));
    await userEvent.type(input(), 'hello');
    expect(input().value).toBe('hello');
  });

  it('renders null as the controlled empty value, with no data-filled', () => {
    const { rerender } = render(<Input value="x" />);
    expect(input().hasAttribute('data-filled')).toBe(true);
    rerender(<Input value={null} />);
    expect(input().value).toBe('');
    expect(input().hasAttribute('data-filled')).toBe(false);
  });

  it('shows data-filled in the commit after a write through the ref', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Input ref={ref} data-testid="i" />);
    act(() => {
      if (ref.current) ref.current.value = 'ref';
    });
    rerender(<Input ref={ref} data-testid="i" className="again" />);
    expect(input().hasAttribute('data-filled')).toBe(true);
    expect(input().value).toBe('ref');
  });

  it('keeps a value written through the ref across re-renders caused by focus, blur and typing elsewhere', async () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <>
        <Input ref={ref} aria-label="a" />
        <input aria-label="other" />
      </>,
    );
    act(() => {
      if (ref.current) ref.current.value = 'kept';
    });
    await userEvent.click(screen.getByLabelText('a'));
    await userEvent.click(screen.getByLabelText('other'));
    await userEvent.keyboard('zz');
    expect(ref.current?.value).toBe('kept');
  });

  it('composes the native onChange, onFocus and onBlur with its own handlers', async () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Input onChange={onChange} onFocus={onFocus} onBlur={onBlur} />);
    await userEvent.type(input(), 'a');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input().hasAttribute('data-touched')).toBe(true);
  });
});
