// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { textareaMeta } from '@cocokits/machines/textarea';
import { ThemeProvider } from '@cocokits/react-core';
import { Textarea, type TextareaChangeDetails } from '../index';
import { control as area, strict, textareaThemeConfig } from './fixtures';

afterEach(cleanup);

describe('Textarea rendering', () => {
  it('renders a native textarea with the class, no type and nothing else', () => {
    render(strict(<Textarea data-testid="t" />));
    const element = screen.getByTestId('t');
    expect(element.tagName.toLowerCase()).toBe(textareaMeta.defaultElements?.root);
    expect(element.getAttributeNames().sort()).toEqual(['class', 'data-testid']);
    expect(element.className).toBe('cck-textarea');
  });

  it('forwards ref, joins className, merges style and passes native attributes', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        ref={ref}
        data-testid="t"
        className="mine"
        style={{ color: 'red' }}
        rows={5}
        cols={30}
        wrap="hard"
        placeholder="Message"
        maxLength={200}
        spellCheck={false}
      />,
    );
    const element = screen.getByTestId('t');
    expect(ref.current).toBe(element);
    expect(element.className).toBe('cck-textarea mine');
    expect(element.style.color).toBe('red');
    const expected = {
      rows: '5',
      cols: '30',
      wrap: 'hard',
      placeholder: 'Message',
      maxlength: '200',
      spellcheck: 'false',
    };
    for (const [name, value] of Object.entries(expected)) expect(element.getAttribute(name), name).toBe(value);
  });

  it('renders no rows of its own, so the native default applies', () => {
    render(<Textarea data-testid="t" />);
    expect(screen.getByTestId('t').hasAttribute('rows')).toBe(false);
  });

  it('puts the theme attribute of the textarea anatomy on the textarea', () => {
    render(
      <ThemeProvider themeConfig={textareaThemeConfig}>
        <Textarea data-testid="t" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('t').getAttribute('data-probe')).toBe('on');
  });

  it('renders the state facts as native attributes and data-*, and the machine facts win over the author', () => {
    render(<Textarea data-testid="t" disabled readOnly required pending aria-invalid data-filled="x" />);
    const element = screen.getByTestId('t');
    const names = [
      'disabled',
      'readonly',
      'required',
      'data-disabled',
      'data-readonly',
      'data-required',
      'data-pending',
    ];
    for (const name of names) expect(element.hasAttribute(name), name).toBe(true);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
    expect(element.hasAttribute('data-filled')).toBe(false);
  });

  it('writes aria-invalid only while invalid and touched or submitted, and data-invalid always', async () => {
    render(<Textarea data-testid="t" invalid />);
    const element = screen.getByTestId('t');
    expect(element.hasAttribute('data-invalid')).toBe(true);
    expect(element.hasAttribute('aria-invalid')).toBe(false);
    await userEvent.click(element);
    await userEvent.tab();
    expect(element.getAttribute('aria-invalid')).toBe('true');
  });

  it('tracks focus, touched, dirty and filled from the user', async () => {
    render(strict(<Textarea data-testid="t" />));
    const element = screen.getByTestId('t');
    await userEvent.click(element);
    expect(element.hasAttribute('data-focused')).toBe(true);
    await userEvent.keyboard('a');
    expect(element.hasAttribute('data-dirty')).toBe(true);
    expect(element.hasAttribute('data-filled')).toBe(true);
    await userEvent.tab();
    expect(element.hasAttribute('data-touched')).toBe(true);
    expect(element.hasAttribute('data-focused')).toBe(false);
  });
});

describe('Textarea value', () => {
  it('is uncontrolled with defaultValue, the DOM holds the text and the callback gets the user reason', async () => {
    const onValueChange = vi.fn<(value: string, details: TextareaChangeDetails) => void>();
    render(strict(<Textarea defaultValue="ab" onValueChange={onValueChange} />));
    expect(area().value).toBe('ab');
    expect(area().hasAttribute('data-filled')).toBe(true);
    await userEvent.type(area(), 'c');
    expect(onValueChange).toHaveBeenCalledWith('abc', expect.objectContaining({ reason: 'user' }));
    const [, details] = onValueChange.mock.calls[0];
    expect(details.event).toBeInstanceOf(Event);
  });

  it('keeps a value written through the ref across renders', () => {
    const { rerender } = render(<Textarea defaultValue="" />);
    area().value = 'from ref';
    rerender(<Textarea defaultValue="" className="x" />);
    expect(area().value).toBe('from ref');
    expect(area().hasAttribute('data-filled')).toBe(true);
  });

  it('is controlled with value: a rejected change is restored and a parent write fires nothing', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Textarea value="fixed" onValueChange={onValueChange} />);
    await userEvent.type(area(), 'x');
    expect(area().value).toBe('fixed');
    expect(onValueChange).toHaveBeenCalledOnce();
    onValueChange.mockClear();
    rerender(<Textarea value="other" onValueChange={onValueChange} />);
    expect(area().value).toBe('other');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('renders null as the controlled empty value', () => {
    render(<Textarea value={null} />);
    expect(area().value).toBe('');
    expect(area().hasAttribute('data-filled')).toBe(false);
  });

  it('follows a parent that accepts the change', async () => {
    function Parent(): ReactElement {
      const [text, setText] = useState('');
      return <Textarea value={text} onValueChange={setText} />;
    }
    render(<Parent />);
    await userEvent.type(area(), 'hi');
    expect(area().value).toBe('hi');
  });

  it('inserts a line break on Enter and never submits the form', async () => {
    const onSubmit = vi.fn((event: { preventDefault(): void }) => {
      event.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Textarea />
        <button type="submit">Go</button>
      </form>,
    );
    await userEvent.type(area(), 'a{Enter}b');
    expect(area().value).toBe('a\nb');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows a CRLF model with LF, emits nothing and does not rewrite the DOM on a render', () => {
    const onValueChange = vi.fn();
    const model = 'a\r\nb\rc';
    const { rerender } = render(<Textarea value={model} onValueChange={onValueChange} />);
    expect(area().value).toBe('a\nb\nc');
    const writes = vi.spyOn(HTMLTextAreaElement.prototype, 'value', 'set');
    area().setSelectionRange(2, 2);
    rerender(<Textarea value={model} className="again" onValueChange={onValueChange} />);
    expect(writes).not.toHaveBeenCalled();
    expect(area().selectionStart).toBe(2);
    expect(onValueChange).not.toHaveBeenCalled();
    writes.mockRestore();
  });

  it('composes a native onChange before its own', async () => {
    const order: string[] = [];
    render(
      <Textarea
        onChange={() => {
          order.push('native');
        }}
        onValueChange={() => {
          order.push('value');
        }}
      />,
    );
    await userEvent.type(area(), 'a');
    expect(order).toEqual(['native', 'value']);
  });
});
