// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type MouseEventHandler, type ReactElement, type RefCallback } from 'react';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Button, type ButtonProps, type ButtonRenderProps, type ButtonState } from '../index';
import { strict } from './fixtures';

afterEach(() => {
  cleanup();
  window.location.hash = '';
});

const link = (props: Partial<ButtonProps> = {}): ReactElement => (
  <Button nativeButton={false} render={<a href="#go" />} {...props}>
    Go
  </Button>
);

describe('Button (Tab and Shift+Tab)', () => {
  const sequence = async (ui: ReactElement, shift: boolean): Promise<(string | null)[]> => {
    const user = userEvent.setup();
    render(ui);
    const names: (string | null)[] = [];
    for (let step = 0; step < 3; step++) {
      await user.tab({ shift });
      names.push(document.activeElement?.textContent ?? null);
    }
    return names;
  };

  const enabled = (
    <>
      <button>first</button>
      {link()}
      <button>last</button>
    </>
  );

  it('moves through an enabled link forward and back', async () => {
    expect(await sequence(enabled, false)).toEqual(['first', 'Go', 'last']);
    cleanup();
    expect(await sequence(enabled, true)).toEqual(['last', 'Go', 'first']);
  });

  it('skips a disabled link and a disabled button forward and back', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>first</button>
        {link({ disabled: true })}
        <Button disabled>Off</Button>
        <button>last</button>
      </>,
    );
    await user.tab();
    await user.tab();
    expect(document.activeElement?.textContent).toBe('last');
    await user.tab({ shift: true });
    expect(document.activeElement?.textContent).toBe('first');
  });

  it('keeps the same keys in a right-to-left tree', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <div dir="rtl">
        <button>first</button>
        {link({ onClick })}
        <Button onClick={onClick}>Press</Button>
      </div>,
    );
    await user.tab();
    await user.tab();
    expect(document.activeElement?.textContent).toBe('Go');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(document.activeElement?.textContent).toBe('first');
    expect(screen.getByRole('link').hasAttribute('dir')).toBe(false);
  });
});

describe('Button (disabled changes on a mounted root)', () => {
  it('re-enables a mounted <button>: markers go, clicks run, updates fire none', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    const root = screen.getByRole('button');
    await user.click(root);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<Button onClick={onClick}>Go</Button>);
    expect(screen.getByRole('button')).toBe(root);
    expect(root.hasAttribute('disabled')).toBe(false);
    expect(root.hasAttribute('data-disabled')).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<Button onClick={onClick}>Go again</Button>);
    expect(onClick).not.toHaveBeenCalled();
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button disabled onClick={onClick}>
        Go again
      </Button>,
    );
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('re-enables a mounted link and restores activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(link({ disabled: true, onClick }));
    const root = screen.getByRole('link');
    await user.click(root);
    expect(onClick).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
    rerender(link({ onClick }));
    expect(screen.getByRole('link')).toBe(root);
    for (const name of ['aria-disabled', 'tabindex', 'data-disabled']) expect(root.hasAttribute(name)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    rerender(link({ onClick, className: 'changed' }));
    expect(onClick).not.toHaveBeenCalled();
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('#go');
    rerender(link({ onClick, disabled: true }));
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('tabindex')).toBe('-1');
    window.location.hash = '';
    await user.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe('');
  });
});

describe('Button (disabled-link guard order)', () => {
  const attach =
    (listener: (event: Event) => void): RefCallback<HTMLElement> =>
    (node) => {
      node?.addEventListener('click', listener);
    };

  it('runs before a native bubble listener added through the element ref', async () => {
    const listener = vi.fn();
    render(
      <Button nativeButton={false} disabled render={<a href="#go" ref={attach(listener)} />}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(listener).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
  });

  it('runs before a native bubble listener added through the Button ref', async () => {
    const listener = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(
      <Button nativeButton={false} disabled ref={attach(listener)} render={<a href="#go" />}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(listener).not.toHaveBeenCalled();
  });

  it('lets a native listener run on an enabled link', async () => {
    const listener = vi.fn();
    render(
      <Button nativeButton={false} render={<a href="#go" ref={attach(listener)} />}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(listener).toHaveBeenCalledOnce();
  });

  it('keeps the consumer capture veto in front of the guard', async () => {
    const listener = vi.fn();
    const onClick = vi.fn();
    render(
      <Button
        nativeButton={false}
        disabled
        onClick={onClick}
        onClickCapture={(event) => {
          event.preventDefault();
        }}
        render={<a href="#go" ref={attach(listener)} />}
      >
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(listener).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Button (render merging)', () => {
  it('fills the Button ref, the element ref and runs a callback ref cleanup', () => {
    const buttonRef = createRef<HTMLButtonElement>();
    const cleanup = vi.fn();
    const elementRef = vi.fn(() => cleanup);
    const { unmount } = render(
      strict(
        <Button ref={buttonRef} render={<button ref={elementRef} />}>
          Go
        </Button>,
      ),
    );
    const root = screen.getByRole('button');
    expect(buttonRef.current).toBe(root);
    expect(elementRef).toHaveBeenCalledWith(root);
    unmount();
    expect(cleanup).toHaveBeenCalled();
    expect(buttonRef.current).toBeNull();
  });

  it('joins class names and merges style, for both render forms', () => {
    render(
      <>
        <Button
          nativeButton={false}
          className="mine"
          style={{ color: 'red', margin: 1 }}
          render={<a href="#a" className="theirs" style={{ color: 'blue' }} />}
        >
          Element
        </Button>
        <Button
          nativeButton={false}
          className="mine"
          style={{ color: 'red', margin: 1 }}
          render={(props) => <a {...props} href="#b" />}
        >
          Function
        </Button>
      </>,
    );
    const element = screen.getByRole('link', { name: 'Element' });
    expect(element.className).toBe('cck-button mine theirs');
    expect(element.style.color).toBe('blue');
    expect(element.style.margin).toBe('1px');
    const fn = screen.getByRole('link', { name: 'Function' });
    expect(fn.className).toBe('cck-button mine');
    expect(fn.style.color).toBe('red');
  });

  it('passes the ButtonState to the function form', () => {
    const states: ButtonState[] = [];
    const ui = (disabled: boolean): ReactElement => (
      <Button
        disabled={disabled}
        render={(props, state) => {
          states.push(state);
          return <button {...props} data-state={String(state.disabled)} />;
        }}
      >
        Go
      </Button>
    );
    const { rerender } = render(ui(false));
    expect(screen.getByRole('button').getAttribute('data-state')).toBe('false');
    rerender(ui(true));
    expect(screen.getByRole('button').getAttribute('data-state')).toBe('true');
    expect(states.at(-1)).toEqual({ disabled: true });
  });

  it('keeps a value when the other side gives undefined', () => {
    render(
      <Button
        nativeButton={false}
        title="from the Button"
        aria-label={undefined}
        render={<a href="#go" title={undefined} aria-label="from the element" />}
      >
        Go
      </Button>,
    );
    const anchor = screen.getByRole('link');
    expect(anchor.getAttribute('title')).toBe('from the Button');
    expect(anchor.getAttribute('aria-label')).toBe('from the element');
    expect(anchor.className).toBe('cck-button');
  });

  it('gives the function form the native props it was given', () => {
    const received: ButtonRenderProps[] = [];
    render(
      <Button
        id="save"
        type="submit"
        tabIndex={2}
        aria-hidden
        render={(props) => {
          received.push(props);
          return <button {...props} />;
        }}
      >
        Go
      </Button>,
    );
    expect(received[0]).toMatchObject({ id: 'save', type: 'submit', tabIndex: 2, 'aria-hidden': true });
  });
});

describe('ButtonRenderProps (types)', () => {
  it('derives the native button props and types ref, disabled and onClick explicitly', () => {
    expectTypeOf<ButtonRenderProps['id']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ButtonRenderProps['type']>().toEqualTypeOf<'submit' | 'reset' | 'button' | undefined>();
    expectTypeOf<ButtonRenderProps['tabIndex']>().toEqualTypeOf<number | undefined>();
    expectTypeOf<ButtonRenderProps['form']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ButtonRenderProps['aria-label']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ButtonRenderProps['disabled']>().toEqualTypeOf<true | undefined>();
    expectTypeOf<ButtonRenderProps['ref']>().toEqualTypeOf<RefCallback<HTMLElement>>();
    expectTypeOf<ButtonRenderProps['onClick']>().toEqualTypeOf<MouseEventHandler<HTMLElement> | undefined>();
    expectTypeOf<ButtonRenderProps['data-x']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ButtonRenderProps>().not.toHaveProperty('color');
  });
});
