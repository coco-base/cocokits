// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toReactProps } from '../src/index';

afterEach(cleanup);

describe('toReactProps', () => {
  it('maps class and tabindex and keeps the other keys', () => {
    const props = toReactProps({ class: 'cck-button', tabindex: -1, 'aria-disabled': 'true', 'data-disabled': '' });
    expect(props).toEqual({ className: 'cck-button', tabIndex: -1, 'aria-disabled': 'true', 'data-disabled': '' });
  });

  it('maps readonly to readOnly, for to htmlFor and autocomplete to autoComplete', () => {
    const props = toReactProps({ readonly: true, for: 'email-control', autocomplete: 'off' });
    expect(props).toEqual({ readOnly: true, htmlFor: 'email-control', autoComplete: 'off' });
  });

  it('keeps absent keys absent', () => {
    expect(Object.keys(toReactProps({ class: 'cck-box' }))).toEqual(['className']);
  });

  it('exposes the live defaultPrevented and the prevent calls to the machine handler', () => {
    const seen: boolean[] = [];
    const props = toReactProps({
      onClick: (event: { defaultPrevented: boolean; preventDefault(): void }) => {
        seen.push(event.defaultPrevented);
        event.preventDefault();
        seen.push(event.defaultPrevented);
      },
    });
    const preventDefault = vi.fn();
    const event = { defaultPrevented: false, preventDefault, stopPropagation: vi.fn() };
    props.onClick(event);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(seen[0]).toBe(false);
  });

  it('makes stopImmediatePropagation stop React dispatch to the ancestors', () => {
    const ancestor = vi.fn();
    const own = vi.fn();
    const guard = toReactProps({
      onClick: (event: { stopImmediatePropagation(): void }) => {
        event.stopImmediatePropagation();
      },
    }).onClick;
    const { getByRole } = render(
      <div onClick={ancestor}>
        <a href="#go" onClick={guard}>
          Go
        </a>
        <a href="#next" onClick={own}>
          Next
        </a>
      </div>,
    );

    fireEvent.click(getByRole('link', { name: 'Go' }));
    expect(ancestor).not.toHaveBeenCalled();

    fireEvent.click(getByRole('link', { name: 'Next' }));
    expect(ancestor).toHaveBeenCalledOnce();
  });
});
